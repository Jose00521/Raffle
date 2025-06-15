import mongoose from 'mongoose';

/**
 * Interfaces
 */
export interface IAddress {
    street: string;
    number: string;
    complement?: string;
    zipCode: string;
    street_encrypted?: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    number_encrypted?: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    complement_encrypted?: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    zipCode_encrypted?: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    street_display?: string;
    number_display?: string;
    complement_display?: string;
    zipCode_display?: string;
    city: string;
    state: string;
    neighborhood: string;
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
    name: string;
    socialName?: string;
    email: string;
    email_encrypted: {  
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    email_hash: string;
    email_display: string;
    password: string;
    phone: string;
    phone_encrypted: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    phone_hash: string;
    phone_display: string;
    address: IAddress;
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedA?: Date;
  }
  
  export interface IRegularUser extends IBaseUser {
    role: 'user' | 'participant'; 
    cpf: string;
    cpf_encrypted: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    cpf_hash: string;
    cpf_display: string;
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
    cpf_encrypted: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    cpf_hash: string;
    cpf_display: string;
    cnpj?: string;
    cnpj_encrypted: {
      encrypted: string;
      iv: string;
      tag: string;
      keyVersion: string;
      aad: string;
    };
    cnpj_hash: string;
    cnpj_display: string;
    companyName?: string;
    birthDate?: Date;
    legalName?: string;
    defaultGateway: mongoose.Types.ObjectId | string;
    gateways: Array<mongoose.Types.ObjectId | string>;
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