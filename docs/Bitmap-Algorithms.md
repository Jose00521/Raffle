# Algoritmos Otimizados para Bitmap+BitSet

## 🎲 Seleção Aleatória Eficiente

### Algoritmo Principal

```typescript
static sampleRandomNumbers(
  bitmap: Buffer, 
  totalNumbers: number, 
  count: number
): number[] {
  
  const result: number[] = [];
  const maxAttempts = count * 10; // Buffer de segurança
  let attempts = 0;
  
  // Para alta disponibilidade (>50%), usar amostragem simples
  const availableCount = this.countAvailableBits(bitmap, totalNumbers);
  const density = availableCount / totalNumbers;
  
  if (density > 0.5) {
    return this.simpleRandomSampling(bitmap, totalNumbers, count, maxAttempts);
  } else {
    return this.denseRandomSampling(bitmap, totalNumbers, count);
  }
}

// Amostragem simples para alta densidade
static simpleRandomSampling(
  bitmap: Buffer, 
  totalNumbers: number, 
  count: number, 
  maxAttempts: number
): number[] {
  
  const result = new Set<number>();
  let attempts = 0;
  
  while (result.size < count && attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * totalNumbers);
    
    if (this.isNumberAvailable(bitmap, randomNum)) {
      result.add(randomNum);
    }
    attempts++;
  }
  
  return Array.from(result);
}

// Amostragem densa para baixa densidade
static denseRandomSampling(
  bitmap: Buffer, 
  totalNumbers: number, 
  count: number
): number[] {
  
  // Coletar todos os números disponíveis
  const available: number[] = [];
  
  for (let i = 0; i < totalNumbers; i++) {
    if (this.isNumberAvailable(bitmap, i)) {
      available.push(i);
      
      // Otimização: parar quando temos o suficiente
      if (available.length >= count * 5) break;
    }
  }
  
  // Embaralhar e retornar
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  
  return available.slice(0, count);
}
```

## 📊 Contagem Otimizada de Bits

### Algoritmo de Contagem Ultra-Rápido

```typescript
static countAvailableBits(bitmap: Buffer, totalNumbers: number): number {
  let count = 0;
  const fullBytes = Math.floor(totalNumbers / 8);
  
  // Processar bytes completos
  for (let i = 0; i < fullBytes; i++) {
    count += this.popcount(bitmap[i]);
  }
  
  // Processar bits restantes no último byte
  const remainingBits = totalNumbers % 8;
  if (remainingBits > 0) {
    const lastByte = bitmap[fullBytes];
    const mask = (1 << remainingBits) - 1;
    count += this.popcount(lastByte & mask);
  }
  
  return count;
}

// Popcount: conta bits 1 em um byte (otimizado)
static popcount(byte: number): number {
  // Algoritmo Brian Kernighan
  let count = 0;
  let n = byte;
  
  while (n) {
    count++;
    n &= n - 1; // Remove o bit 1 mais à direita
  }
  
  return count;
}
```

## 🔄 Operações em Lote

### Venda em Massa Otimizada

```typescript
static async sellNumbersBatch(
  campaignId: string,
  numbers: number[]
): Promise<void> {
  
  // Agrupar por byte para otimizar operações
  const byteGroups = new Map<number, number[]>();
  
  for (const num of numbers) {
    const byteIndex = Math.floor(num / 8);
    if (!byteGroups.has(byteIndex)) {
      byteGroups.set(byteIndex, []);
    }
    byteGroups.get(byteIndex)!.push(num);
  }
  
  const rifa = await RiffaBitmap.findOne({ campaignId });
  let changedCount = 0;
  
  // Processar cada byte uma vez
  for (const [byteIndex, numsInByte] of byteGroups) {
    let byteMask = 0;
    
    // Criar máscara para todos os bits deste byte
    for (const num of numsInByte) {
      const bitIndex = num % 8;
      if (this.isNumberAvailable(rifa.bitmap, num)) {
        byteMask |= (1 << bitIndex);
        changedCount++;
      }
    }
    
    // Aplicar máscara de uma vez (operação atômica)
    rifa.bitmap[byteIndex] &= ~byteMask;
  }
  
  // Atualizar contador
  rifa.availableCount -= changedCount;
  rifa.markModified('bitmap');
  await rifa.save();
  
  console.log(`✅ Vendidos ${changedCount} números em lote`);
}
```

## 🔍 Busca Otimizada

### Encontrar Próximo Número Disponível

```typescript
static findNextAvailable(bitmap: Buffer, startFrom: number, totalNumbers: number): number {
  for (let i = startFrom; i < totalNumbers; i++) {
    if (this.isNumberAvailable(bitmap, i)) {
      return i;
    }
  }
  return -1; // Nenhum encontrado
}

// Busca em bloco (mais eficiente)
static findNextAvailableBlock(
  bitmap: Buffer, 
  startFrom: number, 
  totalNumbers: number
): number {
  
  const startByteIndex = Math.floor(startFrom / 8);
  const startBitIndex = startFrom % 8;
  
  // Verificar primeiro byte parcial
  if (startBitIndex > 0) {
    const firstByte = bitmap[startByteIndex];
    const mask = 0xFF << startBitIndex; // Máscara para bits relevantes
    const maskedByte = firstByte & mask;
    
    if (maskedByte > 0) {
      // Há bit disponível neste byte
      for (let bit = startBitIndex; bit < 8; bit++) {
        const number = startByteIndex * 8 + bit;
        if (number >= totalNumbers) return -1;
        if (this.isNumberAvailable(bitmap, number)) {
          return number;
        }
      }
    }
  }
  
  // Verificar bytes completos
  const endByteIndex = Math.floor(totalNumbers / 8);
  for (let byteIndex = startByteIndex + 1; byteIndex < endByteIndex; byteIndex++) {
    if (bitmap[byteIndex] > 0) {
      // Há pelo menos um bit disponível neste byte
      for (let bit = 0; bit < 8; bit++) {
        const number = byteIndex * 8 + bit;
        if (this.isNumberAvailable(bitmap, number)) {
          return number;
        }
      }
    }
  }
  
  // Verificar último byte parcial
  const remainingBits = totalNumbers % 8;
  if (remainingBits > 0 && endByteIndex < bitmap.length) {
    const lastByte = bitmap[endByteIndex];
    for (let bit = 0; bit < remainingBits; bit++) {
      const number = endByteIndex * 8 + bit;
      if (this.isNumberAvailable(bitmap, number)) {
        return number;
      }
    }
  }
  
  return -1;
}
```

## 📈 Estatísticas em Tempo Real

### Dashboard Analytics Otimizado

```typescript
static generateStats(bitmap: Buffer, totalNumbers: number): {
  total: number;
  available: number;
  sold: number;
  percentSold: number;
  density: number;
} {
  
  const available = this.countAvailableBits(bitmap, totalNumbers);
  const sold = totalNumbers - available;
  const percentSold = (sold / totalNumbers) * 100;
  const density = available / totalNumbers;
  
  return {
    total: totalNumbers,
    available,
    sold,
    percentSold: Math.round(percentSold * 100) / 100,
    density: Math.round(density * 10000) / 10000
  };
}

// Estatísticas por faixa
static generateRangeStats(
  bitmap: Buffer, 
  totalNumbers: number, 
  rangeSize: number = 1000000
): Array<{
  start: number;
  end: number;
  available: number;
  sold: number;
  density: number;
}> {
  
  const ranges = [];
  const numRanges = Math.ceil(totalNumbers / rangeSize);
  
  for (let i = 0; i < numRanges; i++) {
    const start = i * rangeSize;
    const end = Math.min((i + 1) * rangeSize - 1, totalNumbers - 1);
    
    let available = 0;
    for (let num = start; num <= end; num++) {
      if (this.isNumberAvailable(bitmap, num)) {
        available++;
      }
    }
    
    const total = end - start + 1;
    const sold = total - available;
    const density = available / total;
    
    ranges.push({
      start,
      end,
      available,
      sold,
      density: Math.round(density * 10000) / 10000
    });
  }
  
  return ranges;
}
``` 