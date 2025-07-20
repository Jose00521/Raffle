'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPasswordStrength, getPasswordStrengthText } from '../utils/validators';

interface PasswordFieldResult {
  passwordStrength: { strength: number; text: string; color: string };
  getPasswordRequirements: (password: string) => {
    length: {
      requirement: boolean;
      text: string;
    };
  };
}

/**
 * Hook personalizado para gerenciar campos de senha
 * Inclui funcionalidades como:
 * - Verificação de força da senha
 * - Verificação se as senhas coincidem
 * - Controle de visibilidade da senha
 */
export const usePasswordField = (password: string, confirmPassword?: string): PasswordFieldResult => {

  // Memoize password strength calculation with early returns
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, text: '', color: '#94a3b8' };
    
    let strength = 0;
    
    // Adiciona pontuação com base em critérios
    if (password.length >= 8) strength += 1; // verifica se a senha tem 8 caracteres
    if (/[a-z]/.test(password)) strength += 1; // verifica se a senha tem letra minúscula
    if (/[A-Z]/.test(password)) strength += 1; // verifica se a senha tem letra maiúscula
    if (/[0-9]/.test(password)) strength += 1; // verifica se a senha tem número
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // verifica se a senha tem caractere especial
    
    // Define o texto e cor com base na pontuação
    let text = '';
    let color = '';
    
    switch (strength) {
      case 0:
      case 1:
        text = 'Muito fraca';
        color = '#ef4444';
        break;
      case 2:
        text = 'Fraca';
        color = '#f97316';
        break;
      case 3:
        text = 'Média';
        color = '#eab308';
        break;
      case 4:
        text = 'Boa';
        color = '#22c55e';
        break;
      case 5:
        text = 'Excelente';
        color = '#10b981';
        break;
      default:
        text = '';
        color = '#94a3b8';
    }
    
    return { strength, text, color };
  }, [password]);

  const getPasswordRequirements = (password: string) => {
    return {
      length: {
        requirement:password.length >= 8,
        text: 'Mínimo 8 caracteres',
      },
      uppercase: {
        requirement: /[A-Z]/.test(password),
        text: 'Letra maiúscula',
      },
      lowercase: {
        requirement: /[a-z]/.test(password),
        text: 'Letra minúscula',
      },
      number: {
        requirement: /[0-9]/.test(password),
        text: 'Número',
      },
      special: {
        requirement: /[^A-Za-z0-9]/.test(password),
        text: 'Caractere especial',
      }
    };
  };

  

  return {
    passwordStrength,
    getPasswordRequirements
  };
}; 