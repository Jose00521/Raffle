import { IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";

const paymentAPIClient = {
    createPixPayment: async (data: IPaymentPattern) => {
        const response = await fetch('/api/payment/pix', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response.json();
    }
}

export default paymentAPIClient;