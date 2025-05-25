/**
 * Interface para a resposta da API do ViaCEP
 */
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca um endereço com base no CEP informado utilizando a API do ViaCEP
 * @param cep CEP a ser consultado (apenas números)
 * @returns Dados do endereço ou null em caso de erro
 */
export async function fetchAddressByCEP(cep: string): Promise<ViaCepResponse | null> {
  // Remover caracteres não numéricos do CEP
  const cleanCep = cep.replace(/\D/g, '');
  
  // Validar se o CEP tem 8 dígitos
  if (cleanCep.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar CEP: ${response.status}`);
    }
    
    const data: ViaCepResponse = await response.json();
    
    // A API do ViaCEP retorna { erro: true } quando o CEP não é encontrado
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar endereço por CEP:', error);
    return null;
  }
} 