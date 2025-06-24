import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function usePaymentMonitor(paymentCode: string) {
    const [status, setStatus] = useState('PENDING');
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);
    const router = useRouter();

    useEffect(() => {
      // Verificar se o paymentCode é válido
      if (!paymentCode || paymentCode === '') {
        console.log('Payment code não encontrado ou vazio');
        return;
      }
      
      console.log('Iniciando monitoramento para pagamento:', paymentCode);
      
      // Criar conexão SSE
      const eventSource = new EventSource(`http://localhost:3000/api/payment/events/${paymentCode}`);
      
      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('Conexão SSE estabelecida com sucesso para:', paymentCode);
      };
      
      eventSource.onmessage = (event) => {
        console.log('Evento recebido no usePaymentMonitor', event);
        const data = JSON.parse(event.data);
        console.log('Data recebida no usePaymentMonitor', data);
        setLastEvent(data);
        
        // Ignorar heartbeats
        if (data.type === 'heartbeat') return;
        
        // Atualizar status se disponível
        if (data.status) {
          setStatus(data.status);
        }
        
        // Processar eventos de pagamento
        if (data.type === 'payment:approved') {
          toast.success('Seu pagamento foi aprovado!');

          localStorage.setItem('paymentData', JSON.stringify({
            ...data
          }));

          router.push(`/campanhas/${data.campaignCode}/checkout/success`);
        } else if (data.type === 'payment:failed' || data.type === 'payment:expired') {
          toast.error(`Seu pagamento foi ${data.status === 'FAILED' ? 'recusado' : 'expirado'}.`);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('Erro na conexão SSE:', error);
        setIsConnected(false);
        // A reconexão é automática pelo navegador
      };
      
      // Limpar ao desmontar
      return () => {
        console.log('Fechando conexão SSE para:', paymentCode);
        eventSource.close();
      };
    }, [paymentCode, router]);
    
    return { status, isConnected, lastEvent };
  }