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
  // if (cached.conn) {
  //   return cached.conn;
  // }

  // Se não há uma promessa de conexão em andamento, cria uma
  // if (!cached.promise) {
  //   const opts = {
  //     bufferCommands: false,
  //   };

  // }

  // Espera pela conexão e armazena em cache
  // try {
  //   cached.conn = await cached.promise;
  // } catch (e) {
  //   cached.promise = null;
  //   throw e;
  // }

  return mongoose.connect(MONGODB_URI);
}

export default dbConnect; 