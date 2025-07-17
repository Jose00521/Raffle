import { IPaymentGhostErrorResponse, IPaymentGhostRequest, IPaymentGhostResponse, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import logger from "@/lib/logger/logger";
import { maskCEP, maskComplement, maskNumber, maskCPF, maskEmail, maskStreet, maskPhone } from "@/utils/maskUtils";

export function GhostsPayService() {
  const createPixPayment = async (data: IPaymentPattern): Promise<{response: Response, data: IPaymentGhostResponse | IPaymentGhostErrorResponse}> => {

    const dataToSend = getPixGhostFormat(data);

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
        'Authorization': `${process.env.GH_SECRETE_KEY}`,
      },
    });

    if(!response.ok){
      logger.error({
        message: '[ERROR] GhostsPayService response not ok',
        response: response
      });
    }

    const dataResponse = await response.json();

    logger.info({
      message: '[RESPONSE] GhostsPayService data response',
      data: dataResponse
    });

    return {
      response,
      data: dataResponse
    };
  };

  const getPixGhostFormat = (data: IPaymentPattern): IPaymentGhostRequest => {

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
   
  };

  return {
    createPixPayment
};
}