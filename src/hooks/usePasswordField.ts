'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPasswordStrength, getPasswordStrengthText } from '../utils/validators';

interface PasswordFieldResult {
  passwordStrength: { strength: number; text: string; color: string };
}

/**
 * Hook personalizado para gerenciar campos de senha
 * Inclui funcionalidades como:
 * - Verificação de força da senha
 * - Verificação se as senhas coincidem
 * - Controle de visibilidade da senha
 */
export const usePasswordField = (password: string, confirmPassword?: string): PasswordFieldResult => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // Memoize password strength calculation with early returns
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, text: '', color: '#94a3b8' };
    
    let strength = 0;
    
    // Adiciona pontuação com base em critérios
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
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

  

  return {
    passwordStrength,
  };
}; 