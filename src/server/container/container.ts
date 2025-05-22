// Add to your container setup (e.g., src/server/container.ts or similar)
import { container } from 'tsyringe';
import { IUserService, UserService } from '../services/UserService'; // adjust path
import { IUserRepository, UserRepository } from '../repositories/UserRepository'; // adjust path
import { DBConnection, IDBConnection } from '../lib/dbConnect';
import { UserController } from '../controllers/UserController';
import { IUserController } from '../controllers/UserController';
import { ICampaignService } from '../services/CampaignService';
import { ICampaignRepository } from '../repositories/CampaignRepository';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { CampaignService } from '../services/CampaignService';
import { CampaignController } from '../controllers/CampaignController';
import { ICampaignController } from '../controllers/CampaignController';
// Register dependencies
container.register<IDBConnection>('db', { useClass: DBConnection })
container.register<IUserRepository>('userRepository', { useClass: UserRepository });
container.register<IUserService>('userService', { useClass: UserService });;
container.register<IUserController>('userController', { useClass: UserController });
container.register<ICampaignService>('campaignService', { useClass: CampaignService });
container.register<ICampaignRepository>('campaignRepository', { useClass: CampaignRepository });
container.register<ICampaignController>('campaignController', { useClass: CampaignController });


// Export configured container
export { container };   