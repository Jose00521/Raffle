import { formatCurrency } from '@/utils/formatNumber';

// Função para extrair valor numérico de uma string
export const extractNumericValue = (valueString: string): number => {
  try {
    const cleanString = valueString.replace(/[^\d,.]/g, '');
    const normalizedString = cleanString.replace(/,/g, '.');
    const value = parseFloat(normalizedString);
    return isNaN(value) ? 0 : value;
  } catch (error) {
    return 0;
  }
};

// Função para formatar valor como prêmio
export const formatPrizeValue = (value: string | number): string => {
  if (!value) return 'R$ 0,00';
  
  const valueString = typeof value === 'number' ? value.toString() : value;
  
  if (valueString.includes('R$')) {
    return valueString;
  }
  
  const numericValue = extractNumericValue(valueString);
  
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(numericValue);
};

// Função para detectar mudanças entre objetos
export const detectChanges = (original: any, current: any, path: string = ''): any => {
  const changes: any = {};
  
  // Handle arrays
  if (Array.isArray(original) && Array.isArray(current)) {
    if (JSON.stringify(original) !== JSON.stringify(current)) {
      changes[path] = {
        original: original,
        current: current,
        hasChanged: true
      };
    }
    return changes;
  }
  
  // Handle objects
  if (typeof original === 'object' && original !== null && typeof current === 'object' && current !== null) {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const originalValue = original[key];
      const currentValue = current[key];
      
      if (typeof originalValue === 'object' && originalValue !== null && 
          typeof currentValue === 'object' && currentValue !== null) {
        Object.assign(changes, detectChanges(originalValue, currentValue, currentPath));
      } else if (originalValue !== currentValue) {
        changes[currentPath] = {
          original: originalValue,
          current: currentValue,
          hasChanged: true
        };
      }
    }
    
    return changes;
  }
  
  // Handle primitive values
  if (original !== current) {
    changes[path] = {
      original: original,
      current: current,
      hasChanged: true
    };
  }
  
  return changes;
};

// Função para verificar se os requisitos básicos estão atendidos
export const checkBasicRequirements = (totalNumbers: number, price: number, returnExpected: string): boolean => {
  return totalNumbers > 0 && price > 0 && Boolean(returnExpected && returnExpected.trim() !== '');
};

// Função para obter mensagem de requisitos não atendidos
export const getBasicRequirementsMessage = (totalNumbers: number, price: number, returnExpected: string): string => {
  if (!price || price <= 0) {
    return "Defina o preço por número primeiro";
  }
  if (!returnExpected || returnExpected.trim() === '') {
    return "Defina o retorno esperado primeiro";
  }
  if (!totalNumbers || totalNumbers <= 0) {
    return "Aguarde o cálculo automático do total de números";
  }
  return "";
};

// Função para preparar dados para API
export const prepareUpdateDataForApi = (data: any, changes: any, campaignId: string): any => {
  const updatedFields: any = {};
  const fieldsChanged: string[] = [];
  
  // Processar apenas os campos que mudaram
  Object.keys(changes).forEach(fieldPath => {
    if (changes[fieldPath].hasChanged) {
      const pathParts = fieldPath.split('.');
      const topLevelField = pathParts[0];
      
      if (!fieldsChanged.includes(topLevelField)) {
        fieldsChanged.push(topLevelField);
      }
      
      // Mapear para a estrutura da API
      switch (topLevelField) {
        case 'title':
        case 'description':
        case 'regulation':
        case 'returnExpected':
        case 'status':
        case 'canceled':
        case 'isScheduled':
        case 'minNumbersPerUser':
        case 'maxNumbersPerUser':
        case 'winnerPositions':
          updatedFields[topLevelField] = data[topLevelField];
          break;
          
        case 'individualNumberPrice':
          updatedFields.individualNumberPrice = data.individualNumberPrice;
          break;
          
        case 'totalNumbers':
          updatedFields.totalNumbers = data.totalNumbers;
          break;
          
        case 'drawDate':
          updatedFields.drawDate = new Date(data.drawDate);
          break;
          
        case 'scheduledActivationDate':
          updatedFields.scheduledActivationDate = data.isScheduled && data.scheduledActivationDate 
            ? new Date(data.scheduledActivationDate) 
            : null;
          break;
          
        case 'prizeDistribution':
          updatedFields.prizeDistribution = data.prizeDistribution.map((positionData: any) => ({
            position: positionData.position,
            prizes: positionData.prizes
              .filter((prize: any) => prize.name)
              .map((prize: any) => prize.prizeId),
            description: positionData.description || 
              `${positionData.position === 1 ? 'Prêmio principal' : `${positionData.position}º lugar`}: ${
                positionData.prizes.length > 1 
                  ? `${positionData.prizes.length} prêmios` 
                  : positionData.prizes[0]?.name || 'Não especificado'
              }`
          }));
          break;
          
        case 'enablePackages':
        case 'numberPackages':
          if (!updatedFields.numberPackages) {
            updatedFields.numberPackages = data.enablePackages ? data.numberPackages.map((pkg: any) => {
              const originalPrice = data.individualNumberPrice * pkg.quantity;
              const discountedPrice = originalPrice * (1 - pkg.discount / 100);
              
              return {
                name: pkg.name,
                description: pkg.description || `Pacote com ${pkg.quantity} números`,
                quantity: pkg.quantity,
                price: Number(discountedPrice.toFixed(2)),
                discount: pkg.discount,
                isActive: pkg.isActive !== undefined ? pkg.isActive : true,
                highlight: pkg.highlight || false,
                order: pkg.order || 1,
                maxPerUser: pkg.maxPerUser
              };
            }) : [];
          }
          break;
          
        case 'coverImage':
        case 'images':
          if (!updatedFields.coverImage && data.coverImage) {
            updatedFields.coverImage = data.coverImage;
          }
          if (!updatedFields.images) {
            updatedFields.images = data.images.filter((img: any) => img !== data.coverImage);
          }
          break;
      }
    }
  });

  return {
    campaignId,
    updatedFields,
    fieldsChanged
  };
}; 