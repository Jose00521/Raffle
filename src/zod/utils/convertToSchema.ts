import { z } from "zod";
import { ICreator } from "@/models/interfaces/IUserInterfaces";
import { IRegularUser } from '@/models/interfaces/IUserInterfaces';
import { CreatorFormData } from "../creator.schema";
import { RegisterFormData } from "../user.schema";
import { SignupFormData } from "../quicksignup.validation";

export const convertCreatorFormToSchema = (data: ICreator): Partial<CreatorFormData> => {
return {
    nomeCompleto: data.name,
    email: data.email,
    nomeFantasia: data.name,
    telefone: data.phone,
    confirmarTelefone: data.phone,
    senha: data.password,
    confirmarSenha: data.password,
    dataNascimento: new Date(data.birthDate || ''),
    tipoPessoa: data.personType,
    razaoSocial: data.legalName,
    cnpj: data.cnpj || '',
    cpf: data.cpf || '',
    cep: data.address.zipCode,
    logradouro: data.address.street,
    numero: data.address.number,
    complemento: data.address.complement,
    bairro: data.address.neighborhood,
    cidade: data.address.city,
    uf: data.address.state,
    categoriaEmpresa: data.companyCategory || '',
    termsAgreement: data.consents.termsAndConditions,
  }
};


export const convertParticipantFormToSchema = (data: IRegularUser): Partial<RegisterFormData> => {
  return {
    nomeCompleto: data.name,
    email: data.email,
    telefone: data.phone,
    confirmarTelefone: data.phone,
    senha: data.password,
    confirmarSenha: data.password,
    dataNascimento: new Date(data.birthDate || ''),
    cpf: data.cpf || '',
    cep: data.address.zipCode,
    logradouro: data.address.street,
    numero: data.address.number,
    complemento: data.address.complement,
    bairro: data.address.neighborhood,
    cidade: data.address.city,
    uf: data.address.state,
    termsAgreement: data.consents.termsAndConditions,
  }
};


export const convertQuickSignupFormToSchema = (data: IRegularUser): Partial<SignupFormData> => {
  return {
    nome: data.name,
    email: data.email,
    telefone: data.phone,
    confirmarTelefone: data.phone,
    cpf: data.cpf || '',
    cep: data.address.zipCode,
    logradouro: data.address.street,
    numero: data.address.number,
    complemento: data.address.complement,
    bairro: data.address.neighborhood,
    cidade: data.address.city,
    uf: data.address.state,
    termsAgreement: data.consents.termsAndConditions,
  }
};