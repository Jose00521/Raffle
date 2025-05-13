const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { default: dbConnect } = require('./src/server/lib/dbConnect.ts');

// Para executar migrations automaticamente no arranque, descomente estas linhas:
// const { runMigrations } = require('./src/migrations');
// const EXECUTE_MIGRATIONS = process.env.EXECUTE_MIGRATIONS === 'true';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Erro ao lidar com a requisição:', err);
      res.statusCode = 500;
      res.end('Erro interno do servidor');
    }
  });

  // Initialize Socket.io
  const io = new Server(server);
  
  try {
    await dbConnect();
    console.log('✅ MongoDB conectado com sucesso');

    // Execute migrations if enabled
    // if (EXECUTE_MIGRATIONS) {
    //   console.log('🔄 Executando migrations automaticamente...');
    //   try {
    //     const result = await runMigrations();
    //     console.log(`✅ ${result.length} migration(s) executada(s) com sucesso`);
    //   } catch (error) {
    //     console.error('❌ Erro ao executar migrations:', error);
    //   }
    // }
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

  // Configurar encerramento gracioso
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      console.log(`\n${signal} recebido. Encerrando servidor...`);
      server.close(() => {
        console.log('Servidor HTTP encerrado');
        process.exit(0);
      });
    });
  });

  // Ouvir na porta especificada
  server.listen(port, (err) => {
    if (err) throw err;
    
    console.log(`> Servidor pronto em http://${hostname}:${port}`);
    
    // DESCOMENTE AS LINHAS ABAIXO PARA EXECUTAR MIGRATIONS AUTOMATICAMENTE NA INICIALIZAÇÃO
    
    /*
    // Execução automática de migrations na inicialização (apenas em produção)
    if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE === 'true') {
      console.log('Executando migrations automaticamente...');
      
      // Importar e executar migrations do banco de dados
      const { runMigrations } = require('./src/migrations');
      
      runMigrations()
        .then(result => {
          if (result.length > 0) {
            console.log(`✅ ${result.length} migrations executadas com sucesso!`);
          } else {
            console.log('✅ Banco de dados já está atualizado.');
          }
        })
        .catch(error => {
          console.error('❌ Erro ao executar migrations:', error);
        });
    }
    */
  });
}); 