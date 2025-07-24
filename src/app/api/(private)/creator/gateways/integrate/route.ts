import { withAuth } from "@/lib/auth/apiAuthHelper";
import { container } from "@/server/container/container";
import { ICreatorPaymentGatewayController } from "@/server/controllers/CreatorPaymentGatewayController";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(async (req: NextRequest, {session}: {session: Session}) => {
    try {
        const body = await req.json();
        const userCode = session.user.id;

        const creatorPaymentGatewayController = container.resolve<ICreatorPaymentGatewayController>('creatorPaymentGatewayController');
        const result = await creatorPaymentGatewayController.integrateGateway(body, userCode);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error integrating gateway', error);
        return NextResponse.json({ message: "Error integrating gateway" }, { status: 500 });
    }
},{
    allowedRoles: ['creator']
});
