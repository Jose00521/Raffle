import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { createErrorResponse } from "@/server/utils/errorHandler/api";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {

        const { id } = params;

        if(session.user.id !== id){
            return NextResponse.json(createErrorResponse('Você não tem permissão para acessar este recurso', 403), { status: 403 });
        }

        const query = request.nextUrl.searchParams;
        const page = Number(query.get('page')) || 1;
        const limit = Number(query.get('limit')) || 10;

        const pagination = {
            userCode: session.user.id,
            page,
            limit,
            skip: (page - 1) * limit,
        }
        

        
        
        // const result = await creatorController.getCreatorById(id);
        return NextResponse.json('teste', { status: 200 });
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar pagamentos', 500), { status: 500 });
    }
}, { allowedRoles: ['creator'] });