// src/app/api/admin/validate-invite/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/server/lib/dbConnect';
import AdminInvite from '@/models/AdminInvite';
import { IAdminController } from '@/server/controllers/AdminController';
import { container } from '@/server/container/container';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const adminController = container.resolve<IAdminController>('adminController');
    const result = await adminController.validateInvite(token);

    if(!result.success){
      return NextResponse.json(result, { status: result.statusCode });
    }

    return NextResponse.json(result, { status: result.statusCode });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}