export const creatorPaymentGatewayAPIClient = {

    integrateGateway: async (data: any) => {
        const result = await fetch(`/payment-gateway/integrate`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result;
    }

}