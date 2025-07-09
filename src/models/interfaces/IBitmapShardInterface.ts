import mongoose from 'mongoose';

/**
 * Interface para o modelo de shard de bitmap que rastreia disponibilidade de números
 * Cada shard representa uma faixa de números dentro do bitmap total
 */
export interface IBitmapShard {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  shardIndex: number;         // Índice do shard (0, 1, 2, ...)
  startNumber: number;        // Número inicial deste shard (inclusive)
  endNumber: number;          // Número final deste shard (inclusive)
  bitmap: Buffer;             // Buffer contendo os bits para este shard
  availableCount: number;     // Contagem de números disponíveis neste shard
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para o modelo de metadados do bitmap shardado
 * Armazena informações sobre como o bitmap total está dividido
 */
export interface IBitmapMeta {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  totalNumbers: number;       // Total de números na rifa
  shardSize: number;          // Tamanho de cada shard (em números)
  shardCount: number;         // Quantidade total de shards
  availableCount: number;     // Contagem total de números disponíveis
  createdAt: Date;
  updatedAt: Date;
} 