import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { CreatorController } from "@/server/controllers/CreatorController";
import { createErrorResponse } from "@/server/utils/errorHandler/api";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
        const { id } = params;
        const creatorController = container.resolve(CreatorController);
        // const result = await creatorController.getCreatorById(id);
        return NextResponse.json('teste', { status: 200 });
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar criador', 500), { status: 500 });
    }
}, { allowedRoles: ['creator'] });