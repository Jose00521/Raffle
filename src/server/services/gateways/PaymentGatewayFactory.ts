import GhostPayAdapterV1 from "./adapters/GhostPayAdapterV1"
import { IPaymentGatewayAdapter } from "./adapters/interfaces/IPaymentGatewayAdapter"

class PaymentGatewayFactory {
    static create(templateCode: string, credentials: any): IPaymentGatewayAdapter {
      return this.getGatewayAdapter(templateCode, credentials)
    }

    private static getGatewayAdapter(templateCode: string, credentials: any): IPaymentGatewayAdapter {
        const gateways = {
            'GHOSTSPAY_V1': new GhostPayAdapterV1(credentials),
        }

        return gateways[templateCode as keyof typeof gateways] as IPaymentGatewayAdapter
    }
  }

export default PaymentGatewayFactory;