import { withAuth } from "@/lib/auth/apiAuthHelper";
import { AdminPermissionsEnum } from "@/models/interfaces/IUserInterfaces";
import { createErrorResponse } from "@/server/utils/errorHandler/api";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(async (request: NextRequest,{ session }: { session: Session }) => {
    try {
        const body = await request.json();

        

        return NextResponse.json(body, { status: 200 });
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao criar gateway', 500), { status: 500 });
    }
}, {
    allowedRoles: ['admin'],
    allowedPermissions: [AdminPermissionsEnum.GATEWAY_MANAGEMENT]
});

