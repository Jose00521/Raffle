import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";
import { createErrorResponse } from "@/server/utils/errorHandler/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cpf = searchParams.get('cpf') || '';
        const campaignCode = searchParams.get('campaignCode') || '';

        const controller = container.resolve(PaymentController);
        const result = await controller.getMyNumbers(cpf, campaignCode);

        console.log('result', result);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar números', 500));
    }
}

