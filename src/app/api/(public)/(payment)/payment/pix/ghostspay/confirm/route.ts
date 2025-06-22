import { NextRequest, NextResponse } from "next/server";
import { IPaymentGhostWebhookPost } from "@/models/interfaces/IPaymentInterfaces";
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";

export async function POST(request: NextRequest) {
  const body = await request.json() as IPaymentGhostWebhookPost;


  const paymentController = container.resolve(PaymentController);

  const payment = await paymentController.confirmPixPayment(body);



  if (!payment) {
    return NextResponse.json({ message: "Payment not found" }, { status: 404 });
  }
  



  console.log("[GHOSTSPAY] - PAYMENT CONFIRMATION", body);

  return NextResponse.json({ message: "Payment confirmed" });
}