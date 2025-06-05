import mongoose from 'mongoose';

/**
 * Interface para o modelo de bitmap que rastreia disponibilidade de números
 * Cada bit no campo bitmap representa um número (1=disponível, 0=indisponível)
 */
export interface IBitmap {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  totalNumbers: number;
  bitmap: Buffer;
  availableCount: number;
  createdAt: Date;
  updatedAt: Date;
} 