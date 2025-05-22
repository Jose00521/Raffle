// import { NextResponse } from 'next/server';
// import { NextRequest } from 'next/server';
// import { container } from '../../../../server/container/container';
// import { UserController } from '@/server/controllers/UserController';
// import { IUser } from '@/models/User';
// import { createErrorResponse } from '@/types/api';

// /**
//  * Endpoint POST: Verificar se um usuário já existe
//  */
// export async function POST(request: NextRequest) {
//     try {
//         // Ler o body da request apenas uma vez e armazenar em uma variável
//         const body = await request.json();
//         const { email, cpf, phone } = body;
        
//         if (!email) {
//             const errorResp = createErrorResponse(
//                 'Email é obrigatório para verificação',
//                 'Email é obrigatório',
//                 400
//             );
            
//             return new NextResponse(JSON.stringify(errorResp), {
//                 status: 400,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });
//         }
        
//         const userController = container.resolve(UserController);
//         const result = await userController.checkUserExists(email, cpf, phone);
        
//         // Criar uma resposta nova usando o construtor
//         return new NextResponse(JSON.stringify(result), {
//             status: result.statusCode,
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.error('Erro na rota de verificação de usuário:', error);
        
//         // Criar uma resposta de erro padronizada
//         const errorResponse = createErrorResponse(
//             error instanceof Error ? error.message : 'Erro desconhecido',
//             'Erro interno do servidor',
//             500
//         );
        
//         return new NextResponse(JSON.stringify(errorResponse), {
//             status: 500,
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//     }
// } 