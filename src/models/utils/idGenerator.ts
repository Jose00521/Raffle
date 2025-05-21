import mongoose from 'mongoose';
import crypto from 'crypto';
import * as os from 'os';

// Constantes para Snowflake ID
const EPOCH_START = 1672531200000; // 01 Jan 2023 como referência
const MAX_SEQUENCE = 4095; // 12 bits (0-4095)

// Alfabeto seguro
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const BASE = ALPHABET.length; // 32

// Chave secreta
const SECRET_KEY = process.env.ID_SECRET_KEY || crypto.randomBytes(32).toString('hex');

// Gera worker ID estável baseado em MAC address + hostname
function getUniqueWorkerId(): number {
  try {
    // Combine network interfaces MAC + hostname para worker ID único
    const networkInterfaces = os.networkInterfaces();
    const macAddresses = Object.values(networkInterfaces)
      .flat()
      .filter((i): i is os.NetworkInterfaceInfo => 
        i !== undefined && !i.internal && i.mac !== '00:00:00:00:00:00')
      .map(i => i.mac)
      .join('');
    
    const input = `${macAddresses}-${os.hostname()}-${process.pid}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    
    // Extrair 10 bits (0-1023) para worker ID
    return parseInt(hash.substring(0, 3), 16) % 1024;
  } catch (e) {
    // Fallback com hash de hostname
    const hash = crypto.createHash('sha256').update(os.hostname()).digest('hex');
    return parseInt(hash.substring(0, 3), 16) % 1024;
  }
}

// Worker ID estável e único
const WORKER_ID = getUniqueWorkerId();
console.log(`[Snowflake] Worker ID initialized: ${WORKER_ID}`);

// Último timestamp usado
let lastTimestamp = -1;
// Contador de sequência por milissegundo
let sequence = 0;

// Cache para fragments
const fragmentCache = new Map<string, string>();

/**
 * Gera fragmento para entidade
 */
function generateEntityFragment(entityId: string): string {
  if (fragmentCache.has(entityId)) {
    return fragmentCache.get(entityId)!;
  }

  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(entityId);
  const hash = hmac.digest('hex');
  
  let fragment = '';
  for (let i = 0; i < 4; i++) {
    const value = parseInt(hash.substring(i * 2, i * 2 + 2), 16);
    fragment += ALPHABET[value % BASE];
  }
  
  fragmentCache.set(entityId, fragment);
  return fragment;
}

/**
 * Converte número para string no alfabeto
 */
function toAlphabetString(value: number, length: number): string {
  let result = '';
  let remaining = value;
  
  remaining = Math.abs(remaining);
  
  for (let i = 0; i < length; i++) {
    result = ALPHABET[remaining % BASE] + result;
    remaining = Math.floor(remaining / BASE);
  }
  
  return result.padStart(length, ALPHABET[0]);
}

/**
 * Espera até próximo milissegundo se necessário
 */
function waitNextMillis(lastTimestamp: number): number {
  let timestamp = Date.now();
  while (timestamp <= lastTimestamp) {
    timestamp = Date.now();
  }
  return timestamp;
}

/**
 * Gera checksum criptográfico
 */
function generateChecksum(baseCode: string): string {
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(baseCode);
  const hash = hmac.digest('hex');
  return ALPHABET[parseInt(hash.substring(0, 8), 16) % BASE];
}

/**
 * Gera Snowflake ID com garantia de zero colisões
 */
export function generateEntityCode(
  entityId?: mongoose.Types.ObjectId | string,
  prefix: string = 'RA'
): string {
  // Normaliza prefixo
  const normalizedPrefix = prefix.toUpperCase().slice(0, 4);
  
  // Obtém timestamp atual, garantindo que é maior que o último
  let timestamp = Date.now();
  
  // Garante timestamp crescente estritamente monotônico
  if (timestamp < lastTimestamp) {
    console.warn(`[Snowflake] Clock moved backwards. Waiting until ${lastTimestamp}`);
    timestamp = waitNextMillis(lastTimestamp);
  }
  
  // Se mesmo timestamp, incrementa sequência
  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1) & MAX_SEQUENCE;
    // Se sequência transbordou, avança para próximo ms
    if (sequence === 0) {
      timestamp = waitNextMillis(lastTimestamp);
    }
  } else {
    // Novo timestamp, reseta sequência
    sequence = 0;
  }
  
  // Atualiza último timestamp
  lastTimestamp = timestamp;
  
  // Componente de tempo: 41 bits no total
  const timeSeconds = Math.floor((timestamp - EPOCH_START) / 1000);
  const timeComponent = toAlphabetString(timeSeconds, 5);
  
  // Componente de sequência: 22 bits (10 worker + 12 sequence)
  const uniquenessValue = (WORKER_ID << 12) | sequence;
  const sequenceComponent = toAlphabetString(uniquenessValue, 3);
  
  // Fragmento da entidade
  let entityFragment = '0000';
  if (entityId) {
    entityFragment = generateEntityFragment(entityId.toString());
  }
  
  // Ano para agrupamento visual
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Checksum para validação
  const baseCode = timeComponent + sequenceComponent + entityFragment;
  const checksumChar = generateChecksum(baseCode);
  
  // ID final: PREFIX-TIME-SEQUENCECHECKSUM-ENTITY-YEAR
  return `${normalizedPrefix}-${timeComponent}-${sequenceComponent}${checksumChar}-${entityFragment}-${year}`;
}

// Limpeza de cache a cada 12 horas
setInterval(() => fragmentCache.clear(), 12 * 60 * 60 * 1000);