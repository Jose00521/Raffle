import { NextRequest } from 'next/server';
import { NumberStatusController } from '../../../../../server/controllers/NumberStatusController';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NumberStatusController.getRifaStats(request, { params });
} 