import mongoose from 'mongoose';

// Variável para memoizar a conexão
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = {
  conn: null,
  promise: null,
};

// Função para conectar ao MongoDB
async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rifas';

  // Se já estamos conectados, retorne a conexão existente
  if (cached.conn) {
    return cached.conn;
  }

  // Se não há uma promessa de conexão em andamento, cria uma
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB conectado com sucesso');
        return mongoose;
      });
  }

  // Espera pela conexão e armazena em cache
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 