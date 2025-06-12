import { NextRequest, NextResponse } from "next/server";
import { GhostsPayService } from "@/server/services/gateways/ghostspay/GhostsPayService";
import { createErrorResponse , createSuccessResponse} from '@/server/utils/errorHandler/api';

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('body', body);

  const response = await GhostsPayService().createPixPayment(body);

  console.log('response payment', response);

  return NextResponse.json(createSuccessResponse({
    pixQrCode: response.pixQrCode,
    pixCode: response.pixCode,
    expiresAt: response.expiresAt,
  }, 'Pagamento criado com sucesso', 200),{
    status: 200,
  });
}