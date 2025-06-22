import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();


  console.log("[GHOSTSPAY] - PAYMENT CONFIRMATION", body);

  return NextResponse.json({ message: "Payment confirmed" });
}