import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { ICreatorPaymentGatewayController } from "@/server/controllers/CreatorPaymentGatewayController";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest, {session}: {session: Session}) => {
    try {
        const userCode = session.user.id;

        const creatorPaymentGatewayController = container.resolve<ICreatorPaymentGatewayController>('creatorPaymentGatewayController');
        const result = await creatorPaymentGatewayController.getMyGateways(userCode);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Erro ao buscar gateways do criador', error);
        return NextResponse.json({ message: "Erro ao buscar gateways do criador" }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });