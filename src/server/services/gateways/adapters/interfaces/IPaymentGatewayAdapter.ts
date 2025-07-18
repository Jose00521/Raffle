import { IPaymentPattern, IPaymentResult } from "@/models/interfaces/IPaymentInterfaces";

// Interface base que todos os gateways implementam
export interface IPaymentGatewayAdapter {
    createPixPayment(data: IPaymentPattern): Promise<IPaymentResult>
    // validateCredentials(credentials: Record<string, any>): Promise<boolean>
    // parseWebhook(payload: any): Promise<WebhookResult>
  }