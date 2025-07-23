import { withAuth } from "@/lib/auth/apiAuthHelper";
import { AdminPermissionsEnum } from "@/models/interfaces/IUserInterfaces";
import { GatewayTemplateController } from "@/server/controllers/GatewayTemplateController";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/errorHandler/api";
import { convertFormDataToJSON } from "@/utils/formDataToJSON";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { container } from "@/server/container/container";
import { IPaymentGatewayTemplate } from "@/models/interfaces/IPaymentGatewayTemplateInterfaces";



export const GET = withAuth(async (request: NextRequest,{ session }: { session: Session }) => {
    try {
        const gatewayTemplateController = container.resolve(GatewayTemplateController);
        const result = await gatewayTemplateController.getAllGatewayTemplates();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar templates de gateway', error);
        return NextResponse.json(createErrorResponse('Erro ao buscar templates de gateway', 500), { status: 500 });
    }
}, {
    allowedRoles: ['admin', 'creator']
});

export const POST = withAuth(async (request: NextRequest,{ session }: { session: Session }) => {
    try {
        const body = await request.formData();
        const jsonData = {
          logo: body.get('logo'),
          ...convertFormDataToJSON(body)
        };

        const gatewayTemplateController = container.resolve(GatewayTemplateController);

        const result = await gatewayTemplateController.createGatewayTemplate(jsonData as Partial<IPaymentGatewayTemplate>, session);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Erro ao criar gateway', error);
        return NextResponse.json(createErrorResponse('Erro ao criar gateway', 500), { status: 500 });
    }
}, {
    allowedRoles: ['admin'],
    allowedPermissions: [AdminPermissionsEnum.GATEWAY_MANAGEMENT]
});



