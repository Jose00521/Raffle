import { AdminCompleteSchema, AdminComplete, } from '@/zod/admin.schema';
import { createContext, useContext, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import adminAPIClient from '@/API/admin/adminAPIClient';
import { IAdmin } from '@/models/interfaces/IUserInterfaces';
import mongoose from 'mongoose';

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

export const AdminFormProvider: React.FC<{ children: React.ReactNode, token: string }> = ({ children, token }) => {
    const [step, setStep] = useState(1);
    const [isSliding, setIsSliding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<AdminComplete>({
        resolver: zodResolver(AdminCompleteSchema),
        mode: 'all',
        defaultValues: {
            phone: '',
            confirmPhone: '',
            password: '',
            confirmPassword: '',
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

    const validateStep = async (currentStep: number) => {
            // Validar campos do step atual
            
            const fieldsByStep: Record<number, (keyof AdminComplete)[]> = {
                1: ['name', 'email', 'phone', 'confirmPhone', 'cpf', 'birthDate'],
                2: ['password', 'confirmPassword'],
                3: ['permissions', 'accessLevel', 'notificationPreferences'],
                4: ['termsAgreement']
            }       

        try {
            console.log('trigger', fieldsByStep[currentStep])
            const result = await trigger(fieldsByStep[currentStep], { shouldFocus: true });
            return result;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    const handleNextStep = async (): Promise<void> => {
        const isStepValid = await validateStep(step);
        console.log('step', step)
        console.log('isStepValid', isStepValid)
    
        if (isStepValid) {
          setIsSliding(true);
          // Reduzindo para 300ms para uma resposta mais rápida
          setTimeout(() => {
            setStep(step + 1);
            // Mantendo o pequeno atraso para uma transição suave
            setTimeout(() => {
              setIsSliding(false);
            }, 50);
          }, 200);
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
            console.log('Dados do admin para cadastro:', {
                ...data,
                token: token
            });
            
            const payload : Partial<IAdmin> = {
                ...data,
                role: 'admin',
                adminSettings: {
                    accessLevel: data.accessLevel,
                    notificationPreferences: data.notificationPreferences,
                    lastPasswordChange: new Date(),
                    mustChangePassword: false
                },
                inviteUsed: {
                inviteToken: token,
                inviteId: new mongoose.Types.ObjectId(''),
                usedAt: new Date()
                },
                isActive:true,
                security: {
                    twoFactorEnabled: false,
                    twoFactorSecret: '',
                    backupCodes: [],
                    lastSecurityCheck: new Date()
                },
                metadata: {
                    createdVia: 'INVITE',
                    createdBy: 'ADMIN',
                }
            }
            
            
            const result = adminAPIClient.createAdmin(payload)

            console.log('result',result)
            
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

