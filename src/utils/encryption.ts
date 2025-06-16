import crypto from 'crypto';

/**
 * Sistema de criptografia AES-256-GCM para dados sensíveis
 * Padrão usado por bancos e fintechs
 */

// Algoritmo padrão
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para AES, sempre 16 bytes
const SALT_LENGTH = 32; // Para derivação de chave
const TAG_LENGTH = 16; // Para autenticação GCM

/**
 * Interface para dados criptografados
 */
interface EncryptedData {
  encrypted: string;      // Dados criptografados em base64
  iv: string;            // Vetor de inicialização
  tag: string;           // Tag de autenticação GCM
  keyVersion: string;    // Versão da chave usada
  aad?: string;          // Additional Authenticated Data (opcional)
}

/**
 * Estratégias de criptografia por versão
 */
const encryptionStrategies = {
  v1: {
    version: 'v1',
    encrypt(plaintext: string, dataType?: string): EncryptedData {
      const key = getKeyForVersion(this.version);
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      // AAD automático baseado no tipo de dado
      if (dataType) {
        const aad = `raffle-system:${dataType}:${this.version}`;
        cipher.setAAD(Buffer.from(aad, 'utf8'));
      }
      
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        keyVersion: this.version,
        aad: dataType ? `raffle-system:${dataType}:${this.version}` : undefined
      };
    },
    
    decrypt(encryptedData: EncryptedData): string {
      if (!encryptedData?.encrypted || !encryptedData?.iv || !encryptedData?.tag) {
        throw new Error('Dados criptografados incompletos');
      }

      const key = getKeyForVersion(this.version);
      const iv = Buffer.from(encryptedData.iv, 'base64');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      
      // Aplicar AAD se existir
      if (encryptedData.aad) {
        decipher.setAAD(Buffer.from(encryptedData.aad, 'utf8'));
      }
      
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    }
  }
  // v2: será adicionado quando necessário
};

/**
 * Gera chave derivada para versão específica
 */
function getKeyForVersion(version: string): Buffer {
  const keyEnvVar = version === 'v1' 
    ? 'ENCRYPTION_MASTER_KEY'
    : `ENCRYPTION_MASTER_KEY_${version.toUpperCase()}`;
    
  const masterKey = process.env[keyEnvVar] || process.env.ENCRYPTION_MASTER_KEY || 'default-key-change-in-production-must-be-32-characters-long';
  
  console.log('🔧 MASTER KEY USADA:', masterKey);
  console.log('🔧 VERSÃO:', version);
  console.log('🔧 USANDO ENV?', !!process.env.ENCRYPTION_MASTER_KEY);
  
  const salt = crypto.createHash('sha256').update(`raffle-salt-${version}`).digest();
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
}

/**
 * Serviço de criptografia com versionamento
 */
export class EncryptionService {
  
  /**
   * Criptografa dados usando a versão atual
   */
  static encrypt(plaintext: string, dataType?: string): EncryptedData {
    if (!plaintext) {
      throw new Error('Texto para criptografar não pode estar vazio');
    }
    
    const version = process.env.ENCRYPTION_VERSION || 'v1';
    const strategy = encryptionStrategies[version as keyof typeof encryptionStrategies];
    
    if (!strategy) {
      throw new Error(`Versão de criptografia não suportada: ${version}`);
    }
    
    return strategy.encrypt(plaintext, dataType);
  }
  
  /**
   * Descriptografa dados usando a versão correta automaticamente
   */
  static decrypt(encryptedData: EncryptedData): string {
    try {
      console.log('encryptedData', encryptedData);
      const version = encryptedData.keyVersion || 'v1';
      const strategy = encryptionStrategies[version as keyof typeof encryptionStrategies];
      
      if (!strategy) {
        throw new Error(`Versão de criptografia não suportada: ${version}`);
      }
      
      return strategy.decrypt(encryptedData);
    } catch (error) {
      console.error('❌ ERRO NA DESCRIPTOGRAFIA:', error);
      console.error('📊 Dados recebidos:', JSON.stringify(encryptedData, null, 2));
      throw error;
    }
  }
}

/**
 * Utilitários para dados específicos
 */
export class SecureDataUtils {
  /**
   * Criptografa CPF com contexto AAD
   */
  static encryptCPF(cpf: string): EncryptedData {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF inválido para criptografia');
    }
    return EncryptionService.encrypt(cleanCpf, 'cpf');
  }
  
  /**
   * Descriptografa CPF
   */
  static decryptCPF(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }

  /**
   * Criptografa CNPJ com contexto AAD
   */
  static encryptCNPJ(cnpj: string): EncryptedData {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ inválido para criptografia');
    }
    return EncryptionService.encrypt(cleanCnpj, 'cnpj');
  }
  
  /**
   * Descriptografa CNPJ
   */
  static decryptCNPJ(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }

  /**
   * Cria hash irreversível para CPF/CNPJ (só números)
   */
  static hashDocument(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    return crypto.createHash('sha256')
      .update(cleanValue + (process.env.SEARCH_HASH_SALT || 'default-salt'))
      .digest('hex');
  }

  /**
   * Cria hash específico para EMAIL
   */
  static hashEmail(email: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return crypto.createHash('sha256')
      .update(normalizedEmail + (process.env.SEARCH_HASH_SALT || 'default-salt'))
      .digest('hex');
  } 

  /**
   * Cria hash específico para TELEFONE
   */
  static hashPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    return crypto.createHash('sha256')
      .update(cleanPhone + (process.env.SEARCH_HASH_SALT || 'default-salt'))
      .digest('hex');
  }
  
  /**
   * Criptografa email com contexto AAD
   */
  static encryptEmail(email: string): EncryptedData {
    const normalizedEmail = email.toLowerCase().trim();
    return EncryptionService.encrypt(normalizedEmail, 'email');
  }
  
  /**
   * Criptografa telefone com contexto AAD
   */
  static encryptPhone(phone: string): EncryptedData {
    const cleanPhone = phone.replace(/\D/g, '');
    return EncryptionService.encrypt(cleanPhone, 'phone');
  }
  
  // ===== FUNÇÕES DE CRIPTOGRAFIA PARA ENDEREÇO =====
  
  /**
   * Criptografa rua/logradouro com contexto AAD
   */
  static encryptStreet(street: string): EncryptedData {
    if (!street) {
      throw new Error('Rua não pode estar vazia para criptografia');
    }
    const normalizedStreet = street.trim();
    return EncryptionService.encrypt(normalizedStreet, 'street');
  }
  
  /**
   * Descriptografa rua/logradouro
   */
  static decryptStreet(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }
  
  /**
   * Criptografa número do endereço com contexto AAD
   */
  static encryptNumber(number: string): EncryptedData {
    if (!number) {
      throw new Error('Número não pode estar vazio para criptografia');
    }
    const normalizedNumber = number.toString().trim();
    return EncryptionService.encrypt(normalizedNumber, 'number');
  }
  
  /**
   * Descriptografa número do endereço
   */
  static decryptNumber(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }
  
  /**
   * Criptografa complemento com contexto AAD
   */
  static encryptComplement(complement: string): EncryptedData {
    if (!complement) {
      throw new Error('Complemento não pode estar vazio para criptografia');
    }
    const normalizedComplement = complement.trim();
    return EncryptionService.encrypt(normalizedComplement, 'complement');
  }
  
  /**
   * Descriptografa complemento
   */
  static decryptComplement(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }
  
  /**
   * Criptografa CEP com contexto AAD
   */
  static encryptZipCode(zipCode: string): EncryptedData {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    if (cleanZipCode.length !== 8) {
      throw new Error('CEP inválido para criptografia');
    }
    return EncryptionService.encrypt(cleanZipCode, 'zipcode');
  }
  
  /**
   * Descriptografa CEP
   */
  static decryptZipCode(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }
  
  /**
   * Cria hash específico para CEP (para busca por região)
   */
  static hashZipCode(zipCode: string): string {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    return crypto.createHash('sha256')
      .update(cleanZipCode + (process.env.SEARCH_HASH_SALT || 'default-salt'))
      .digest('hex');
  }
}

// Remover inicialização automática no final
console.log('[ENCRYPTION] Simplified service ready'); 