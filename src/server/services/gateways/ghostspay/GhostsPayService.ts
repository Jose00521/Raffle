export function GhostsPayService() {
  const createPixPayment = async (data: any) => {
    const response = await fetch(`${process.env.GHOSTS_PAY_URL || 'https://app.ghostspaysv1.com'}/api/v1/transaction.purchase`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.GH_SECRETE_KEY || '481f763e-a7ae-4f2b-af23-473b0f84b68e'}`,
      },
    });

    return response.json();
  };

  return {
    createPixPayment
};
}