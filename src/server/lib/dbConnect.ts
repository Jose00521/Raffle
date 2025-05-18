import mongoose from 'mongoose';

// Variável para memoizar a conexão
// let cached: {conn: typeof mongoose | null;promise: Promise<typeof mongoose> | null;} = {
//   conn: null,
//   promise: null,
// };

// Função para conectar ao MongoDB
async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://strongunderfed490:HYV8Gsu3MyxcLQYJ@cluster0.72eltg2.mongodb.net/projeto?retryWrites=true&w=majority&appName=Cluster0';

  // Se já estamos conectados, retorne a conexão existente
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Configurações de conexão otimizadas
  const opts = {
    bufferCommands: false,
    maxPoolSize: 50,          // Tamanho máximo do pool de conexões
    minPoolSize: 10,          // Tamanho mínimo do pool de conexões
    socketTimeoutMS: 45000,   // Timeout de socket em ms
    connectTimeoutMS: 10000,  // Timeout de conexão em ms
    serverSelectionTimeoutMS: 10000 // Timeout de seleção de servidor
  };

  return mongoose.connect(MONGODB_URI, opts);
}

export default dbConnect; 