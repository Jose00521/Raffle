import { User } from "@/models/User";
import { inject, injectable } from "tsyringe";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createConflictResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { maskCPF, maskEmail, maskPhone } from "@/utils/maskUtils";
import { EncryptionService, SecureDataUtils } from "@/utils/encryption";
import crypto from 'crypto';


export interface IUserRepository {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>>;
    quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>>;
    quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<any>>;
}

@injectable()
export class UserRepository implements IUserRepository {
    private db: IDBConnection;

    constructor(
        @inject('db') db: IDBConnection
    ) {
        this.db = db;
    }

     async createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            //inicia conexão com o banco de dados
            await this.db.connect();

            //verifica se o usuário já existe
            const userExists = await this.checkIfUserExists(user);

            if(userExists){
                return createErrorResponse('Usuário já cadastrado', 400);
            }

            //cria o usuário
            const userData = new User({
                ...user,
            });

            //gera o código do usuário(userCode)
            userData.userCode = generateEntityCode(userData._id, 'US');

            //salva o usuário
            await userData.save();


            return createSuccessResponse(userData, 'Usuário criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar usuário',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async checkIfUserExists(user: Partial<IUser>) {
        try {
            await this.db.connect();
            let conditions = [];

            console.log('user', user);
            
            if(user.email){
                const emailHash = SecureDataUtils.hashEmail(user.email);
                conditions.push({ email_hash: emailHash });
            }
            if(user.cpf){
                const cpfHash = SecureDataUtils.hashDocument(user.cpf);
                conditions.push({ cpf_hash: cpfHash });
            }
            if(user.phone){
                const phoneHash = SecureDataUtils.hashPhone(user.phone);
                conditions.push({ phone_hash: phoneHash });
            }

            console.log('conditions', conditions);
            
            if(conditions.length === 0) return false;
            
            const userExists = await User.findOne({ $or: conditions });
            if(userExists){
                return true;
            }
            return false;
        } catch (error) {
            throw new ApiError({
                success: false,
                message: '[checkIfUserExists] Erro ao checar se o usuário já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>> {
        try {
            
            await this.db.connect();

            console.log('repository phone',phone)

            const user = await User.findOne({ phone_hash: SecureDataUtils.hashPhone(phone) }, {
                _id: 0,
                userCode: 1,
                address: 1,
                name: 1,
                email_display: 1,
                cpf_display: 1,
                phone_display: 1,
                email_encrypted: 1,
                phone_encrypted: 1,
            });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            console.log('user', user);

            return createSuccessResponse({
                name: user.name,
                userCode: user.userCode,
                address: user.address,
                cpf: user.cpf_display,
                phone: user.phone_display,
                email: user.email_display,
                fb:{
                    em: crypto.createHash('sha256').update(EncryptionService.decrypt(user.email_encrypted)).digest('hex'),
                    ph: crypto.createHash('sha256').update(EncryptionService.decrypt(user.phone_encrypted)).digest('hex'),
                    fn: user.name,
                    ln: user.name,
                    external_id: user.userCode,
                    country: 'br',
                    ct: user.address?.city,
                    st: user.address?.state,
                    zp: user.address?.zipCode_encrypted && crypto.createHash('sha256').update(SecureDataUtils.decryptZipCode(user.address?.zipCode_encrypted)).digest('hex'),
                }
            } as Partial<IUser>, 'Usuário encontrado', 200);


        } catch (error) {
            throw new ApiError({
                success: false,
                message: '[quickCheckUser] Erro ao checar se o usuário já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            await this.db.connect();
            
            // Cria hashes dos dados para busca segura
            const cpfHash = SecureDataUtils.hashDocument(data.cpf);
            const emailHash = SecureDataUtils.hashEmail(data.email);
            const phoneHash = SecureDataUtils.hashPhone(data.phone);
            
            // Busca individual para identificar qual campo está duplicado
            const [cpfExists, emailExists, phoneExists] = await Promise.all([
                User.findOne({ cpf_hash: cpfHash }, { _id: 1 }).lean(),
                User.findOne({ email_hash: emailHash }, { _id: 1 }).lean(),
                User.findOne({ phone_hash: phoneHash }, { _id: 1 }).lean()
            ]);
            
            // Se nenhum existe, retorna sucesso
            if (!cpfExists && !emailExists && !phoneExists) {
                return createSuccessResponse(null, 'Dados disponíveis para cadastro', 200);
            }
            
            // Identifica quais campos estão duplicados
            const duplicatedFields = [];
            if (cpfExists) duplicatedFields.push({
                field: 'cpf',
                message: 'CPF já cadastrado'
            });
            if (emailExists) duplicatedFields.push({
                field: 'email',
                message: 'E-mail já cadastrado'
            });
            if (phoneExists) duplicatedFields.push({
                field: 'telefone',
                message: 'Telefone já cadastrado'
            });
            
                
            return createConflictResponse(
                'Conflict', 
                duplicatedFields,
                409 // Status 409 - Conflict
            );
            
        } catch (error) {
            throw new ApiError({
                success: false,
                message: '[quickCheckMainData] Erro ao checar se o usuário já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>> {
        try {
            await this.db.connect();
            const userExists = await this.checkIfUserExists(user);

            if(userExists){
                return createErrorResponse('Usuário já cadastrado', 400);
            }

            const newUser = new User({
                ...user,
            });



            newUser.userCode = generateEntityCode(newUser._id, 'US');
            await newUser.save();
            
            return createSuccessResponse({
                name: newUser.name,
                userCode: newUser.userCode,
                address: newUser.address,
                cpf: newUser.cpf_display,
                phone: newUser.phone_display,
                email: newUser.email_display,
                fb:{
                    em: crypto.createHash('sha256').update(EncryptionService.decrypt(newUser.email_encrypted)).digest('hex'),
                    ph: crypto.createHash('sha256').update(EncryptionService.decrypt(newUser.phone_encrypted)).digest('hex'),
                    fn: newUser.name,
                    ln: newUser.name,
                    external_id: newUser.userCode,
                    country: 'br',
                    ct: newUser.address?.city,
                    st: newUser.address?.state,
                    zp: newUser.address?.zipCode_encrypted && crypto.createHash('sha256').update(SecureDataUtils.decryptZipCode(newUser.address?.zipCode_encrypted)).digest('hex'),
                }
            } as Partial<IUser>, 'Usuário criado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar usuário',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}