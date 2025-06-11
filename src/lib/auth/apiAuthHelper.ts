import { getServerSession, Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { nextAuthOptions } from './nextAuthOptions';
import logger from '../logger/logger';
type ApiHandler = (
    request: NextRequest,
    context: { params: any; session: any }
  ) => Promise<NextResponse>;
  
  interface AuthOptions {
    allowedRoles?: string[];
  }

  type UserRole =  'admin' | 'creator' | 'participant';
  

export function withAuth(
    handler: ApiHandler, 
    options: AuthOptions = {}
) {
    return async (
        request: NextRequest,
        context: { params: any }
      ) => {
        // 🔍 VALIDAÇÃO automática
        logger.info("Verificando sessão");
        const session = await getServerSession(nextAuthOptions);

        logger.info({
            message: "Sessão",
            session: session,
        });

        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Token de acesso requerido' },
            { status: 401 }
          );
        }
        
        logger.info("Verificar papéis se especificado")
        // 🛡️ Verificar papéis se especificado
        if (options.allowedRoles?.length) {
          if (!options.allowedRoles.includes(session.user.role as UserRole)) {
            return NextResponse.json(
              { error: 'Forbidden' },
              { status: 403 }
            );
          }
        }
        logger.info("Passando sessão validada para o handler")
        // ✅ Passar sessão validada para o handler
        return handler(request, { ...context, session });
      };
}


// export async function POST(request: NextRequest) {
//     // 1️⃣ AUTENTICAÇÃO
//     const { error, session } = await requireAuth(['creator']);
//     if (error) return error;
    
//     // 2️⃣ RATE LIMITING (se necessário)
//     // await checkRateLimit(session.user.id);
    
//     // 3️⃣ VALIDAÇÃO DE INPUT
//     const data = await request.json();
//     // const validatedData = schema.parse(data);
    
//     // 4️⃣ AUTORIZAÇÃO DE RECURSO
//     // if (resource.ownerId !== session.user.id) return 403;
    
//     // 5️⃣ LÓGICA DE NEGÓCIO
//     // ... processar
    
//     // 6️⃣ AUDITORIA/LOGS
//     // logger.info(`User ${session.user.id} created resource`);
//   }