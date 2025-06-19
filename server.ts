// Carregar variáveis de ambiente primeiro
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';

// Increase EventEmitter max listeners to prevent warnings
import './src/server/config/eventEmitter.js'

import { Socket } from "socket.io";
import logger from './src/lib/logger/logger.ts';
import express, { Request, Response } from 'express';
import next from "next";
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DBConnection, IDBConnection } from './src/server/lib/dbConnect.ts';
import { initializeServices } from './src/server/init.ts';

import './src/server/container/container';
import { container } from './src/server/container/container.ts';
import { validateEntityCode } from './src/models/utils/idGenerator';
import { cronManager } from './src/server/cron';
import { SocketService } from './src/server/lib/socket/SocketService';
import { StatsService } from './src/server/utils/stats/StatsService';

// Para executar migrations automaticamente no arranque, descomente estas linhas:
// const path = require('path');
// const { exec } = require('child_process');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || '3000');
const db = container.resolve<IDBConnection>('db');

// Variável de controle global para garantir a inicialização única
let servicesInitialized = false;
let socketService: SocketService;

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    return handle(req, res);
  });

  
  // Socket.io setup
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL || 'https://raffle-6wkb-q4k52ejrt-jose0521s-projects.vercel.app'
        : "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/api/socket/io'
  });

  
  // Socket.io events
  io.on('connection', (socket: Socket) => {
    logger.info(`Novo cliente conectado: ${socket.id}`);
    
    // Adicionar socket à sala do usuário quando autenticado
    socket.on('authenticate', ({ userId, userType }) => {
      if (userId) {
        socket.join(`user:${userId}`);
        socket.join(`${userType}:${userId}`);
        logger.info(`Socket ${socket.id} autenticado: ${userType} ${userId}`);
        socket.emit('authenticated', { success: true });
      }
    });
    
    // Inscrever em atualizações de campanha
    socket.on('subscribeCampaign', (campaignId) => {
      socket.join(`campaign:${campaignId}`);
      logger.info(`Socket ${socket.id} inscrito na campanha: ${campaignId}`);
    });
    
    socket.on('disconnect', () => {
      logger.info(`Cliente desconectado: ${socket.id}`);
    });
  });
  
  try {
    // Conectar ao MongoDB
    logger.info('Conectando ao MongoDB...');
    await db.connect();
    logger.info('✅ Conectado ao MongoDB com sucesso!');
    
    // Bloco de inicialização única
    if (!servicesInitialized) {
    // Inicializar o serviço de Socket.IO
      socketService = container.resolve<SocketService>('socketService');
    socketService.initialize(io);
    logger.info('✅ Socket.IO Service inicializado com sucesso!');
      
      // Inicializar serviços passando a instância do Socket.io
      const statsService = new StatsService(io);
      await statsService.start();
      logger.info('✅ Stats Service inicializado com sucesso!');
      
      // Inicializar o cron manager
      await cronManager.init();
      logger.info('✅ Cron Manager inicializado com sucesso!');
      
      servicesInitialized = true;
    } else {
      logger.warn('Serviços já inicializados, pulando re-inicialização (HMR).');
    }
    
    // Verificar se o SocketService foi inicializado corretamente
    if (socketService && socketService.isInitialized()) {
      logger.info('✅ SocketService está corretamente inicializado!');
    } else {
      logger.error('❌ Falha ao inicializar SocketService');
      throw new Error('Falha na inicialização do SocketService');
    }
    
    // Adicionar hook para o evento de desconexão do socket
    io.on('disconnect', (reason) => {
      logger.warn(`Socket.IO desconectado: ${reason}`);
    });
    
    // Adicionar hook para o evento de erro do socket
    io.engine.on('connection_error', (err) => {
      logger.error(`Erro de conexão Socket.IO: ${err.message}`);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao inicializar serviços:', error);
    process.exit(1);
  }
  
  // Adicionar manipuladores para encerramento limpo
  const gracefulShutdown = async () => {
    logger.info('Recebido sinal para encerrar o servidor, desligando...');
    
    // Parar o cron manager
    await cronManager.stop();
    logger.info('✅ Cron Manager encerrado com sucesso');
    
    // Fechar conexões e servidor
    process.exit(0);
  };

  // Capturar sinais de finalização
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`> Servidor rodando na porta ${PORT}`);
    logger.info(`> Ambiente: ${process.env.NODE_ENV}`);
  });
}); 