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
        console.error('Erro ao buscar campanha por ID:', error);
        return NextResponse.json(createErrorResponse('Erro ao buscar campanha por ID:', 500), { status: 500 });
    }
}, { allowedRoles: ['creator'] });




export const PUT = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {

    try {
        const { id } = await params;
    if (!id) {
        return NextResponse.json(createErrorResponse('ID da campanha não fornecido', 400), { status: 400 });
    }
    
    // Parse the form data
    const formData = await request.formData();

    const modifiedFieldsJSON = formData.get('modifiedFields') as string;
    const modifiedFields = JSON.parse(modifiedFieldsJSON || '[]');
    
    if (!modifiedFields || !modifiedFields.length) {
        return NextResponse.json(createErrorResponse('Nenhum campo modificado foi especificado', 400), { status: 400 });
    }

    const updatedFields = JSON.parse(formData.get('updatedFields') as string)
    const images = formData.getAll('images')
    const coverImage = formData.get('coverImage')

    let updatedCampaign = {
        ...updatedFields,
    }

    if(Object.keys(updatedFields).includes('images')){
        updatedCampaign.images = images;
    }
    if(Object.keys(updatedFields).includes('coverImage')){
        updatedCampaign.coverImage = coverImage;
    }

    
    const campaignController = container.resolve(CampaignController);
    const campaign = await campaignController.updateCampaign(id, session, updatedCampaign);
    return NextResponse.json(campaign);

    } catch (error) {
        console.log('error',error);
        return NextResponse.json(createErrorResponse('Erro ao atualizar campanha:', 500), { status: 500 });
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






