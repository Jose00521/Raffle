import mongoose from 'mongoose';

/**
 * Interfaces
 */
export interface IAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface IBankAccount {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
    pixKey?: string;
  }
  
  export interface IBaseUser {
    _id?: string;
    userCode?: string; // Código único no formato Snowflake ID
    profilePicture?: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    address: IAddress;
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedA?: Date;
  }
  
  export interface IRegularUser extends IBaseUser {
    role: 'user' | 'participant'; 
    cpf: string;
    birthDate: Date;
    socialName?: string;
    statistics: {
      participationCount: number;
      totalSpent: number;
      rafflesWon: number;
      lastParticipation?: Date;
    };
    consents: {
      marketingEmails: boolean;
      termsAndConditions: boolean;
      dataSharing: boolean;
    };
  }
  
  export interface IVerification {
      // Campos para verificação documental

        status: 'pending' | 'under_review' | 'approved' | 'rejected';
        documents?: {
          identityFront?: { path: string; uploadedAt: Date; verified: boolean };
          identityBack?: { path: string; uploadedAt: Date; verified: boolean };
          identitySelfie?: { path: string; uploadedAt: Date; verified: boolean };
          companyDocuments?: Array<{
            type: 'contract' | 'registration' | 'license' | 'other';
            path: string;
            description?: string;
            uploadedAt: Date;
            verified: boolean;
          }>;
        };
        verificationNotes?: string;
        rejectionReason?: string;
        reviewedAt?: Date;
        reviewedBy?: mongoose.Types.ObjectId | string;
        expiresAt?: Date;
  }
    
  export interface ICreator extends IBaseUser {
    role: 'creator';
    personType: 'individual' | 'company';
    cpf?: string;
    cnpj?: string;
    companyName?: string;
    birthDate?: Date;
    legalName?: string;
    legalRepresentative?: string;
    companyCategory?: string;
    bankAccount: Array<IBankAccount>;
    verification: IVerification;
    statistics: {
      rafflesCreated: number;
      activeRaffles: number;
      totalRevenue: number;
      conversionRate: number | null;
      lastRaffleCreated?: Date;
    };
    settings: {
      allowCommissions: boolean;
      commissionPercentage: number;
      receiveReports: boolean;
    };
    consents: {
      marketingEmails: boolean;
      termsAndConditions: boolean;
      dataSharing: boolean;
    };
  }
  
  export type IUser = IRegularUser | ICreator;