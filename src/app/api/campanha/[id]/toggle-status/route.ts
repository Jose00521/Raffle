import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container/container';
import { CampaignController } from '@/server/controllers/CampaignController';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {  
    const { id } = await params;

    try {
        const campaignController = container.resolve(CampaignController);
        const campaign = await campaignController.toggleCampaignStatus(id);

        return NextResponse.json(campaign, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao ativar/desativar campanha' }, { status: 500 });
    }
}
