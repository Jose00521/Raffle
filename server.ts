import { Socket } from "socket.io";

import express, { Request, Response } from 'express';
import next from "next";
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dbConnect from './src/server/lib/dbConnect.js';
import { initializeServices } from './src/server/init.js';

// Para executar migrations automaticamente no arranque, descomente estas linhas:
// const path = require('path');
// const { exec } = require('child_process');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);
  
  server.use(cors());
  server.use(express.json());
  
  // Socket.io setup
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.io events
  io.on('connection', (socket: Socket) => {
    console.log('Novo cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
  
  try {
    // Conectar ao MongoDB
    console.log('Conectando ao MongoDB...');
    await dbConnect();
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    // Inicializar serviços passando a instância do Socket.io
    await initializeServices(io);
    console.log('✅ Serviços do backend inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
  }
  
  // Next.js request handler
  server.all(/.*/, (req: Request, res: Response) => {
    return handle(req, res);
  });
  
  httpServer.listen(PORT, () => {
    console.log(`> Server running on http://localhost:${PORT}`);
  });
}); 