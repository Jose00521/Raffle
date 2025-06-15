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
}

/**
 * Serviço simplificado de criptografia
 */
export class EncryptionService {
  private static masterKey: string = process.env.ENCRYPTION_MASTER_KEY || 'default-key-change-in-production-must-be-32-characters-long';
  
  /**
   * Gera chave derivada
   */
  private static getKey(): Buffer {
    console.log('🔧 ENV KEY:', process.env.ENCRYPTION_MASTER_KEY);
    console.log('🔧 THIS KEY:', this.masterKey);
    console.log('🔧 SÃO IGUAIS?', process.env.ENCRYPTION_MASTER_KEY === this.masterKey);
    
    const salt = crypto.createHash('sha256').update('raffle-salt').digest();
    return crypto.pbkdf2Sync(this.masterKey, salt, 100000, 32, 'sha256');
  }
  
  /**
   * Criptografa dados
   */
  static encrypt(plaintext: string): EncryptedData {
    if (!plaintext) {
      throw new Error('Texto para criptografar não pode estar vazio');
    }
    
    const key = this.getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyVersion: 'v1'
    };
  }
  
  /**
   * Descriptografa dados
   */
  static decrypt(encryptedData: EncryptedData): string {
    try {
      if (!encryptedData?.encrypted || !encryptedData?.iv || !encryptedData?.tag) {
        throw new Error('Dados criptografados incompletos');
      }

      const key = this.getKey();
      const iv = Buffer.from(encryptedData.iv, 'base64');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
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
   * Criptografa CPF
   */
  static encryptCPF(cpf: string): EncryptedData {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF inválido para criptografia');
    }
    return EncryptionService.encrypt(cleanCpf);
  }
  
  /**
   * Descriptografa CPF
   */
  static decryptCPF(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }

  /**
   * Criptografa CNPJ
   */
  static encryptCNPJ(cnpj: string): EncryptedData {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ inválido para criptografia');
    }
    return EncryptionService.encrypt(cleanCnpj);
  }
  
  /**
   * Descriptografa CNPJ
   */
  static decryptCNPJ(encryptedData: EncryptedData): string {
    return EncryptionService.decrypt(encryptedData);
  }

  /**
   * Cria hash irreversível para busca
   */
  static hashForSearch(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    return crypto.createHash('sha256')
      .update(cleanValue + (process.env.SEARCH_HASH_SALT || 'default-salt'))
      .digest('hex');
  }
  
  /**
   * Criptografa email
   */
  static encryptEmail(email: string): EncryptedData {
    const normalizedEmail = email.toLowerCase().trim();
    return EncryptionService.encrypt(normalizedEmail);
  }
  
  /**
   * Criptografa telefone
   */
  static encryptPhone(phone: string): EncryptedData {
    const cleanPhone = phone.replace(/\D/g, '');
    return EncryptionService.encrypt(cleanPhone);
  }
}

// Remover inicialização automática no final
console.log('[ENCRYPTION] Simplified service ready'); 