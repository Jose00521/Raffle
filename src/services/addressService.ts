interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;  // cidade
  uf: string;
  erro?: boolean;
}

/**
 * Busca endereço por CEP utilizando a API ViaCEP
 * @param cep CEP a ser buscado (apenas números)
 * @returns Dados do endereço ou null se não encontrado
 */
export const fetchAddressByCep = async (cep: string): Promise<AddressData | null> => {
  // Remover caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }
    
    const data = await response.json();
    
    // Se a API retornar erro, retornamos null
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
}; 