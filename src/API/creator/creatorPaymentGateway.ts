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
    },


    getMyGateways: async () => {
        const result = await fetch(`/api/creator/gateways`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return result.json();
    },

    deleteGateway: async (gatewayCode: string) => {
        const result = await fetch(`/api/creator/gateways/${gatewayCode}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return result.json();
    },

    setAsDefaultGateway: async (gatewayCode: string) => {
        const result = await fetch(`/api/creator/gateways/default`, {
            method: 'PUT',
            body: JSON.stringify({ gatewayCode }),
            headers: {
                'Content-Type': 'application/json'
            }
        }); 

        return result.json();
    }

}