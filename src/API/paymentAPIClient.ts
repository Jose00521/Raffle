const paymentAPIClient = {
    createPixPayment: async (data: any) => {
        const response = await fetch('/api/payment', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response.json();
    }
}

export default paymentAPIClient;