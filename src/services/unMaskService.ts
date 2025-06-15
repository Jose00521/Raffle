import { User } from "@/models/User";
import { DBConnection } from "@/server/lib/dbConnect";
import { IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import { SecureDataUtils, EncryptionService } from "@/utils/encryption";
import { ApiError } from "@/server/utils/errorHandler/ApiError";

export const unMaskUser = async (payment: IPaymentPattern) => {
    try {
        console.log('🔍 INÍCIO DO UNMASK - MESMA SESSÃO');
    
        
        const db = new DBConnection();
        await db.connect();
        
        const user = await User.findOne({ userCode: payment.userCode });

        if(!user){
            throw new ApiError({
                success: false,
                message: 'Usuário não encontrado',
                statusCode: 404,
                cause: new Error('Usuário não encontrado')
            });
        }   

        const decryptedCpf = SecureDataUtils.decryptCPF(user.cpf_encrypted);
        const decryptedEmail = EncryptionService.decrypt(user.email_encrypted);
        const decryptedPhone = EncryptionService.decrypt(user.phone_encrypted);
        const decryptedStreet = SecureDataUtils.decryptStreet(user.address.street_encrypted);
        const decryptedNumber = SecureDataUtils.decryptNumber(user.address.number_encrypted);
        const decryptedComplement = SecureDataUtils.decryptComplement(user.address.complement_encrypted);
        const decryptedZipCode = SecureDataUtils.decryptZipCode(user.address.zipCode_encrypted);

        console.log('🔍 DECRYPTED CPF:', decryptedCpf);
        console.log('🔍 DECRYPTED EMAIL:', decryptedEmail);
        console.log('🔍 DECRYPTED PHONE:', decryptedPhone);

        return {
            ...payment,
            cpf: decryptedCpf,
            email: decryptedEmail,
            phone: decryptedPhone,
            address: {
                ...user.address,
                street: decryptedStreet,
                number: decryptedNumber,
                complement: decryptedComplement,
                zipCode: decryptedZipCode,
            }
        };

        
    } catch (error) {
        console.error('❌ ERRO GERAL:', error);
        throw error;
    }
};