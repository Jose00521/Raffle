export const creatorPaymentGatewayAPIClient = {

    integrateGateway: async (data: any) => {
        const result = await fetch(`/api/creator/gateways/integrate`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return result.json();
    }

}