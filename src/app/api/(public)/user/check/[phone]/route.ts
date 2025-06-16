import { UserController } from '@/server/controllers/UserController';
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container/container';
import { createErrorResponse, createValidationErrorObject } from '@/server/utils/errorHandler/api';
import { validateWithSchema } from '@/utils/validation.schema';
import { signupSchema } from '@/zod/quicksignup.validation';
import { phoneOnlySchema } from '@/zod/phone.schema';

const validator = validateWithSchema(phoneOnlySchema);

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
    try {

        const { phone } = await params;

        const validate = validator({ telefone: phone });

        if (!validate.success) {
            return NextResponse.json(createValidationErrorObject(validate.errors, 'Erro de validação', 422));
        }

        const userController = container.resolve(UserController);

        const response = await userController.quickCheckUser(phone);

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
