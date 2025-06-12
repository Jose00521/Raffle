export function GhostsPayService() {
  const createPixPayment = async (data: any) => {
    const response = await fetch(`${process.env.GH_URL}/api/v1/transaction.purchase`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.GH_SECRETE_KEY}`,
      },
    });

    return response.json();
  };

  return {
    createPixPayment
};
}