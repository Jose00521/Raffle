// Import your schemas here
import type { Connection } from 'mongoose'

export async function up (connection: Connection): Promise<void> {
  // Verificar se o modelo User existe
  if (!connection.modelNames().includes('User')) {
    console.error('Modelo User não encontrado, não é possível criar seeds');
    return;
  }

  const User = connection.model('User');

  // Verificar se já existem usuários
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log(`Já existem ${userCount} usuários no sistema, pulando seed...`);
    return;
  }

  // Usuários iniciais para serem criados
  const users = [
    {
      name: 'Admin do Sistema',
      email: 'admin@rifasystem.com',
      phone: '(11) 98765-4321',
      password: '$2b$10$FSJw73Nye0dZV4KiQya53uFAEqaKdCdUbauR2mqJKFYPCQGt3EeCK', // 'admin123'
      role: 'admin',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      active: true,
      lastLogin: new Date()
    },
    {
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '(21) 95555-1234',
      password: '$2b$10$EXyx1FSjBzRHDQz.aNJH4.Ghk8UP9bfZxXNWD1VYYgkjF9xLF7VgS', // 'senha123'
      role: 'user',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: true
    },
    {
      name: 'João Santos',
      email: 'joao@example.com',
      phone: '(31) 97777-8888',
      password: '$2b$10$EXyx1FSjBzRHDQz.aNJH4.Ghk8UP9bfZxXNWD1VYYgkjF9xLF7VgS', // 'senha123'
      role: 'user',
      profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
      active: true
    },
    {
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      phone: '(41) 91111-2222',
      password: '$2b$10$EXyx1FSjBzRHDQz.aNJH4.Ghk8UP9bfZxXNWD1VYYgkjF9xLF7VgS', // 'senha123'
      role: 'user',
      profileImage: 'https://randomuser.me/api/portraits/women/26.jpg',
      active: true
    },
    {
      name: 'Pedro Alves',
      email: 'pedro@example.com',
      phone: '(51) 93333-4444',
      password: '$2b$10$EXyx1FSjBzRHDQz.aNJH4.Ghk8UP9bfZxXNWD1VYYgkjF9xLF7VgS', // 'senha123'
      role: 'user',
      profileImage: 'https://randomuser.me/api/portraits/men/91.jpg',
      active: true
    }
  ];

  // Inserir usuários no banco de dados
  try {
    await User.insertMany(users);
    console.log(`✅ ${users.length} usuários criados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao inserir usuários:', error);
    throw error;
  }
}

export async function down (connection: Connection): Promise<void> {
  // Verificar se o modelo User existe
  if (!connection.modelNames().includes('User')) {
    console.log('Modelo User não encontrado, nada a reverter');
    return;
  }

  const User = connection.model('User');

  // Remover apenas os usuários criados pelo seed
  const emails = [
    'admin@rifasystem.com',
    'maria@example.com',
    'joao@example.com',
    'ana@example.com',
    'pedro@example.com'
  ];

  try {
    const result = await User.deleteMany({ email: { $in: emails } });
    console.log(`✅ ${result.deletedCount} usuários removidos com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao remover usuários:', error);
    throw error;
  }
}
