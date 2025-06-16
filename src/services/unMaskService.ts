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

        const decryptedCpf = user.cpf_encrypted ? SecureDataUtils.decryptCPF(user.cpf_encrypted) : '';
        const decryptedEmail = user.email_encrypted ? EncryptionService.decrypt(user.email_encrypted) : '';
        const decryptedPhone = user.phone_encrypted ? EncryptionService.decrypt(user.phone_encrypted) : '';
        
        // Verificar se o usuário tem endereço completo antes de descriptografar
        const decryptedStreet = user.address?.street_encrypted ? SecureDataUtils.decryptStreet(user.address.street_encrypted) : '';
        const decryptedNumber = user.address?.number_encrypted ? SecureDataUtils.decryptNumber(user.address.number_encrypted) : '';
        const decryptedComplement = user.address?.complement_encrypted ? SecureDataUtils.decryptComplement(user.address.complement_encrypted) : '';
        const decryptedZipCode = user.address?.zipCode_encrypted ? SecureDataUtils.decryptZipCode(user.address.zipCode_encrypted) : '';

        console.log('🔍 DECRYPTED CPF:', decryptedCpf);
        console.log('🔍 DECRYPTED EMAIL:', decryptedEmail);
        console.log('🔍 DECRYPTED PHONE:', decryptedPhone);

        return {
            ...payment,
            cpf: decryptedCpf,
            email: decryptedEmail,
            phone: decryptedPhone,
            address: {
                city: user.address?.city,
                state: user.address?.state,
                neighborhood: user.address?.neighborhood,
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