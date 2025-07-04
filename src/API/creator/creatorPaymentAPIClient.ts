const creatorPaymentAPI = {
    getCreatorPaymentsById: async (id: string) => {
        const response = await fetch(`/api/creator/payments/${id}`);
        return response.json();
    }
}

export default creatorPaymentAPI;