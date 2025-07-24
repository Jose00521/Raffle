import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/apiAuthHelper";
import { Session } from "next-auth";
import { AdminPermissionsEnum } from "@/models/interfaces/IUserInterfaces";
import { GatewayTemplateController } from "@/server/controllers/GatewayTemplateController";
import { container } from "@/server/container/container";
import { createErrorResponse } from "@/server/utils/errorHandler/api";

export const GET = withAuth(async (request: NextRequest,{ session, params }: { session: Session, params: { templateCode: string } })=>{
    try {
        const {templateCode} = await params;

        if(!templateCode){
            return NextResponse.json({error: 'Template code é obrigatório'}, {status: 400});
        }

        const adminCode = session.user.id;
        
        const gatewayTemplateController = container.resolve(GatewayTemplateController);
        const result = await gatewayTemplateController.verifyIfAlreadyExists(templateCode,adminCode);
        return NextResponse.json(result, {status: 200});
    } catch (error) {
        console.error('Erro ao verificar se o template já existe', error);
        return NextResponse.json(createErrorResponse('Erro ao verificar se o template já existe', 500), {status: 500});
    }
}, {
    allowedRoles: ['admin'],
    allowedPermissions: [AdminPermissionsEnum.GATEWAY_MANAGEMENT]
})