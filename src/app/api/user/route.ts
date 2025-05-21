import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '../../../server/container/container';
import { UserController } from '@/server/controllers/UserController';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */


export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await request.json();
    const user = container.resolve(UserController);
    const result = await user.createUser(body);

    if (result) {
        return NextResponse.json({ message: 'User created successfully' });
    } else {
        return NextResponse.json({ message: 'User not created' }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created successfully' });
}


