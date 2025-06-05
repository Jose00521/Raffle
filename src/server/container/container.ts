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
import { IPrizeRepository } from '../repositories/PrizeRepository';
import { PrizeRepository } from '../repositories/PrizeRepository';
import { IPrizeService } from '../services/PrizeService';
import { PrizeService } from '../services/PrizeService';
import { IPrizeController } from '../controllers/PrizeController';
import { PrizeController } from '../controllers/PrizeController';
import { IPrizeCategoryRepository } from '../repositories/PrizeCategoryRepository';
import { PrizeCategoryRepository } from '../repositories/PrizeCategoryRepository';
import { IPrizeCategoryService } from '../services/PrizeCategoryService';
import { PrizeCategoryService } from '../services/PrizeCategoryService';
import { IPrizeCategoryController } from '../controllers/PrizeCategoryController';
import { PrizeCategoryController } from '../controllers/PrizeCategoryController';
import { InstantPrizeService } from '../services/InstantPrizeService';



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
container.register<IPrizeRepository>('prizeRepository', { useClass: PrizeRepository });
container.register<IPrizeService>('prizeService', { useClass: PrizeService });
container.register<IPrizeController>('prizeController', { useClass: PrizeController });
container.register<IPrizeCategoryRepository>('prizeCategoryRepository', { useClass: PrizeCategoryRepository });
container.register<IPrizeCategoryService>('prizeCategoryService', { useClass: PrizeCategoryService });
container.register<IPrizeCategoryController>('prizeCategoryController', { useClass: PrizeCategoryController });
container.register<InstantPrizeService>('instantPrizeService', { useClass: InstantPrizeService });


// Export configured container
export { container };   