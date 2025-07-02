import mongoose, { Mongoose, Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';

export interface IDBConnection {
  connect(): Promise<Mongoose | Connection>;
  getConnectionStats(): Promise<any>;
  disconnect(): Promise<void>;
}

// Singleton pattern para desenvolvimento
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export class DBConnection implements IDBConnection {
  async connect(): Promise<Mongoose | Connection> {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI não está definido no ambiente');
    }

    // Se já temos uma conexão em cache, retorna ela
    if (cached.conn) {
      return cached.conn;
    }

    // Se já estamos conectados via mongoose global, retorne a conexão existente
    if (mongoose.connection.readyState === 1) {
      cached.conn = mongoose.connection;
      return mongoose.connection;
    }

    // Se não temos uma promise de conexão, cria uma
    if (!cached.promise) {
      // Configurações otimizadas por ambiente
      const opts = {
        bufferCommands: false,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,   // Conservador para produção
        minPoolSize: process.env.NODE_ENV === 'production' ? 2 : 1,    // Mínimo necessário
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        maxIdleTimeMS: process.env.NODE_ENV === 'production' ? 30000 : 10000,
        heartbeatFrequencyMS: 10000,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('🟢 MongoDB conectado com sucesso');
        
        // Monitoramento de conexões
        this.setupConnectionMonitoring();
        
        return mongoose;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      throw e;
    }

    return cached.conn;
  }

  // Configurar monitoramento de conexões
  private setupConnectionMonitoring(): void {
    // Log de eventos críticos (sempre)
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose conectado ao MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.log('❌ Erro de conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose desconectado do MongoDB');
    });

    // Monitoramento detalhado apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Log das estatísticas de conexão a cada 60 segundos (menos frequente)
      const monitorInterval = setInterval(() => {
        const db = mongoose.connection.db;
        if (db) {
          db.admin().serverStatus().then((status: any) => {
            const connections = status.connections;
            console.log(`📊 MongoDB Connections: ${connections.current}/${connections.available} (${Math.round((connections.current/connections.available)*100)}%)`);
          }).catch((err: any) => {
            console.log('❌ Erro ao obter status do servidor:', err.message);
          });
        }
      }, 60000); // Mudado para 60 segundos

      // Limpar interval se desconectar
      mongoose.connection.on('disconnected', () => {
        clearInterval(monitorInterval);
      });
    }
  }

  // Método para obter estatísticas de conexão
  async getConnectionStats(): Promise<any> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Não conectado ao MongoDB');
      }
      
      const status = await db.admin().serverStatus();
      return {
        current: status.connections.current,
        available: status.connections.available,
        usage: Math.round((status.connections.current / status.connections.available) * 100),
        totalCreated: status.connections.totalCreated
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de conexão:', error);
      return null;
    }
  }

  // Método para fechar conexões (útil em testes)
  async disconnect(): Promise<void> {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log('🔴 MongoDB desconectado');
    }
  }
}