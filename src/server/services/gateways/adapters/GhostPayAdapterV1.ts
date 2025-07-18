import logger from "@/lib/logger/logger";

import { IPaymentGatewayAdapter } from "./interfaces/IPaymentGatewayAdapter";
import { IPaymentPattern, IPaymentResult, IPaymentResultData } from "@/models/interfaces/IPaymentInterfaces";
import { IPaymentGhostRequest, IPaymentGhostResponse } from './interfaces/IGhostPayInterfaces'

import { maskCEP, maskCPF, maskEmail, maskNumber, maskPhone, maskStreet, maskComplement } from "@/utils/maskUtils";


class GhostPayAdapterV1 implements IPaymentGatewayAdapter {

    constructor(private readonly credentials: any) {}

    public async createPixPayment(data: IPaymentPattern): Promise<IPaymentResult> {
    const dataToSend = this.getPixProcessorRequestFormat(data);

    logger.info({
      message: '[REQUEST] GhostsPayService send data to ghostspay',
      data: {
        ...dataToSend,
        email: maskEmail(dataToSend.email),
        phone: maskPhone(dataToSend.phone),
        cpf: maskCPF(dataToSend.cpf),
        cep: maskCEP(dataToSend.cep || ''),
        street: maskStreet(dataToSend.street || ''),
        number: maskNumber(dataToSend.number || ''),
        complement: maskComplement(dataToSend.complement || ''),
      }
    });

    const response = await fetch(`${process.env.GH_URL}/api/v1/transaction.purchase`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${this.credentials.secretKey}`,
      },
    });

    if(!response.ok){
      logger.error({
        message: '[ERROR] GhostsPayService response not ok',
        response: response
      });
    }

    const dataResponse = await response.json() as IPaymentGhostResponse;

    const resultData = this.getPixPatternResponseFormat(dataResponse);

    logger.info({
      message: '[RESPONSE] GhostsPayService data response',
      data: dataResponse
    });

    return {
      response,
      data: resultData
    };
    }

    private getPixProcessorRequestFormat(data: IPaymentPattern): IPaymentGhostRequest {
        return {
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            externalId: data.paymentCode || '',
            expiresAt: data.expiresAt,
            traceable: true,
            cep: data.address.zipCode || '',
            street: data.address.street || '',
            number: data.address.number || '',
            complement: data.address.complement || '',
            district: data.address.neighborhood || '',
            city: data.address.city,
            state: data.address.state,
            items: [
                  {
                  unitPrice: (data.selectedPackage.totalPrice || 0) * 100, // Converter para centavos
                  title: data.campanha.title,
                  quantity: 1,
                  tangible: false
              }
            ]
          }
    }

    private getPixPatternResponseFormat(data: IPaymentGhostResponse): IPaymentResultData {    
        return {
            processorTransactionId: data.id,
            amountReceived: data.amountSeller,
            taxSeller: data.taxSeller,
            taxPlatform: data.taxPlatform,
            paymentCode: data.externalId,
            pixCode: data.pixCode,
            pixQrCode: data.pixQrCode,
            approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        }
    }
}

export default GhostPayAdapterV1;