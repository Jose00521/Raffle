import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const cpf = searchParams.get('cpf');
    
    return NextResponse.json({ cpf });
}

