import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/server/services/CampaignService';
import { ApiResponse, createErrorResponse } from '@/server/utils/errorHandler/api';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';
import { withAuth } from '@/lib/auth/apiAuthHelper';
import { Session } from 'next-auth';
import { InstantPrizesPayload } from '@/models/interfaces/INumberStatusInterfaces';

export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    const { id } = await params;

    const userCode = session.user.id;

    try {
        const campaignController = container.resolve(CampaignController);
        const campaign = await campaignController.getCampaignById(id, userCode);
        return NextResponse.json(campaign);
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao buscar campanha por ID:', 500), { status: 500 });
    }
}, { allowedRoles: ['creator'] });


export const DELETE = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
  const { id } = await params;

  try {
      const campaignController = container.resolve(CampaignController);
      const campaign = await campaignController.deleteCampaign(id, session);
      return NextResponse.json(campaign);
  } catch (error) {
      return NextResponse.json(createErrorResponse('Erro ao excluir campanha:', 500), { status: 500 });
  }
}, { allowedRoles: ['creator'] });






