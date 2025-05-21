// Add to your container setup (e.g., src/server/container.ts or similar)
import { container } from 'tsyringe';
import { UserService } from '../services/UserService'; // adjust path
import { UserRepository } from '../repositories/UserRepository'; // adjust path
import { DBConnection } from '../lib/dbConnect';
import { UserController } from '../controllers/UserController';
// Register dependencies
container.register('userController', { useClass: UserController });
container.register('userRepository', { useClass: UserRepository });
container.register('userService', { useClass: UserService });
container.register('db', { useClass: DBConnection });


// Export configured container
export { container };