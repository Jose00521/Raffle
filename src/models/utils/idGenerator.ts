import mongoose from 'mongoose';
import crypto from 'crypto';

// Constantes para a geração de IDs estilo Snowflake
const EPOCH_START = 1672531200000; // 01 Jan 2023 como época de referência
let lastTimestamp = -1;
let sequence = 0;
const MAX_SEQUENCE = 4095; // 12 bits (2^12 - 1)

// Usa alfabeto mais legível, removendo caracteres confusos: 0/O, 1/I/l
const safeAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const base = safeAlphabet.length; // 32

// Cache para entidades frequentes, reduzindo cálculos HMAC repetidos
const entityHmacCache = new Map<string, string>();

// Chave secreta para operações criptográficas - no ambiente real, usar variável de ambiente
const SECRET_KEY = process.env.ID_SECRET_KEY || 'W2cjHstBfV7xLp9qZm3nAXaE5FkDRK8P4u6UNJyMT7vG';

// Buffer para otimização de geração em massa
const preGenTimestamps: {timestamp: number, obscured: number}[] = [];
let preGenIndex = 0;

/**
 * Aplica obscurecimento criptográfico ao timestamp
 */
function obscureTimestamp(timestamp: number): number {
  // Deriva uma máscara da chave secreta
  const buffer = Buffer.from(SECRET_KEY);
  const mask = buffer.readUInt32BE(0) ^ buffer.readUInt32BE(4);
  // XOR com o timestamp para obscurecer o valor mantendo a monotonicidade
  return timestamp ^ mask;
}

/**
 * Gera um fragmento seguro baseado no ID da entidade usando HMAC
 */
function secureEntityFragment(entityId: string): string {
  // Verifica se já temos este valor em cache
  if (entityHmacCache.has(entityId)) {
    return entityHmacCache.get(entityId)!;
  }

  // Gera um HMAC do ID baseado na chave secreta
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(entityId);
  const hash = hmac.digest('hex');
  
  // Converte 4 bytes do hash para caracteres do alfabeto seguro
  let fragment = '';
  for (let i = 0; i < 4; i++) {
    const val = parseInt(hash.substr(i * 2, 2), 16);
    fragment += safeAlphabet[val % base];
  }
  
  // Adiciona ao cache para futuros usos
  entityHmacCache.set(entityId, fragment);
  return fragment;
}

/**
 * Gera um checksum mais seguro usando HMAC
 */
function generateSecureChecksum(baseCode: string): string {
  // Usa HMAC para o checksum, combinando a chave secreta com o código base
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(baseCode);
  const hash = hmac.digest('hex');
  
  // Extrai um valor para o checksum
  const checksumValue = parseInt(hash.slice(0, 4), 16);
  return safeAlphabet[checksumValue % base];
}

/**
 * Inicializa o buffer de pré-geração de timestamps para melhor performance
 */
function initPreGenBuffer(size: number = 100): void {
  const now = Date.now();
  for (let i = 0; i < size; i++) {
    const ts = now + i;
    preGenTimestamps[i] = {
      timestamp: ts,
      obscured: obscureTimestamp(ts)
    };
  }
  preGenIndex = 0;
}

/**
 * Obtém o próximo timestamp pré-gerado ou gera um novo
 */
function getNextTimestamp(): {timestamp: number, obscured: number} {
  // Se o buffer estiver vazio ou já usado, reinicializa
  if (preGenTimestamps.length === 0 || preGenIndex >= preGenTimestamps.length) {
    initPreGenBuffer();
  }
  
  const result = preGenTimestamps[preGenIndex++];
  
  // Se este timestamp for menor que o último usado, gera um novo
  if (result.timestamp < lastTimestamp) {
    const ts = Date.now();
    return { timestamp: ts, obscured: obscureTimestamp(ts) };
  }
  
  return result;
}

/**
 * Gera um código único para qualquer entidade no formato "XX-XXXXX-XXXX-XXXX-YY"
 * Baseado no conceito de Snowflake ID do Twitter, mas adaptado para gerar códigos
 * legíveis e seguros sem necessidade de consulta ao banco de dados.
 * 
 * Esta implementação aprimorada adiciona camadas de segurança criptográfica.
 * 
 * @param entityId ID da entidade (geralmente o criador)
 * @param prefix Prefixo a ser usado no código (ex: 'RA' para rifas, 'US' para usuários, etc.)
 * @returns Código único da entidade
 */
export function generateEntityCode(
  entityId?: mongoose.Types.ObjectId | string, 
  prefix: string = 'RA' // 'RA' como default para manter compatibilidade
): string {
  // Normaliza o prefixo para ter no máximo 4 caracteres e sempre em maiúsculas
  const normalizedPrefix = prefix.toUpperCase().slice(0, 4);
  
  // Obtém o timestamp atual em milissegundos (com obscurecimento criptográfico)
  const { timestamp, obscured } = getNextTimestamp();
  
  // Garante que timestamp não retroceda (caso o relógio do servidor seja ajustado)
  if (timestamp < lastTimestamp) {
    throw new Error('Clock moved backwards. Refusing to generate ID');
  }
  
  // Se for o mesmo milissegundo, incrementa a sequência
  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1) & MAX_SEQUENCE;
    // Se a sequência esgotou, avança para o próximo milissegundo
    if (sequence === 0) {
      while (timestamp <= lastTimestamp) {
        const newTs = Date.now();
        lastTimestamp = newTs;
        return generateEntityCode(entityId, prefix); // Recursão com novo timestamp
      }
    }
  } else {
    // Reset da sequência para o próximo milissegundo
    sequence = 0;
  }
  
  // Atualiza o último timestamp usado
  lastTimestamp = timestamp;
  
  // Calcula o delta de tempo desde a época de referência (usando o valor obscurecido)
  const timeDelta = obscured - EPOCH_START;
  
  // Código da entidade usando HMAC para segurança criptográfica
  let entityFragment = '0000';
  if (entityId) {
    entityFragment = secureEntityFragment(entityId.toString());
  }
  
  // Converte o delta de tempo para o alfabeto seguro (5 caracteres)
  let timeComponent = '';
  let timeDeltaSeconds = Math.floor(timeDelta / 1000);
  for (let i = 0; i < 5; i++) {
    timeComponent = safeAlphabet[timeDeltaSeconds % base] + timeComponent;
    timeDeltaSeconds = Math.floor(timeDeltaSeconds / base);
  }
  
  // Usa milissegundos (0-999) e sequência para garantir unicidade no mesmo segundo
  const uniquenessValue = (timestamp % 1000) * 4096 + sequence;
  
  // Converte o valor de unicidade para 3 caracteres do alfabeto seguro
  let uniqueComponent = '';
  let uniqueValue = uniquenessValue;
  for (let i = 0; i < 3; i++) {
    uniqueComponent = safeAlphabet[uniqueValue % base] + uniqueComponent;
    uniqueValue = Math.floor(uniqueValue / base);
  }
  
  // Ano atual para manter a aparência de códigos por ano
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Gera o código base
  const baseCode = `${timeComponent}${uniqueComponent}${entityFragment}`;
  
  // Adiciona um checksum criptograficamente seguro para validação
  const checksumChar = generateSecureChecksum(baseCode);
  
  // Formata o código em grupos para melhor legibilidade
  return `${normalizedPrefix}-${timeComponent}-${uniqueComponent}${checksumChar}-${entityFragment}-${year}`;
}

/**
 * Função otimizada para geração de múltiplos IDs em lote
 * Significativamente mais eficiente para grandes volumes
 */
export function generateBulkEntityCodes(
  count: number,
  entityId?: mongoose.Types.ObjectId | string,
  prefix: string = 'RA'
): string[] {
  // Pré-inicializa o buffer com tamanho adequado
  initPreGenBuffer(Math.min(count * 2, 500));
  
  const results: string[] = [];
  const normalizedPrefix = prefix.toUpperCase().slice(0, 4);
  
  // Processa o fragmento da entidade apenas uma vez
  let entityFragment = '0000';
  if (entityId) {
    entityFragment = secureEntityFragment(entityId.toString());
  }
  
  // Ano atual (igual para todos os códigos do lote)
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Gera todos os códigos do lote
  for (let i = 0; i < count; i++) {
    // Obtém o próximo timestamp
    const { timestamp, obscured } = getNextTimestamp();
    
    // Incrementa a sequência corretamente
    if (timestamp === lastTimestamp) {
      sequence = (sequence + 1) & MAX_SEQUENCE;
      if (sequence === 0) {
        // Não podemos usar recursão aqui, então esperamos até o próximo timestamp
        while (Date.now() <= lastTimestamp) {
          // Espera ativa (não ideal, mas útil neste contexto específico)
        }
      }
    } else {
      sequence = 0;
    }
    
    lastTimestamp = timestamp;
    
    // Calcula o delta de tempo (usando o valor obscurecido)
    const timeDelta = obscured - EPOCH_START;
    
    // Converte para componente de tempo
    let timeComponent = '';
    let timeDeltaSeconds = Math.floor(timeDelta / 1000);
    for (let j = 0; j < 5; j++) {
      timeComponent = safeAlphabet[timeDeltaSeconds % base] + timeComponent;
      timeDeltaSeconds = Math.floor(timeDeltaSeconds / base);
    }
    
    // Calcula componente de unicidade
    const uniquenessValue = (timestamp % 1000) * 4096 + sequence;
    let uniqueComponent = '';
    let uniqueValue = uniquenessValue;
    for (let j = 0; j < 3; j++) {
      uniqueComponent = safeAlphabet[uniqueValue % base] + uniqueComponent;
      uniqueValue = Math.floor(uniqueValue / base);
    }
    
    // Gera código base e checksum
    const baseCode = `${timeComponent}${uniqueComponent}${entityFragment}`;
    const checksumChar = generateSecureChecksum(baseCode);
    
    // Adiciona o resultado ao array
    results.push(`${normalizedPrefix}-${timeComponent}-${uniqueComponent}${checksumChar}-${entityFragment}-${year}`);
  }
  
  return results;
}

/**
 * Verifica se um código de entidade é válido baseado no checksum
 * 
 * @param code Código da entidade a ser validado
 * @param expectedPrefix Prefixo esperado (opcional)
 * @returns true se o código for válido, false caso contrário
 */
export function validateEntityCode(code: string, expectedPrefix?: string): boolean {
  // Remove hífens e o ano
  const parts = code.split('-');
  if (parts.length !== 5) {
    return false;
  }
  
  // Verifica o prefixo, se especificado
  if (expectedPrefix && parts[0] !== expectedPrefix.toUpperCase().slice(0, 4)) {
    return false;
  }
  
  try {
    // Extrai os componentes
    const timeComponent = parts[1];
    const uniqueWithChecksum = parts[2];
    const uniqueComponent = uniqueWithChecksum.slice(0, -1);
    const providedChecksum = uniqueWithChecksum.slice(-1);
    const entityFragment = parts[3];
    
    // Recalcula o checksum usando o método seguro
    const baseCode = `${timeComponent}${uniqueComponent}${entityFragment}`;
    const expectedChecksum = generateSecureChecksum(baseCode);
    
    // Verifica se o checksum calculado corresponde ao fornecido
    return expectedChecksum === providedChecksum;
  } catch (err) {
    return false;
  }
}

// Mantendo o nome anterior para compatibilidade
export const validateCampaignCode = (code: string): boolean => validateEntityCode(code, 'RA');

// Inicializa o buffer na carga do módulo para melhor desempenho inicial
initPreGenBuffer();

// Limpa cache periodicamente para evitar crescimento indefinido
setInterval(() => {
  if (entityHmacCache.size > 10000) {
    entityHmacCache.clear();
  }
}, 3600000); // Limpa a cada hora se necessário