import mongoose, { Connection } from 'mongoose';

// Declaração global para cache
declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  } | undefined;
}

export interface IDBConnection {
  connect(): Promise<Connection>;
  disconnect(): Promise<void>;
  getConnectionStats(): {
    readyState: number;
    activeConnections: number;
    host: string;
  };
}

// Instância singleton global
let globalDBConnection: DBConnection | null = null;

export class DBConnection implements IDBConnection {
  private static instance: DBConnection;
  
  // Método para obter a instância singleton
  public static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  // Construtor privado para prevenir instanciação direta
  private constructor() {}

  async connect(): Promise<Connection> {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Por favor, defina a variável MONGODB_URI no arquivo .env.local');
    }

    const cached = global.mongoose || { conn: null, promise: null };
    global.mongoose = cached;

    if (cached.conn) {
      return cached.conn;
    }

    if (mongoose.connection.readyState === 1) {
      cached.conn = mongoose.connection;
      return mongoose.connection;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
        minPoolSize: process.env.NODE_ENV === 'production' ? 2 : 1,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
      };

      console.log(`🔗 [${process.env.NODE_ENV}] Conectando ao MongoDB...`);
      
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log(`✅ [${process.env.NODE_ENV}] MongoDB conectado com sucesso`);
        return mongoose.connection;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      throw e;
    }

    // Configurar listeners apenas uma vez
    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        console.log(`🔗 [${process.env.NODE_ENV}] MongoDB connected`);
      });

      mongoose.connection.on('error', (err) => {
        console.error(`❌ [${process.env.NODE_ENV}] MongoDB connection error:`, err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log(`🔌 [${process.env.NODE_ENV}] MongoDB disconnected`);
      });

      // Monitoramento apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const interval = setInterval(async () => {
          const db = mongoose.connection.db;
          if (db) {
            try {
              const status = await db.admin().serverStatus();
              console.log(`📊 [DEV] Conexões ativas: ${status.connections?.current || 'N/A'}`);
            } catch (err) {
              // Ignore monitoring errors
            }
          }
        }, 60000);

        mongoose.connection.on('disconnected', () => {
          clearInterval(interval);
        });
      }
    }

    const db = mongoose.connection.db;
    if (db) {
      const connectionStats = this.getConnectionStats();
      console.log(`📊 [${process.env.NODE_ENV}] Pool status:`, connectionStats);
    }

    return cached.conn;
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      global.mongoose = { conn: null, promise: null };
    }
  }

  getConnectionStats() {
    return {
      readyState: mongoose.connection.readyState,
      activeConnections: 0, // Simplificado para evitar erros de tipo
      host: mongoose.connection.host || 'unknown'
    };
  }
}

// Função de conveniência para manter compatibilidade com código antigo
export default async function dbConnect(): Promise<Connection> {
  if (!globalDBConnection) {
    globalDBConnection = DBConnection.getInstance();
  }
  return globalDBConnection.connect();
}

// Export da instância singleton para uso direto
export const dbInstance = DBConnection.getInstance();