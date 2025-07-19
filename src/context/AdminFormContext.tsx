import { AdminCompleteSchema, AdminStepSchemas, AdminComplete} from '@/zod/admin.schema';
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
    })

    const { trigger, setValue, getValues, setError, clearErrors } = form;


    return (
        <AdminFormContext.Provider value={{
            form,
            step: 1,
            isSliding: false,
            isSubmitting: false,
            handleNextStep: async () => {},
            handlePrevStep: () => {},
            setStep: () => {},
            setIsSubmitting: () => {},
            onSubmit: async () => {},
        }}>
            {children}
        </AdminFormContext.Provider>
    );
}

// Hook para acessar o contexto
export const useCreatorFormContext = () => {
    const context = useContext(AdminFormContext);
    if (context === undefined) {
      throw new Error('useCreatorFormContext must be used within a CreatorFormProvider');
    }
    return context;
  };

