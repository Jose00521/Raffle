import { IPaymentPaginationRequest } from "@/models/interfaces/IPaymentInterfaces";


const creatorPaymentAPI = {
    getCreatorPaymentsById: async (id: string, params: IPaymentPaginationRequest) => {

        const searchParams = new URLSearchParams();
        searchParams.set('page', params.page.toString());
        searchParams.set('limit', params.pageSize.toString());
        if(params.searchTerm) searchParams.set('searchTerm', params.searchTerm);
        if(params.campaignId) searchParams.set('campaignId', params.campaignId);
        if(params.status) searchParams.set('status', params.status);
        if(params.startDate) searchParams.set('startDate', params.startDate);
        if(params.endDate) searchParams.set('endDate', params.endDate);

        console.log('searchParams', searchParams.toString());

        try {
            const response = await fetch(`/api/creator/${id}/payments?${searchParams.toString()}`);
            return response.json();
        } catch (error) {
            console.error('[GET PAGINATION] error', error);
            throw error;
        }
    },
    getLatestCreatorPaymentsById: async (id: string, params: Partial<IPaymentPaginationRequest>) => {

        const searchParams = new URLSearchParams();
        searchParams.set('limit', params.pageSize?.toString() || '10');
        if(params.campaignId) searchParams.set('campaignId', params.campaignId);
        if(params.startDate) searchParams.set('startDate', params.startDate);
        if(params.endDate) searchParams.set('endDate', params.endDate);

        console.log('searchParams', searchParams.toString());

        try {
            const response = await fetch(`/api/creator/${id}/payments/latest?${searchParams.toString()}`);
            return response.json();
        } catch (error) {
            console.error('[GET PAGINATION] error', error);
            throw error;
        }
    }
}

export default creatorPaymentAPI;