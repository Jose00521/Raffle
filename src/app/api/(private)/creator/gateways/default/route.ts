import { withAuth } from "@/lib/auth/apiAuthHelper";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { ICreatorPaymentGatewayController } from "@/server/controllers/CreatorPaymentGatewayController";
import { container } from "@/server/container/container";

export const PUT = withAuth(async (req: NextRequest, {session}: {session: Session}) => {
    try {
        const userCode = session.user.id;
        const { gatewayCode } = await req.json();

        const creatorPaymentGatewayController = container.resolve<ICreatorPaymentGatewayController>('creatorPaymentGatewayController');
        const result = await creatorPaymentGatewayController.setAsDefaultGateway(userCode, gatewayCode);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error setting default gateway', error);
        return NextResponse.json({ message: "Error setting default gateway" }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });