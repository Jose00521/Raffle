import { User } from "@/models/User";
import { DBConnection } from "@/server/lib/dbConnect";
import { IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import { SecureDataUtils, EncryptionService } from "@/utils/encryption";

export const unMaskUser = async (payment: IPaymentPattern) => {
    try {
        console.log('🔍 INÍCIO DO UNMASK - MESMA SESSÃO');
        
        // TESTE 1: Criar e descriptografar IMEDIATAMENTE (sem banco)
        console.log('🧪 TESTE 1 - SEM BANCO:');
        const testData = SecureDataUtils.encryptCPF("12345678901");
        const testDecrypt = SecureDataUtils.decryptCPF(testData);
        console.log('  ✅ Sem banco funcionou:', testDecrypt === "12345678901");
        
        const db = new DBConnection();
        await db.connect();
        
        // TESTE 2: Criar usuário e buscar IMEDIATAMENTE
        console.log('🧪 TESTE 2 - CRIAR E BUSCAR IMEDIATAMENTE:');
        
        const newUser = new User({
            name: "Teste Imediato",
            userCode: "TEST-IMMEDIATE-" + Date.now(),
            cpf: "12345678901", // Vai ser criptografado pelo hook
            email: "teste@teste.com",
            phone: "11999999999"
        });
        
        console.log('  📤 ANTES DO SAVE:', {
            cpf: newUser.cpf,
            cpf_encrypted: newUser.cpf_encrypted
        });
        
        await newUser.save();
        
        console.log('  📥 APÓS SAVE:', {
            cpf: newUser.cpf,
            cpf_encrypted: newUser.cpf_encrypted
        });
        
        // TESTE 3: Buscar do banco e tentar descriptografar
        const foundUser = await User.findById(newUser._id);
        console.log('  📋 ENCONTRADO NO BANCO:', {
            cpf_encrypted: foundUser?.cpf_encrypted
        });
        
        // TESTE 4: Tentar descriptografar IMEDIATAMENTE
        try {
            const decrypted = SecureDataUtils.decryptCPF(foundUser!.cpf_encrypted);
            console.log('  ✅ DESCRIPTOGRAFIA IMEDIATA FUNCIONOU:', decrypted);
        } catch (error) {
            console.error('  ❌ DESCRIPTOGRAFIA IMEDIATA FALHOU:', error);
            
            // Comparar dados
            console.log('  🔍 COMPARAÇÃO:');
            console.log('    Novo:', JSON.stringify(testData));
            console.log('    Banco:', JSON.stringify(foundUser!.cpf_encrypted));
        }
        
        // Limpar teste
        await User.findByIdAndDelete(newUser._id);
        
        // Continuar com o usuário real
        const user = await User.findOne({ userCode: payment.userCode });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        
        console.log('🧪 TESTE SIMULAÇÃO MONGODB...');
        
        // 1. Criar dados novos
        const newData = SecureDataUtils.encryptCPF("12345678901");
        console.log('✅ Dados originais:', newData);
        
        // 2. Simular processo do MongoDB
        const mongoSimulation = {
            cpf_encrypted: {
                encrypted: newData.encrypted,
                iv: newData.iv,
                tag: newData.tag,
                keyVersion: newData.keyVersion
            }
        };
        
        // 3. Converter para JSON e voltar (simula MongoDB)
        const jsonString = JSON.stringify(mongoSimulation);
        console.log('📄 JSON string:', jsonString);
        
        const parsedBack = JSON.parse(jsonString);
        console.log('📄 Parsed back:', parsedBack);
        
        // 4. Tentar descriptografar dados "simulados"
        try {
            const decrypted = SecureDataUtils.decryptCPF(parsedBack.cpf_encrypted);
            console.log('✅ Simulação MongoDB funcionou:', decrypted);
        } catch (error) {
            console.error('❌ Simulação MongoDB falhou:', error);
        }
        
        // 5. Comparar com dados reais do banco
        console.log('🔍 DADOS REAIS vs SIMULADOS:');
        console.log('  Real:', JSON.stringify(user.cpf_encrypted));
        console.log('  Simulado:', JSON.stringify(parsedBack.cpf_encrypted));
        
    } catch (error) {
        console.error('❌ ERRO GERAL:', error);
        throw error;
    }
};