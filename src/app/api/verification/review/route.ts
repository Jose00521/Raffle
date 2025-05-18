import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTemporaryDocumentUrl, logDocumentAccess } from '@/services/documentUploadService';
import { User } from '@/models/User';
import Campaign from '@/models/Campaign';

/**
 * Endpoint para administradores obterem URL temporária de acesso ao documento
 * POST /api/verification/review/get-url
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação (apenas admin)
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { documentPath, reason } = body;

    if (!documentPath) {
      return NextResponse.json({ error: 'Caminho do documento não fornecido' }, { status: 400 });
    }

    // Registra o acesso para auditoria
    await logDocumentAccess(documentPath, session.user.id, reason || 'Revisão de documento');

    // Gera URL temporária
    const url = await getTemporaryDocumentUrl(documentPath);

    return NextResponse.json({ 
      success: true, 
      url,
      expiresIn: '15 minutos'
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar URL temporária:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

/**
 * Endpoint para aprovar ou rejeitar verificação de documentos
 * PUT /api/verification/review
 */
export async function PUT(req: NextRequest) {
  try {
    // Verifica autenticação (apenas admin)
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      entityType, 
      entityId, 
      decision, 
      notes, 
      documentType, 
      documentIndex 
    } = body;

    if (!entityType || !entityId || !decision) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios não fornecidos' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Decisão inválida' }, { status: 400 });
    }

    // Determina o modelo com base no tipo de entidade
    const Model = entityType === 'user' ? User : Campaign;
    
    // Atualiza o documento específico ou a verificação geral
    if (documentType) {
      // Atualização de um documento específico
      let updateQuery;
      
      if (documentType === 'companyDocuments' && documentIndex !== undefined) {
        // Para documentos de empresa em array
        updateQuery = {
          [`verification.documents.companyDocuments.${documentIndex}.verified`]: decision === 'approved'
        };
      } else {
        // Para documentos simples
        updateQuery = {
          [`verification.documents.${documentType}.verified`]: decision === 'approved'
        };
      }
      
      await Model.findByIdAndUpdate(entityId, updateQuery);
      
      // Verifica se todos os documentos foram aprovados/rejeitados para atualizar o status geral
      const entity = await Model.findById(entityId).select('verification');
      
      // Lógica para verificar se todos os documentos foram processados
      const allDocsVerified = checkAllDocumentsVerified(entity.verification.documents);
      
      if (allDocsVerified) {
        // Se todos verificados, atualiza o status geral
        await Model.findByIdAndUpdate(entityId, {
          'verification.status': decision,
          'verification.reviewedAt': new Date(),
          'verification.reviewedBy': session.user.id,
          'verification.verificationNotes': notes || '',
          'verification.rejectionReason': decision === 'rejected' ? notes : '',
          'verification.expiresAt': decision === 'approved' ? 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : // 1 ano
            null
        });
      }
    } else {
      // Atualização do status geral de verificação
      await Model.findByIdAndUpdate(entityId, {
        'verification.status': decision,
        'verification.reviewedAt': new Date(),
        'verification.reviewedBy': session.user.id,
        'verification.verificationNotes': notes || '',
        'verification.rejectionReason': decision === 'rejected' ? notes : '',
        'verification.expiresAt': decision === 'approved' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : // 1 ano
          null
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verificação ${decision === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`
    });
    
  } catch (error: any) {
    console.error('Erro ao processar verificação:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

/**
 * Função auxiliar para verificar se todos os documentos foram processados
 */
function checkAllDocumentsVerified(documents: any) {
  if (!documents) return false;
  
  // Verifica documentos básicos
  const basicDocs = ['identityFront', 'identityBack', 'identitySelfie'];
  const allBasicDocsPresent = basicDocs.every(doc => 
    documents[doc] && documents[doc].path
  );
  
  if (allBasicDocsPresent) {
    const allBasicDocsVerified = basicDocs.every(doc => 
      documents[doc].verified !== undefined
    );
    
    if (!allBasicDocsVerified) return false;
  }
  
  // Verifica documentos de empresa, se existirem
  if (documents.companyDocuments && documents.companyDocuments.length > 0) {
    const allCompanyDocsVerified = documents.companyDocuments.every(
      (doc: any) => doc.verified !== undefined
    );
    
    if (!allCompanyDocsVerified) return false;
  }
  
  return true;
} 