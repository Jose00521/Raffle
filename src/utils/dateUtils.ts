/**
 * Utilitários para manipulação de datas evitando problemas de timezone
 */

/**
 * Converte uma data local para ISO string mantendo a data local (sem conversão UTC)
 * Resolve o problema comum onde toISOString() causa mudança de dia devido ao timezone
 * 
 * @param date - Data local a ser convertida
 * @returns String ISO da data local ou string vazia se date for null/undefined
 * 
 * @example
 * // Se hoje é 15/01/2025 no Brasil (UTC-3)
 * const date = new Date(2025, 0, 15); // 15 de janeiro local
 * 
 * // ❌ Problema: toISOString() converte para UTC
 * date.toISOString() // "2025-01-15T03:00:00.000Z" (mudou para 3h da manhã UTC)
 * 
 * // ✅ Solução: formatLocalDateToISOString mantém a data local
 * formatLocalDateToISOString(date) // "2025-01-15T00:00:00.000Z" (mantém 15 de janeiro)
 */
export const formatLocalDateToISOString = (date: Date | null): string => {
  if (!date) return '';
  
  // Ajusta a data removendo o offset de timezone
  // Isso previne que toISOString() cause mudança de dia
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
};

/**
 * Converte uma data local para ISO string de final de dia mantendo a data local
 * Útil para queries de "até" uma determinada data
 * 
 * @param date - Data local a ser convertida
 * @returns String ISO da data local no final do dia (23:59:59.999Z)
 */
export const formatLocalDateToEndOfDayISOString = (date: Date | null): string => {
  if (!date) return '';
  
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0] + 'T23:59:59.999Z';
};

/**
 * Cria uma nova instância de Date a partir de uma string ISO mantendo a data local
 * Resolve o problema onde new Date(isoString) interpreta como UTC
 * 
 * @param isoString - String ISO da data
 * @returns Nova instância de Date na timezone local
 */
export const createLocalDateFromISOString = (isoString: string): Date => {
  const date = new Date(isoString);
  return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
};

/**
 * Converte uma data para o formato brasileiro (dd/mm/yyyy)
 * 
 * @param date - Data a ser formatada
 * @returns String no formato dd/mm/yyyy
 */
export const formatDateToBrazilian = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Converte uma data para o formato brasileiro com horário (dd/mm/yyyy às HH:mm)
 * 
 * @param date - Data a ser formatada
 * @returns String no formato dd/mm/yyyy às HH:mm
 */
export const formatDateTimeToBrazilian = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Verifica se duas datas são do mesmo dia (ignorando horário)
 * 
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @returns True se são do mesmo dia
 */
export const isSameLocalDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * 📝 MELHORIAS IMPLEMENTADAS NO SISTEMA:
 * 
 * 🔧 PaymentRepository.ts:
 * - Corrigido bug onde Object.assign sobrescrevia condições de data
 * - Agora constrói corretamente queries com $gte E $lte simultaneamente
 * 
 * 🔧 Dashboard do Criador:
 * - Substituído toISOString() por formatLocalDateToISOString()
 * - Evita mudança de dia devido ao timezone UTC
 * 
 * ✅ Resultado: DateRangePicker agora retorna as datas corretas!
 */ 