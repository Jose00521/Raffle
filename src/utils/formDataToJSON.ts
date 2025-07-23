/**
 * Converte um objeto FormData em JSON, suportando objetos aninhados, arrays e arquivos
 * @param formData O objeto FormData a ser convertido
 * @param includeFiles Determina como tratar arquivos: true = incluir metadados, false = omitir (padrão)
 * @returns Um objeto JavaScript/JSON com todos os dados do FormData
 */
/**
 * Converte FormData para um objeto JavaScript/JSON com suporte a estruturas complexas
 * @param formData O FormData a ser convertido
 * @returns Um objeto estruturado com os dados do formulário
 */
export function formDataToJSON(formData: FormData): Record<string, any> {
    // Passo 1: Extrair todos os pares chave-valor do FormData
    const entries = Array.from(formData.entries());
    const result: Record<string, any> = {};
    
    // Passo 2: Processar cada entrada
    for (const [key, value] of entries) {
      // Tratar arquivos de forma especial
      if (value instanceof File) {
        // Se o arquivo estiver vazio (nenhum arquivo selecionado), ignorar
        if (value.name === '' || value.size === 0) continue;
        
        setNestedProperty(result, key, value);
        continue;
      }
      
      // Converter tipos primitivos
      const processedValue = processValue(value);
      
      // Definir a propriedade (possivelmente aninhada)
      setNestedProperty(result, key, processedValue);
    }
    
    // Passo 3: Processar arrays implícitos
    processImplicitArrays(result);
    
    return result;
  }
  
  /**
   * Processa um valor string para converter para o tipo primitivo correto
   */
  function processValue(value: string | File): any {
    if (value instanceof File) return value;
    
    // Valores booleanos
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (value === '') return '';
    
    // Tentar converter para número
    const numValue = Number(value);
    if (!isNaN(numValue) && /^-?\d+(\.\d+)?$/.test(value)) return numValue;
    
    // Tentar converter string JSON
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // Não é JSON válido, manter como string
      }
    }
    
    return value;
  }
  
  /**
   * Define uma propriedade aninhada em um objeto
   */
  function setNestedProperty(obj: Record<string, any>, propertyPath: string, value: any): void {
    // Reconhece padrões como: usuario.endereco.rua, array[0], usuario[perfil].nome, etc.
    const parts = propertyPath
      .replace(/\[([^\]]+)\]/g, '.$1') // Converte [x] para .x
      .split('.');
    
    let target = obj;
    const lastKey = parts.pop()!;
    
    // Navega pela estrutura de objetos, criando-a conforme necessário
    for (const part of parts) {
      if (!(part in target)) {
        // Se a próxima parte parece um número, criar um array, caso contrário um objeto
        const nextPart = parts[parts.indexOf(part) + 1];
        target[part] = nextPart && !isNaN(Number(nextPart)) ? [] : {};
      }
      target = target[part];
    }
    
    // Atribui o valor final
    target[lastKey] = value;
  }
  
  /**
   * Processa arrays implícitos no objeto (como campos com índices)
   */
  function processImplicitArrays(obj: Record<string, any>): void {
    for (const key in obj) {
      // Se for um objeto, processa recursivamente
      if (obj[key] && typeof obj[key] === 'object' && !isFileObject(obj[key])) {
        // Verifica se é um objeto com chaves numéricas (candidato a array)
        const isArrayLike = Object.keys(obj[key])
          .every(k => !isNaN(Number(k)) && parseInt(k).toString() === k);
        
        if (isArrayLike && Object.keys(obj[key]).length > 0) {
          // Converte para array real e garante ordem
          const indices = Object.keys(obj[key]).map(Number);
          const maxIndex = Math.max(...indices);
          const arr = new Array(maxIndex + 1);
          
          // Preenche o array com os valores corretos
          for (const i of indices) {
            arr[i] = obj[key][i];
          }
          
          obj[key] = arr;
        }
        
        // Continua processamento recursivo
        processImplicitArrays(obj[key]);
      }
    }
  }
  
  /**
   * Verifica se o objeto é um objeto File
   */
  function isFileObject(obj: any): boolean {
    return obj instanceof File || 
      (obj && typeof obj === 'object' && 'name' in obj && 'size' in obj && 'type' in obj);
  }
  
  /**
   * Função de alto nível que converte FormData para JSON otimizada para uso em aplicações React
   * @param formData O FormData a ser convertido
   * @returns O objeto JSON resultante
   */
  export const convertFormDataToJSON = (formData: FormData): Record<string, any> => {
    const result = formDataToJSON(formData);
    
    // Detecta e trata arrays dispersos para garantir sequência correta
    const fixArrays = (obj: Record<string, any>) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          // Verifica se o objeto é um array disperso (sparse array)
          if (Array.isArray(obj[key])) {
            // Remove buracos no array
            obj[key] = Object.values(obj[key]);
          }
          // Recursivamente corrige arrays aninhados
          fixArrays(obj[key]);
        }
      }
      return obj;
    };
    
    return fixArrays(result);
  };
