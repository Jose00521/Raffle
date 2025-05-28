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

## Configuração do Upload de Imagens

O aplicativo utiliza o Amazon S3 para armazenamento de imagens. Siga os passos abaixo para configurar:

### 1. Crie um bucket S3 na AWS

- Acesse o [console da AWS](https://aws.amazon.com/console/)
- Navegue até o serviço S3
- Crie um novo bucket com um nome único
- Configure permissões para permitir acesso público de leitura (para que as imagens possam ser visualizadas)

### 2. Crie um usuário IAM com permissões para o S3

- Navegue até o serviço IAM
- Crie um novo usuário com acesso programático
- Anexe a política `AmazonS3FullAccess` ou crie uma política personalizada com permissões apenas para o bucket específico
- Guarde o Access Key ID e Secret Access Key

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha as seguintes variáveis:

```
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=regiao_do_seu_bucket
AWS_S3_BUCKET_NAME=nome_do_seu_bucket
```

## Processo de Upload

O processo de upload de imagens segue os seguintes passos:

1. O usuário seleciona as imagens na interface do componente `UploadImages`
2. As imagens são enviadas para a API `/api/upload` via FormData
3. A API valida a autenticação do usuário e aplica rate limiting
4. Cada imagem é processada com a biblioteca Sharp para otimização
5. As imagens otimizadas são enviadas para o S3
6. Os URLs das imagens armazenadas são retornados para o frontend
7. O frontend pode então salvar esses URLs no banco de dados

## Bibliotecas Utilizadas

- `@aws-sdk/client-s3`: SDK da AWS para manipulação do S3
- `sharp`: Processamento e otimização de imagens
- `uuid`: Geração de nomes únicos para os arquivos
- `react-dropzone`: Interface de drag-and-drop para upload
- `jose`: Manipulação de tokens JWT

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
