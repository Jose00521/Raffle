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
import { IUserAuthRepository, UserAuthRepository } from '../repositories/auth/userAuth';
import { CreatorService, ICreatorService } from '../services/CreatorService';
import { ICreatorController } from '../controllers/CreatorController';
import { CreatorController } from '../controllers/CreatorController';
import { ICreatorRepository } from '../repositories/CreatorRepository';
import { CreatorRepository } from '../repositories/CreatorRepository';
// Register dependencies
container.register<IDBConnection>('db', { useClass: DBConnection })
container.register<IUserRepository>('userRepository', { useClass: UserRepository });
container.register<IUserService>('userService', { useClass: UserService });;
container.register<IUserController>('userController', { useClass: UserController });
container.register<ICampaignService>('campaignService', { useClass: CampaignService });
container.register<ICampaignRepository>('campaignRepository', { useClass: CampaignRepository });
container.register<ICampaignController>('campaignController', { useClass: CampaignController });
container.register<IUserAuthRepository>('userAuthRepository', { useClass: UserAuthRepository });
container.register<ICreatorRepository>('creatorRepository', { useClass: CreatorRepository });
container.register<ICreatorService>('creatorService', { useClass: CreatorService });
container.register<ICreatorController>('creatorController', { useClass: CreatorController });


// Export configured container
export { container };   