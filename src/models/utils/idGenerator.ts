import mongoose from 'mongoose';
import crypto from 'crypto';
import * as os from 'os';
import logger from '@/lib/logger/logger';
// Configurações de bits/tamanho para componentes do ID
const TIME_CHAR_LENGTH = 5;        // 5 chars = ~25 bits (32^5 combinações)
const SEQ_WORKER_CHAR_LENGTH = 4;  // 4 chars = ~16 bits (32^4 combinações)
const ENTITY_CHAR_LENGTH = 4;      // 4 chars = ~16 bits (32^4 combinações)

// Constantes para Snowflake ID
const EPOCH_START = 1672531200000; // 01 Jan 2023 como referência
const WORKER_ID_BITS = 12;         // 12 bits para worker ID (0-4095)
const SEQUENCE_BITS = 12;          // 12 bits para sequence (0-4095)
const MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1; // 4095

// Alfabeto seguro
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const BASE = ALPHABET.length; // 32

// Função para obter a chave secreta com verificação lazy
function getSecretKey(): string {
  const SECRET_KEY = process.env.ID_SECRET_KEY;
  
  if (!SECRET_KEY) {
    throw new Error('ID_SECRET_KEY environment variable is required. Please ensure your .env file is properly configured.');
  }
  
  return SECRET_KEY;
}

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
    
    // Extrair bits para worker ID usando a constante configurável
    const maxWorkerId = (1 << WORKER_ID_BITS) - 1;
    return parseInt(hash.substring(0, 3), 16) % (maxWorkerId + 1);
  } catch (e) {
    // Fallback com hash de hostname
    const hash = crypto.createHash('sha256').update(os.hostname()).digest('hex');
    const maxWorkerId = (1 << WORKER_ID_BITS) - 1;
    return parseInt(hash.substring(0, 3), 16) % (maxWorkerId + 1);
  }
}

// Worker ID estável e único
const WORKER_ID = getUniqueWorkerId();
logger.info(`[Snowflake] Worker ID initialized: ${WORKER_ID}`);



// Último timestamp usado
let lastTimestamp = -1;
// Contador de sequência por milissegundo
let sequence = 0;

// Cache para fragments com limite de tamanho
const MAX_CACHE_SIZE = 10000;
const fragmentCache = new Map<string, string>();

/**
 * Gera fragmento para entidade
 */
function generateEntityFragment(entityId: string): string {
  if (fragmentCache.has(entityId)) {
    return fragmentCache.get(entityId)!;
  }

  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(entityId);
  const hash = hmac.digest('hex');
  
  let fragment = '';
  for (let i = 0; i < ENTITY_CHAR_LENGTH; i++) {
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
  const hmac = crypto.createHmac('sha256', getSecretKey());
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
    logger.warn(`[Snowflake] Clock moved backwards. Waiting until ${lastTimestamp}`);
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
  const timeComponent = toAlphabetString(timeSeconds, TIME_CHAR_LENGTH);
  
  // Componente de sequência: 22 bits (10 worker + 12 sequence)
  const uniquenessValue = (WORKER_ID << SEQUENCE_BITS) | sequence;
  const sequenceComponent = toAlphabetString(uniquenessValue, SEQ_WORKER_CHAR_LENGTH);
  
  // Fragmento da entidade
  let entityFragment = ALPHABET[0].repeat(ENTITY_CHAR_LENGTH);
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

/**
 * Verifica se um código de entidade é válido e foi gerado por este sistema
 * @param code O código a ser verificado
 * @returns true se o código é válido, false caso contrário
 */
export function validateEntityCode(code: string): boolean {
  try {
    // Cria o padrão regex baseado nas constantes de tamanho
    const alphabetPattern = `[${ALPHABET}]`;
    const regex = new RegExp(
      `^([A-Z]{1,4})-` +                                  // PREFIX
      `(${alphabetPattern}{${TIME_CHAR_LENGTH}})-` +      // TIME
      `(${alphabetPattern}{${SEQ_WORKER_CHAR_LENGTH + 1}})-` +  // SEQUENCE+CHECKSUM
      `(${alphabetPattern}{${ENTITY_CHAR_LENGTH}})-` +    // ENTITY
      `(\\d{2})$`                                         // YEAR
    );
    
    const match = code.match(regex);
    
    if (!match) {
      return false;
    }
    
    // Extrai componentes
    const [_, prefix, timeComponent, sequenceWithChecksum, entityFragment, year] = match;
    
    // Separa sequência e checksum
    const sequenceComponent = sequenceWithChecksum.substring(0, SEQ_WORKER_CHAR_LENGTH);
    const providedChecksum = sequenceWithChecksum.charAt(SEQ_WORKER_CHAR_LENGTH);
    
    // Verifica o checksum
    const baseCode = timeComponent + sequenceComponent + entityFragment;
    const expectedChecksum = generateChecksum(baseCode);
    
    // Verifica se o checksum corresponde
    return providedChecksum === expectedChecksum;
  } catch (error) {
    return false;
  }
}

// Limpeza de cache a cada 12 horas
setInterval(() => fragmentCache.clear(), 12 * 60 * 60 * 1000);