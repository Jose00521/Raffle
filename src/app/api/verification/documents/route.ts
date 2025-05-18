import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadVerificationDocument } from '@/services/documentUploadService';
import User from '@/models/User';
import Campaign from '@/models/Campaign';

// Limite para upload de documentos (5MB por arquivo)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Endpoint para envio de documentos de verificação
 * POST /api/verification/documents
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Processa o form data
    const formData = await req.formData();
    const entityType = formData.get('entityType') as 'user' | 'campaign';
    const entityId = formData.get('entityId') as string;
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    // Validações básicas
    if (!entityType || !entityId || !documentType || !file) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios não fornecidos' }, { status: 400 });
    }

    // Verifica tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    // Verifica tipo de arquivo (apenas imagens e PDFs)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Busca a entidade pelo ID
    let entity;
    let entityCode;
    
    if (entityType === 'user') {
      entity = await User.findById(entityId);
      entityCode = entity?.userCode;
    } else {
      entity = await Campaign.findById(entityId);
      entityCode = entity?.campaignCode;
    }

    if (!entity || !entityCode) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 });
    }

    // Verifica se o usuário é dono da entidade ou é admin
    if (entityType === 'campaign' && entity.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado a carregar documentos para esta campanha' }, { status: 403 });
    }

    if (entityType === 'user' && entity._id.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado a carregar documentos para este usuário' }, { status: 403 });
    }

    // Lê o arquivo como buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Faz o upload para S3 via nosso serviço
    const documentPath = await uploadVerificationDocument(
      entityCode,
      buffer,
      file.name,
      documentType,
      entityType
    );

    // Atualiza o status de verificação no banco de dados
    const uploadedAt = new Date();
    
    if (entityType === 'user') {
      // Monta o path baseado no tipo de documento
      let documentField = `verification.documents.${documentType}`;
      
      if (documentType.startsWith('company')) {
        // Para documentos de empresa, é um array
        await User.findByIdAndUpdate(entityId, {
          'verification.status': 'pending',
          $push: {
            'verification.documents.companyDocuments': {
              type: documentType.replace('company', '').toLowerCase(),
              path: documentPath,
              uploadedAt,
              verified: false
            }
          }
        });
      } else {
        // Para documentos básicos (RG frente/verso, selfie)
        const updateObj = {
          'verification.status': 'pending',
          [`verification.documents.${documentType}`]: {
            path: documentPath,
            uploadedAt,
            verified: false
          }
        };
        
        await User.findByIdAndUpdate(entityId, updateObj);
      }
    } else {
      // Lógica similar para campanhas
      if (documentType.startsWith('company')) {
        await Campaign.findByIdAndUpdate(entityId, {
          'verification.status': 'pending',
          $push: {
            'verification.documents.companyDocuments': {
              type: documentType.replace('company', '').toLowerCase(),
              path: documentPath,
              uploadedAt,
              verified: false
            }
          }
        });
      } else {
        const updateObj = {
          'verification.status': 'pending',
          [`verification.documents.${documentType}`]: {
            path: documentPath,
            uploadedAt,
            verified: false
          }
        };
        
        await Campaign.findByIdAndUpdate(entityId, updateObj);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Documento enviado com sucesso',
      path: documentPath
    });
    
  } catch (error: any) {
    console.error('Erro no upload de documento:', error);
    return NextResponse.json({ error: error.message || 'Erro no upload' }, { status: 500 });
  }
}

/**
 * Endpoint para listar documentos de uma entidade
 * GET /api/verification/documents?entityType=user&entityId=123
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação (apenas admin pode listar)
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const entityType = url.searchParams.get('entityType') as 'user' | 'campaign';
    const entityId = url.searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios não fornecidos' }, { status: 400 });
    }

    // Busca documentos da entidade
    let entity;
    
    if (entityType === 'user') {
      entity = await User.findById(entityId).select('verification');
    } else {
      entity = await Campaign.findById(entityId).select('verification');
    }

    if (!entity) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      verification: entity.verification || {}
    });
    
  } catch (error: any) {
    console.error('Erro ao listar documentos:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
} 