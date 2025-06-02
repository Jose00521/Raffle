import 'reflect-metadata';
import { PrizeController } from "@/server/controllers/PrizeController";
import { container } from "@/server/container/container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID do prêmio não fornecido' }, { status: 400 });
        }
        const prizeController = container.resolve(PrizeController);
        const prize = await prizeController.getPrizeById(id);
        return NextResponse.json(prize);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar prêmio' }, { status: 500 });
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID do prêmio não fornecido' }, { status: 400 });
        }

        console.log("chegou aqui",id);

        const prizeController = container.resolve(PrizeController);
        const prize = await prizeController.deletePrize(id);

        return NextResponse.json(prize);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar prêmio' }, { status: 500 });
    }
}