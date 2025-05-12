# RifaApp - Plataforma de Rifas Online

Uma aplicação moderna para gerenciamento e participação em rifas online, inspirada em wesleyalemao.com.br, construída com Next.js, React, TypeScript, MongoDB e Socket.io.

## Características

- **Design Moderno e Responsivo**: Interface limpa e atraente para desktop e dispositivos móveis
- **Comunicação em Tempo Real**: Atualizações instantâneas de números comprados usando Socket.io
- **Banco de Dados MongoDB**: Armazenamento robusto e escalável para dados de campanhas e usuários
- **Reserva Automática**: Números são reservados automaticamente entre os disponíveis
- **Escalabilidade**: Gerencia rifas com milhões de números através de otimização de banco de dados
- **Estilização Avançada**: Componentes estilizados com styled-components

## Estrutura do Projeto

O projeto segue uma arquitetura organizada em camadas:

```
src/
├── app/             # Rotas e UI do App Router
│   └── api/         # Endpoints de API  
├── components/      # Componentes de UI
├── server/          # Código exclusivamente servidor
│   ├── models/      # Esquemas e modelos do banco de dados
│   ├── repositories/# Acesso ao banco de dados 
│   ├── services/    # Lógica de negócios
│   ├── controllers/ # Controladores de API
│   ├── lib/         # Bibliotecas do servidor
│   └── utils/       # Utilitários do servidor
├── lib/             # Bibliotecas compartilhadas
└── services/        # Serviços do cliente (APIs)
```

## Processo de Reserva de Números

No RifaApp, os números são reservados automaticamente:

1. **Seleção de Quantidade**: O usuário escolhe apenas a quantidade de números desejada
2. **Reserva Automática**: O sistema seleciona automaticamente números disponíveis
3. **Confirmação de Pagamento**: Após o pagamento, os números são marcados como pagos

Este processo simplifica a experiência do usuário e evita conflitos de seleção.

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure suas variáveis de ambiente (MongoDB URI, etc.)
4. Execute o aplicativo:
   ```
   npm run dev
   ```

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Styled Components
- **Backend**: API Routes do Next.js, MongoDB
- **Comunicação**: Socket.io para atualizações em tempo real
- **Banco de Dados**: MongoDB com esquemas otimizados
- **Ferramentas**: ESLint, TypeScript

## Desenvolvedores

Este projeto foi desenvolvido como parte de um esforço para criar uma plataforma moderna e confiável para rifas online.

## Licença

Este projeto é privado e não está licenciado para uso público.
