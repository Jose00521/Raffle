const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { default: dbConnect } = require('./src/server/lib/dbConnect.ts');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io
  const io = new Server(server);
  
  try {
    await dbConnect();
    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
  }


  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinRifa', (rifaId) => {
      socket.join(`rifa:${rifaId}`);
      console.log(`Client ${socket.id} joined rifa:${rifaId}`);
    });

    socket.on('leaveRifa', (rifaId) => {
      socket.leave(`rifa:${rifaId}`);
      console.log(`Client ${socket.id} left rifa:${rifaId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Export io instance for API routes
  global.io = io;

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 