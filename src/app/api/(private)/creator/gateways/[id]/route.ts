import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { ICreatorPaymentGatewayController } from "@/server/controllers/CreatorPaymentGatewayController";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export const DELETE = withAuth(async (req: NextRequest, {session, params}: {session: Session, params: {id: string}}) => {
    try {
        const userCode = session.user.id;
        const gatewayCode = params.id;

        const creatorPaymentGatewayController = container.resolve<ICreatorPaymentGatewayController>('creatorPaymentGatewayController');
        const result = await creatorPaymentGatewayController.deleteGateway(userCode, gatewayCode);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Erro ao deletar gateway do criador', error);
        return NextResponse.json({ message: "Erro ao deletar gateway do criador" }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });