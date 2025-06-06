import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/server/services/CampaignService';
import { ApiResponse, createErrorResponse } from '@/server/utils/errorHandler/api';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

    const { id } = await params;

    try {
        const campaignController = container.resolve(CampaignController);
        const campaign = await campaignController.getCampaignById(id);
        return NextResponse.json(campaign);
    } catch (error) {
        return createErrorResponse('Erro ao buscar campanha por ID:', 500);
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const campaignController = container.resolve(CampaignController);
        const campaign = await campaignController.deleteCampaign(id);
        return NextResponse.json(campaign);
    } catch (error) {
        return createErrorResponse('Erro ao excluir campanha:', 500);
    }
}

