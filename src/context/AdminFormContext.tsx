import { AdminCompleteSchema, AdminComplete, } from '@/zod/admin.schema';
import { createContext, useContext, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

// Interface do contexto do formulário
interface FormContextType {
    form: UseFormReturn<AdminComplete>;
    step: number;
    isSliding: boolean;
    isSubmitting: boolean;
    handleNextStep: () => Promise<void>;
    handlePrevStep: () => void;
    setStep: (step: number) => void;
    setIsSubmitting: (value: boolean) => void;
    onSubmit: (data: AdminComplete) => Promise<void>;
}

// Criação do contexto
const AdminFormContext = createContext<FormContextType | undefined>(undefined);

export const AdminFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [step, setStep] = useState(1);
    const [isSliding, setIsSliding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<AdminComplete>({
        resolver: zodResolver(AdminCompleteSchema),
        mode: 'all',
        defaultValues: {
            permissions: [],
            accessLevel: 'ADMIN',
            notificationPreferences: {
                emailAlerts: true,
                systemAlerts: true,
                securityAlerts: true
            },
            termsAgreement: false
        }
    });

    const { trigger } = form;

    const handleNextStep = async (): Promise<void> => {
        setIsSliding(true);
        
        try {
            // Validar campos do step atual
            let isValid = false;
            
            switch (step) {
                case 1:
                    isValid = await trigger(['name', 'email', 'phone', 'confirmPhone', 'cpf', 'birthDate']);
                    break;
                    
                case 2:
                    isValid = await trigger(['password', 'confirmPassword']);
                    break;
                    
                case 3:
                    isValid = await trigger(['permissions', 'accessLevel', 'notificationPreferences']);
                    break;
                    
                case 4:
                    isValid = await trigger(['termsAgreement']);
                    break;
                    
                default:
                    isValid = true;
            }
            
            if (isValid) {
                setStep(prevStep => prevStep + 1);
            }
        } catch (error) {
            console.error('Erro na validação:', error);
        } finally {
            setTimeout(() => setIsSliding(false), 300);
        }
    };
    
      // Função para ir para a etapa anterior
      const handlePrevStep = () => {
        setIsSliding(true);
        // Reduzindo para 300ms para uma resposta mais rápida
        setTimeout(() => {
          setStep(step - 1);
          // Mantendo o pequeno atraso para uma transição suave
          setTimeout(() => {
            setIsSliding(false);
          }, 50);
        }, 300);
      };
    const onSubmit = async (data: AdminComplete): Promise<void> => {
        setIsSubmitting(true);
        
        try {
            console.log('Dados do admin para cadastro:', data);
            
            // Aqui você faria a chamada para a API
            // const response = await createAdmin(data);
            
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Redirecionar para página de sucesso
            router.push('/cadastro-sucesso?type=admin');
            
        } catch (error) {
            console.error('Erro ao cadastrar admin:', error);
            // Aqui você pode mostrar uma mensagem de erro
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminFormContext.Provider value={{
            form,
            step,
            isSliding,
            isSubmitting,
            handleNextStep,
            handlePrevStep,
            setStep,
            setIsSubmitting,
            onSubmit,
        }}>
            {children}
        </AdminFormContext.Provider>
    );
};

// Hook para acessar o contexto
export const useAdminFormContext = () => {
    const context = useContext(AdminFormContext);
    if (context === undefined) {
        throw new Error('useAdminFormContext must be used within an AdminFormProvider');
    }
    return context;
};

