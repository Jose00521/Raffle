const creatorPaymentAPI = {
    getCreatorPaymentsById: async (id: string, page: number, limit: number) => {
        try {
            const response = await fetch(`/api/creator/${id}/payments?page=${page}&limit=${limit}`);
            return response.json();
        } catch (error) {
            console.error('[GET PAGINATION] error', error);
            throw error;
        }
    }
}

export default creatorPaymentAPI;