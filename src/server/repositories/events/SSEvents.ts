import { IDBConnection } from "@/server/lib/dbConnect";
import Payment from "@/models/Payment";
import { IPayment } from "@/models/interfaces/IPaymentInterfaces";

export interface ISSEvent {
    checkPayment(paymentCode: string): Promise<IPayment | null>;
}

export class SSEvents implements ISSEvent {
    private db: IDBConnection;

    constructor(db: IDBConnection) {
        this.db = db;
    }
    
    async checkPayment(paymentCode: string): Promise<IPayment | null> {
        try {
            await this.db.connect();

            const payment = await Payment!.findOne({ paymentCode })
            .populate('campaignId')
            .populate('userId');
            
            if(!payment){
                return null;
            }

            return payment as IPayment;
        } catch (error) {
            console.error('Error checking payment:', error);
            return null;
        }
    }
}