import { UserController } from '@/server/controllers/UserController';
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container/container';
import { createErrorResponse } from '@/server/utils/errorHandler/api';

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
    try {
        console.log('request',request);
        const { phone } = await params;

        const userController = container.resolve(UserController);

        const response = await userController.quickCheckUser(phone);

        return NextResponse.json(response,
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
              }
        );
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao checar se o usuário já existe', 500),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
              }
        );
    }

}
