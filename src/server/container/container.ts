import 'reflect-metadata';
// Add to your container setup (e.g., src/server/container.ts or similar)
import { container, Lifecycle } from 'tsyringe';
import { IUserService, UserService } from '../services/UserService'; // adjust path
import { IUserRepository, UserRepository } from '../repositories/UserRepository'; // adjust path
import { DBConnection, IDBConnection, dbInstance } from '../lib/dbConnect';
import { UserController } from '../controllers/UserController';
import { IUserController } from '../controllers/UserController';
import { ICampaignService } from '../services/CampaignService';
import { ICampaignRepository } from '../repositories/CampaignRepository';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { CampaignService } from '../services/CampaignService';
import { CampaignController } from '../controllers/CampaignController';
import { ICampaignController } from '../controllers/CampaignController';
import { IUserAuthRepository, UserAuthRepository } from '../repositories/auth/userAuthRepository';
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
import { CampaignDataProcessorService } from '../services/CampaignDataProcessorService';
import pino, { Logger } from 'pino';
import logger from '@/lib/logger/logger';
import { SocketService } from '../lib/socket/SocketService';
import { IPaymentRepository, PaymentRepository } from '../repositories/PaymentRepository';
import { IPaymentService, PaymentService } from '../services/PaymentService';
import { IPaymentController, PaymentController } from '../controllers/PaymentController';
import { SSEvents } from '../repositories/events/SSEvents';
import { AdminController, IAdminController } from '../controllers/AdminController';
import { AdminService, IAdminService } from '../services/AdminService';
import { AdminRepository, IAdminRepository } from '../repositories/AdminRepository';
import { AdminAuthRepository, IAdminAuthRepository } from '../repositories/auth/adminAuthRepository';
import { GatewayTemplateRepository, IGatewayTemplateRepository } from '../repositories/GatewayTemplateRepository';
import { IGatewayTemplateService } from '../services/GatewayTemplateService';
import { GatewayTemplateService } from '../services/GatewayTemplateService';
import { IGatewayTemplateController } from '../controllers/GatewayTemplateController';
import { GatewayTemplateController } from '../controllers/GatewayTemplateController';
import { CreatorPaymentGatewayRepository, ICreatorPaymentGatewayRepository } from '../repositories/CreatorPaymentGatewayRepository';
import { CreatorPaymentGatewayService, ICreatorPaymentGatewayService } from '../services/CreatorPaymentGatewayService';
import { ICreatorPaymentGatewayController, CreatorPaymentGatewayController } from '../controllers/CreatorPaymentGatewayController';


// Register dependencies
container.register<IDBConnection>('db', { useValue: dbInstance });
container.register<Logger>('logger', { useValue: logger });
container.register<IUserRepository>('userRepository', { useClass: UserRepository });
container.register<IUserService>('userService', { useClass: UserService });;
container.register<IUserController>('userController', { useClass: UserController });
container.register<ICampaignService>('campaignService', { useClass: CampaignService });
container.register<ICampaignRepository>('campaignRepository', { useClass: CampaignRepository });
container.register<ICampaignController>('campaignController', { useClass: CampaignController });
container.register<IUserAuthRepository>('userAuthRepository', { useClass: UserAuthRepository });
container.register<IAdminAuthRepository>('adminAuthRepository', { useClass: AdminAuthRepository });
container.register<ICreatorRepository>('creatorRepository', { useClass: CreatorRepository });
container.register<ICreatorService>('creatorService', { useClass: CreatorService });
container.register<ICreatorController>('creatorController', { useClass: CreatorController });
container.register<IAdminRepository>('adminRepository', { useClass: AdminRepository });
container.register<IAdminService>('adminService', { useClass: AdminService });
container.register<IAdminController>('adminController', { useClass: AdminController });
container.register<IPrizeRepository>('prizeRepository', { useClass: PrizeRepository });
container.register<IPrizeService>('prizeService', { useClass: PrizeService });
container.register<IPrizeController>('prizeController', { useClass: PrizeController });
container.register<IPrizeCategoryRepository>('prizeCategoryRepository', { useClass: PrizeCategoryRepository });
container.register<IPrizeCategoryService>('prizeCategoryService', { useClass: PrizeCategoryService });
container.register<IPrizeCategoryController>('prizeCategoryController', { useClass: PrizeCategoryController });
container.register<InstantPrizeService>('instantPrizeService', { useClass: InstantPrizeService });
container.register<CampaignDataProcessorService>(CampaignDataProcessorService, { useClass: CampaignDataProcessorService });
container.register<SocketService>('socketService', { useClass: SocketService });
container.register<IPaymentRepository>('paymentRepository', { useClass: PaymentRepository });
container.register<IPaymentService>('paymentService', { useClass: PaymentService });
container.register<IPaymentController>('paymentController', { useClass: PaymentController });
container.register<IGatewayTemplateRepository>('gatewayTemplateRepository', { useClass: GatewayTemplateRepository });
container.register<IGatewayTemplateService>('gatewayTemplateService', { useClass: GatewayTemplateService });
container.register<IGatewayTemplateController>('gatewayTemplateController', { useClass: GatewayTemplateController });
container.register<ICreatorPaymentGatewayRepository>('creatorPaymentGatewayRepository', { useClass: CreatorPaymentGatewayRepository });
container.register<ICreatorPaymentGatewayService>('creatorPaymentGatewayService', { useClass: CreatorPaymentGatewayService });
container.register<ICreatorPaymentGatewayController>('creatorPaymentGatewayController', { useClass: CreatorPaymentGatewayController });
container.register<SSEvents>('sseEvents', { useClass: SSEvents });

// Registrar o serviço SSEvents
container.register('SSEvents', {
  useFactory: (dependencyContainer) => {
    const db = dependencyContainer.resolve<IDBConnection>('db');
    return new SSEvents(db);
  }
});

// Export configured container
export { container };       