import mongoose, { ClientSession } from 'mongoose';

/**
 * Gerencia pool de sessões MongoDB para otimizar performance
 * e reutilização de conexões.
 */
export class SessionManager {
  private sessionPool: ClientSession[] = [];
  private readonly poolSize: number;

  constructor(poolSize = 10) {
    this.poolSize = poolSize;
  }

  /**
   * Inicializa o pool de sessões
   */
  public async initialize(): Promise<void> {
    if (this.sessionPool.length > 0) {
      return; // Já inicializado
    }
    
    console.log(`Inicializando pool com ${this.poolSize} sessões MongoDB`);
    
    for (let i = 0; i < this.poolSize; i++) {
      const session = await mongoose.startSession();
      this.sessionPool.push(session);
    }
    
    console.log('Pool de sessões inicializado com sucesso');
  }

  /**
   * Obtém uma sessão do pool
   */
  public async getSession(): Promise<ClientSession> {
    if (this.sessionPool.length === 0) {
      console.warn('Pool de sessões vazio, criando nova sessão');
      return mongoose.startSession();
    }
    
    return this.sessionPool.pop()!;
  }

  /**
   * Devolve uma sessão ao pool
   */
  public releaseSession(session: ClientSession): void {
    if (!session) return;
    
    if (this.sessionPool.length < this.poolSize) {
      this.sessionPool.push(session);
    } else {
      session.endSession();
    }
  }

  /**
   * Fecha todas as sessões do pool
   */
  public async close(): Promise<void> {
    for (const session of this.sessionPool) {
      session.endSession();
    }
    
    this.sessionPool = [];
    console.log('Pool de sessões encerrado');
  }
}

export default new SessionManager(); 