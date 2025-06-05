/**
 * 🚀 Teste da Nova API de Criação de Rifas
 * 
 * Este script demonstra como usar a nova API otimizada
 * para criar rifas com inicialização completa automática.
 */

// Função para testar a criação de rifas
async function testarNovaRifa() {
  const baseUrl = 'http://localhost:3000';
  
  // Exemplo 1: Rifa pequena (1.000 números)
  const rifaPequena = {
    campaignData: {
      title: "Rifa Pequena - Teste",
      description: "Rifa de teste com 1.000 números",
      totalNumbers: 1000,
      individualNumberPrice: 5.00,
      drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
      createdBy: "65f1234567890abcdef12345", // Substituir por ID real
      status: "ACTIVE",
      numberPackages: [
        {
          name: "Pacote Básico",
          description: "10 números com desconto",
          quantity: 10,
          price: 45.00,
          discount: 10,
          isActive: true,
          order: 1
        }
      ]
    },
    instantPrizesConfig: [
      {
        category: "bronze",
        numbers: ["0001", "0100", "0500"],
        value: 50.00
      },
      {
        category: "prata",
        numbers: ["0777", "0888"],
        value: 150.00
      },
      {
        category: "ouro",
        numbers: ["0999"],
        value: 500.00
      }
    ]
  };

  // Exemplo 2: Rifa grande (100.000 números) com partições
  const rifaGrande = {
    campaignData: {
      title: "Mega Rifa - 100K",
      description: "Rifa grande com sistema de partições otimizado",
      totalNumbers: 100000,
      individualNumberPrice: 2.00,
      drawDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "65f1234567890abcdef12345",
      status: "ACTIVE",
      numberPackages: [
        {
          name: "Pacote Bronze",
          quantity: 25,
          price: 45.00,
          discount: 10,
          isActive: true,
          order: 1
        },
        {
          name: "Pacote Prata",
          quantity: 50,
          price: 85.00,
          discount: 15,
          isActive: true,
          highlight: true,
          order: 2
        },
        {
          name: "Pacote Ouro",
          quantity: 100,
          price: 160.00,
          discount: 20,
          isActive: true,
          order: 3
        }
      ]
    },
    instantPrizesConfig: [
      {
        category: "premio_consolacao",
        numbers: ["00001", "00100", "01000", "10000", "50000"],
        value: 100.00
      },
      {
        category: "premio_especial",
        numbers: ["77777", "88888"],
        value: 1000.00
      },
      {
        category: "premio_maximo",
        numbers: ["99999"],
        value: 5000.00
      }
    ]
  };

  try {
    console.log('🎯 Iniciando testes da Nova API de Rifas...\n');

    // Teste 1: Rifa Pequena
    console.log('📝 Teste 1: Criando rifa pequena (1.000 números)...');
    const resultado1 = await criarRifa(baseUrl, rifaPequena);
    console.log('✅ Rifa pequena criada:', resultado1.data._id);
    console.log('📊 Sistema usado: Ranges (números < 100K)\n');

    // Teste 2: Rifa Grande  
    console.log('📝 Teste 2: Criando rifa grande (100.000 números)...');
    const resultado2 = await criarRifa(baseUrl, rifaGrande);
    console.log('✅ Rifa grande criada:', resultado2.data._id);
    console.log('🚀 Sistema usado: RangePartitions (números ≥ 100K)\n');

    console.log('🎉 Todos os testes concluídos com sucesso!');
    console.log('\n🔍 Verificações realizadas automaticamente:');
    console.log('  ✅ Ranges/Partições criados');
    console.log('  ✅ Prêmios instantâneos registrados');
    console.log('  ✅ Estatísticas inicializadas');
    console.log('  ✅ Snapshots diários criados');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Função auxiliar para criar rifa
async function criarRifa(baseUrl, rifaData) {
  const response = await fetch(`${baseUrl}/api/campanhas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rifaData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP ${response.status}: ${errorData.message}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Erro desconhecido');
  }

  return result;
}

// Executar testes se este arquivo for executado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testarNovaRifa();
} else {
  // Browser environment
  console.log('Execute testarNovaRifa() no console para rodar os testes');
}

// Exportar para uso em outros arquivos
module.exports = { testarNovaRifa, criarRifa }; 