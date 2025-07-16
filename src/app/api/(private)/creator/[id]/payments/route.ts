import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";
import { createErrorResponse } from "@/server/utils/errorHandler/api";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {

        const { id } = await params;

        if(session.user.id !== id){
            return NextResponse.json(createErrorResponse('Você não tem permissão para acessar este recurso', 403), { status: 403 });
        }

        const query = request.nextUrl.searchParams;
        const searchTerm = query.get('searchTerm') || '';
        const campaignId = query.get('campaignId') || '';
        const status = query.get('status') || '';
        const page = Number(query.get('page')) || 1;
        const limit = Number(query.get('limit')) || 10;
        const startDate = query.get('startDate') || '';
        const endDate = query.get('endDate') || '';

        const pagination = {
            userCode: session.user.id,
            page,
            limit,
            skip: (page - 1) * limit,
            searchTerm,
            campaignId, 
            status,
            startDate,
            endDate
        }

        console.log('[GET PAGINATION] pagination', pagination);

        const controller =  container.resolve(PaymentController);
        const result = await controller.getPaymentsByCreatorId(pagination);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar pagamentos', 500), { status: 500 });
    }
}, { allowedRoles: ['creator'] });