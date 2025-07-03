import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatusEnum, PaymentMethodEnum, IPayment } from '@/models/interfaces/IPaymentInterfaces';
import { ChevronDown, CheckCircle, Clock, CreditCard, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  payment: IPayment;
  showFullDetails?: boolean;
  className?: string;
  onViewDetails?: () => void;
}

const statusConfig = {
  [PaymentStatusEnum.PENDING]: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Pendente'
  },
  [PaymentStatusEnum.APPROVED]: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Aprovado'
  },
  [PaymentStatusEnum.DECLINED]: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Recusado'
  },
  [PaymentStatusEnum.REFUNDED]: {
    icon: CheckCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Reembolsado'
  },
  [PaymentStatusEnum.CANCELED]: {
    icon: AlertCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Cancelado'
  },
  [PaymentStatusEnum.EXPIRED]: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Expirado'
  }
};

const paymentMethodLabels = {
  [PaymentMethodEnum.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethodEnum.DEBIT_CARD]: 'Cartão de Débito',
  [PaymentMethodEnum.PIX]: 'PIX',
  [PaymentMethodEnum.BANK_SLIP]: 'Boleto',
  [PaymentMethodEnum.BANK_TRANSFER]: 'Transferência Bancária'
};

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  payment, 
  showFullDetails = false,
  className,
  onViewDetails
}) => {
  const [expanded, setExpanded] = useState(showFullDetails);
  const [copied, setCopied] = useState(false);
  
  const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig]?.icon || Clock;
  const formattedAmount = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(payment.amount);
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(payment.purchaseAt));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      'w-full rounded-xl overflow-hidden shadow-sm transition-all duration-300',
      statusConfig[payment.status as keyof typeof statusConfig].borderColor,
      statusConfig[payment.status as keyof typeof statusConfig].bgColor,
      'hover:shadow-md',
      className
    )}>
      {/* Header */}
      <div className="p-4 flex justify-between items-center cursor-pointer"
           onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            statusConfig[payment.status as keyof typeof statusConfig].color,
            "bg-white"
          )}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Pedido #{payment.paymentCode?.slice(-6) || "N/A"}</h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900">{formattedAmount}</p>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              statusConfig[payment.status as keyof typeof statusConfig].color,
              statusConfig[payment.status as keyof typeof statusConfig].bgColor,
            )}>
              {statusConfig[payment.status as keyof typeof statusConfig].label}
            </span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Cliente</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Nome:</span> {payment.customerInfo.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {payment.customerInfo.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Documento:</span> {payment.customerInfo.document}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Telefone:</span> {payment.customerInfo.phone}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Detalhes do Pagamento</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Método:</span> {paymentMethodLabels[payment.paymentMethod as keyof typeof paymentMethodLabels]}
                    </p>
                    {payment.installments && (
                      <p className="text-sm">
                        <span className="font-medium">Parcelamento:</span> {payment.installments}x de {
                          new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(payment.installmentAmount || 0)
                        }
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">ID da Transação:</span>
                      <span 
                        className="ml-2 inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(payment.processorTransactionId);
                        }}
                      >
                        {payment.processorTransactionId.slice(0, 12)}...
                        {copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Numbers */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Números Adquiridos</h4>
                <div className="flex flex-wrap gap-2 mt-1">

                </div>
              </div>
              
              {/* Call to action button */}
              {onViewDetails && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails();
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Detalhes Completos
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSummary; 