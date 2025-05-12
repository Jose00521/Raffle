import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = new SocketIOServer(res.socket.server);

    // Define socket event handlers
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('joinRifa', (rifaId: string) => {
        socket.join(`rifa:${rifaId}`);
        console.log(`Client ${socket.id} joined rifa:${rifaId}`);
      });

      socket.on('leaveRifa', (rifaId: string) => {
        socket.leave(`rifa:${rifaId}`);
        console.log(`Client ${socket.id} left rifa:${rifaId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
  }
  
  return res.socket.server.io;
};

export const emitRifaUpdate = (io: SocketIOServer, rifaId: string, data: any) => {
  io.to(`rifa:${rifaId}`).emit('rifaUpdate', data);
};

export const emitNumberReserved = (io: SocketIOServer, rifaId: string, number: number, reserved: boolean) => {
  io.to(`rifa:${rifaId}`).emit('numberUpdate', { number, reserved });
}; 