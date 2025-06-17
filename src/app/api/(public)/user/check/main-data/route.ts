import { UserController } from '@/server/controllers/UserController';
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container/container';
import { createErrorResponse, createValidationErrorObject } from '@/server/utils/errorHandler/api';
import { validateWithSchema } from '@/utils/validation.schema';
import { signupSchema } from '@/zod/quicksignup.validation';
import { phoneOnlySchema } from '@/zod/phone.schema';

const validator = validateWithSchema(signupSchema);

export async function POST(request: NextRequest) {
    try {

        const data = await request.json();

        console.log('request cheguei',data);

        const userController = container.resolve(UserController);

        const response = await userController.quickCheckMainData(data);

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(createErrorResponse('Erro ao checar se o usuário já existe', 500),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
              }
        );
    }

}
