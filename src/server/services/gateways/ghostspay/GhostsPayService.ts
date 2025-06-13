import { IPaymentGhostRequest, IPaymentGhostResponse, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";

export function GhostsPayService() {
  const createPixPayment = async (data: IPaymentPattern): Promise<{response: Response, data: IPaymentGhostResponse}> => {
    const dataToSend = getPixGhostFormat(data);
    const response = await fetch(`${process.env.GH_URL}/api/v1/transaction.purchase`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.GH_SECRETE_KEY}`,
      },
    });

    const dataResponse = await response.json() as IPaymentGhostResponse;

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