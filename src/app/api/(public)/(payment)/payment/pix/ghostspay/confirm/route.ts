import { NextRequest, NextResponse } from "next/server";
import { IPaymentGhostWebhookPost } from "@/models/interfaces/IPaymentInterfaces";
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";

export async function POST(request: NextRequest) {
  try {
  const body = await request.json() as IPaymentGhostWebhookPost;


  const paymentController = container.resolve(PaymentController);

  const payment = await paymentController.confirmPixPayment(body);

    if (!payment) {
      console.error("[GHOSTSPAY] - PAYMENT NOT FOUND", body);
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    console.log("[GHOSTSPAY] - PAYMENT CONFIRMED", body);
    return NextResponse.json({ message: "Payment confirmed" });
  } catch (error: any) {
    console.error("[GHOSTSPAY] - PAYMENT CONFIRMATION ERROR", error);
    return NextResponse.json({ message: "Error processing payment confirmation", error: error.message }, { status: 500 });
  }
}