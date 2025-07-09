 # Estratégia de Sharding para Bitmap em Rifas de Grande Escala

## 📖 Índice

1. [Introdução](#introdução)
2. [Problema e Solução](#problema-e-solução)
3. [Arquitetura do Bitmap Shardado](#arquitetura-do-bitmap-shardado)
4. [Implementação](#implementação)
5. [Operações Principais](#operações-principais)
6. [Considerações de Performance](#considerações-de-performance)
7. [Comparação com Bitmap Único](#comparação-com-bitmap-único)
8. [Conclusões](#conclusões)

---

## 🎯 Introdução

Este documento apresenta a estratégia de sharding (fragmentação) para o sistema de bitmap usado em rifas de grande escala. Esta abordagem permite gerenciar rifas com **bilhões de números** de forma eficiente, superando as limitações de tamanho do MongoDB e melhorando a performance das operações.

---

## 🔍 Problema e Solução

### Problema Atual
- O MongoDB limita documentos a 16MB
- Um bitmap para 1 bilhão de números requer ~125MB (muito acima do limite)
- Operações em bitmaps muito grandes podem ser lentas
- Risco de bloqueio de documento durante atualizações concorrentes

### Solução Proposta
- **Sharding do Bitmap**: Dividir o bitmap em múltiplos fragmentos (shards)
- Cada shard gerencia uma faixa específica de números (ex: 10 milhões por shard)
- Metadados centralizados para rastrear informações globais
- Operações distribuídas entre os shards

---

## 🏗️ Arquitetura do Bitmap Shardado

### Componentes Principais

1. **BitMapMeta**: Documento com metadados do bitmap completo
   - Armazena informações sobre o número total, contagem de shards, etc.
   - Mantém um contador global de números disponíveis

2. **BitMapShard**: Múltiplos documentos, cada um contendo um fragmento do bitmap
   - Cada shard gerencia uma faixa específica de números
   - Shards são independentes para operações de leitura/escrita

### Estrutura de Dados

```typescript
// Metadados do bitmap shardado
interface IBitmapMeta {
  campaignId: ObjectId;
  totalNumbers: number;       // Total de números na rifa
  shardSize: number;          // Tamanho de cada shard (em números)
  shardCount: number;         // Quantidade total de shards
  availableCount: number;     // Contagem total de números disponíveis
}

// Shard individual do bitmap
interface IBitmapShard {
  campaignId: ObjectId;
  shardIndex: number;         // Índice do shard (0, 1, 2, ...)
  startNumber: number;        // Número inicial deste shard
  endNumber: number;          // Número final deste shard
  bitmap: Buffer;             // Buffer contendo os bits para este shard
  availableCount: number;     // Contagem de números disponíveis neste shard
}
```

---

## 💻 Implementação

### Estratégia de Sharding

Para uma rifa com 1 bilhão de números, poderíamos usar:
- **Tamanho do shard**: 10 milhões de números por shard
- **Número de shards**: 100 shards
- **Tamanho de cada documento**: ~1.25MB por shard (bem abaixo do limite de 16MB)

### Inicialização

```typescript
// Pseudocódigo para inicialização
function initializeShardedBitmap(campaignId, totalNumbers) {
  // Determinar o tamanho ideal de cada shard
  const shardSize = 10_000_000; // 10 milhões
  const shardCount = Math.ceil(totalNumbers / shardSize);
  
  // Criar metadados
  createBitmapMeta(campaignId, totalNumbers, shardSize, shardCount);
  
  // Criar cada shard
  for (let i = 0; i < shardCount; i++) {
    const startNumber = i * shardSize;
    const endNumber = Math.min((i + 1) * shardSize - 1, totalNumbers - 1);
    createBitmapShard(campaignId, i, startNumber, endNumber);
  }
}
```

---

## 🔄 Operações Principais

### Verificar Disponibilidade de um Número

```typescript
async function isNumberAvailable(campaignId, number) {
  // Obter metadados
  const meta = await getBitmapMeta(campaignId);
  
  // Calcular qual shard contém o número
  const shardIndex = Math.floor(number / meta.shardSize);
  const relativeNumber = number % meta.shardSize;
  
  // Obter o shard específico
  const shard = await getBitmapShard(campaignId, shardIndex);
  
  // Verificar disponibilidade no shard
  return checkBitInShard(shard.bitmap, relativeNumber);
}
```

### Marcar Números como Indisponíveis

```typescript
async function markNumbersAsTaken(campaignId, numbers) {
  // Obter metadados
  const meta = await getBitmapMeta(campaignId);
  
  // Agrupar números por shard
  const numbersByShardIndex = groupNumbersByShardIndex(numbers, meta.shardSize);
  
  // Processar cada shard
  for (const [shardIndex, relativeNumbers] of Object.entries(numbersByShardIndex)) {
    // Obter e atualizar o shard
    updateShardBits(campaignId, shardIndex, relativeNumbers);
  }
  
  // Atualizar contador global
  updateMetaAvailableCount(campaignId, -numbers.length);
}
```

### Selecionar Números Aleatórios

```typescript
async function selectRandomNumbers(campaignId, quantity) {
  // Obter metadados
  const meta = await getBitmapMeta(campaignId);
  
  // Distribuir a seleção proporcionalmente entre os shards
  const selected = [];
  const shardsInfo = await getShardsAvailabilityInfo(campaignId);
  
  for (const shardInfo of shardsInfo) {
    // Calcular quantos números pegar deste shard (proporcional à disponibilidade)
    const toSelect = calculateProportionalSelection(shardInfo, meta, quantity);
    
    // Selecionar números aleatórios deste shard
    const numbersFromShard = selectRandomNumbersFromShard(campaignId, shardInfo.index, toSelect);
    selected.push(...numbersFromShard);
  }
  
  return selected;
}
```

---

## ⚡ Considerações de Performance

### Vantagens

1. **Escalabilidade**: Suporta rifas com bilhões de números
2. **Paralelismo**: Operações em diferentes shards podem ocorrer simultaneamente
3. **Redução de Contenção**: Menor probabilidade de conflitos em operações concorrentes
4. **Distribuição de Carga**: Operações distribuídas entre múltiplos documentos

### Otimizações

1. **Tamanho do Shard**: 
   - Muito pequeno: Overhead de metadados e mais operações de banco
   - Muito grande: Aproxima-se do limite de 16MB
   - Ideal: 5-10 milhões de números por shard (~0.6-1.25MB)

2. **Caching**:
   - Cache de metadados para reduzir consultas
   - Cache de shards frequentemente acessados

3. **Operações em Lote**:
   - Agrupar operações no mesmo shard
   - Usar transações para garantir consistência

---

## 📊 Comparação com Bitmap Único

| Métrica | **Bitmap Único** | **Bitmap Shardado** |
|---------|------------------|---------------------|
| **Tamanho Máximo** | ~120 milhões de números | Bilhões de números |
| **Velocidade de Acesso** | Mais rápida para rifas pequenas | Mais rápida para rifas grandes |
| **Concorrência** | Contenção em um único documento | Melhor distribuição de carga |
| **Complexidade** | Simples | Moderada |
| **Overhead de Armazenamento** | Menor | Ligeiramente maior (metadados) |

---

## 🏁 Conclusões

A estratégia de sharding do bitmap permite:

1. **Superar o limite de 16MB** do MongoDB para documentos
2. **Escalar para bilhões de números** sem degradação significativa de performance
3. **Melhorar a concorrência** em operações simultâneas
4. **Manter a eficiência** do bitmap para gerenciamento de disponibilidade

Esta abordagem é ideal para rifas de grande escala, permitindo que o sistema suporte desde pequenas rifas até megassorteios com bilhões de números, mantendo a performance e a confiabilidade.

# Implementação de Sharding para Bitmap de Rifa

## Visão Geral

Para suportar rifas com grandes quantidades de números (dezenas de milhões a bilhões), implementamos um sistema de sharding (fragmentação) do bitmap. Esta abordagem divide o bitmap em múltiplos fragmentos menores (shards), cada um responsável por uma faixa específica de números.

## Motivação

O MongoDB possui um limite de 16MB por documento. Um bitmap tradicional para uma rifa com 100 milhões de números ocuparia aproximadamente 12.5MB (100.000.000 ÷ 8 bytes), ficando próximo desse limite. Para rifas com bilhões de números, seria impossível armazenar o bitmap em um único documento.

## Arquitetura

### Componentes Principais

1. **BitMapModel**: Modelo tradicional para rifas menores (até 10 milhões de números)
2. **BitMapShardModel**: Modelo para fragmentos individuais do bitmap
3. **BitMapMetaModel**: Modelo para metadados do bitmap fragmentado
4. **BitMapService**: Serviço unificado que abstrai a complexidade do sharding

### Estratégia de Sharding

- Cada shard armazena uma faixa contígua de números (ex: 0-9.999.999, 10.000.000-19.999.999, etc.)
- O tamanho padrão de cada shard é de 10 milhões de números
- Para rifas maiores, o sistema calcula automaticamente o tamanho ideal de shard

## Funcionamento

### Inicialização

1. Para rifas com até 10 milhões de números:
   - Usa-se o `BitMapModel` tradicional
   - Um único documento armazena todo o bitmap

2. Para rifas maiores que 10 milhões de números:
   - Calcula-se o número ideal de shards
   - Cria-se um documento de metadados (`BitMapMetaModel`)
   - Cria-se um documento para cada shard (`BitMapShardModel`)

### Operações

Todas as operações são abstraídas pelo `BitMapService`, que:

1. Detecta automaticamente se a rifa usa bitmap tradicional ou shardado
2. Direciona as operações para a implementação correta
3. Mantém uma API unificada para o resto do sistema

#### Principais Operações

- **Verificar disponibilidade**: Identifica o shard correto e verifica o bit específico
- **Marcar como ocupado**: Atualiza o bit no shard correto e decrementa contadores
- **Selecionar números aleatórios**: Distribui a seleção proporcionalmente entre os shards com base na disponibilidade

## Vantagens

1. **Escalabilidade**: Suporta rifas com bilhões de números
2. **Performance**: Operações afetam apenas os shards relevantes
3. **Compatibilidade**: Mantém suporte a rifas menores com a implementação tradicional
4. **Transparência**: API unificada que abstrai a complexidade do sharding

## Exemplo de Uso

Para uma rifa com 100 milhões de números:

1. O sistema criará automaticamente 10 shards de 10 milhões cada
2. Cada shard ocupará aproximadamente 1.25MB (10.000.000 ÷ 8 bytes)
3. Todas as operações serão direcionadas automaticamente para os shards corretos

## Considerações de Performance

- **Memória**: Cada shard é carregado individualmente, reduzindo o uso de memória
- **Consultas**: Índices compostos garantem acesso rápido aos shards
- **Transações**: Operações que afetam múltiplos shards usam transações MongoDB para garantir consistência

## Limitações

- Operações que afetam múltiplos shards são mais lentas devido ao overhead de transações
- O sistema atual não suporta redistribuição dinâmica de shards (se necessário no futuro)

## Configurações

```typescript
const BITMAP_CONFIG = {
  // Tamanho máximo de bitmap não shardado (em números)
  MAX_SINGLE_BITMAP_SIZE: 10_000_000,
  
  // Tamanho padrão de cada shard (em números)
  DEFAULT_SHARD_SIZE: 10_000_000,
  
  // Limite de tamanho de documento MongoDB (16MB)
  MONGODB_DOC_SIZE_LIMIT: 16 * 1024 * 1024,
  
  // Tamanho máximo seguro para buffer de bitmap (em bytes)
  MAX_SAFE_BUFFER_SIZE: 15 * 1024 * 1024
};
```

Estas configurações podem ser ajustadas conforme necessário para otimizar o desempenho em diferentes cenários.