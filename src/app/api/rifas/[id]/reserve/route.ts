import { NextRequest } from 'next/server';
import { NumberStatusController } from '../../../../../server/controllers/NumberStatusController';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NumberStatusController.autoReserveNumbers(request, { params });
} 