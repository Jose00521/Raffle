import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/server/services/CampaignService';
import { ApiResponse, createErrorResponse } from '@/server/utils/errorHandler/api';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';
import { withAuth } from '@/lib/auth/apiAuthHelper';
import { Session } from 'next-auth';
import { InstantPrizesPayload } from '@/models/interfaces/INumberStatusInterfaces';

export const GET = async (request: NextRequest, { params}: { params: { id: string }}) => {
    const { id } = await params;

    try {
        const campaignController = container.resolve(CampaignController);
        const campaign = await campaignController.getCampaignByIdPublic(id);
        return NextResponse.json(campaign);
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar campanha por ID:', 500), { status: 500 });
    }
}






