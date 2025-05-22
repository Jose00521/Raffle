'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPasswordStrength, getPasswordStrengthText } from '../utils/validators';

interface PasswordFieldResult {
  passwordStrength: number;
  strengthText: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordsMatch: boolean | null;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
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
    if (!password) return 0;
    if (password.length < 8) return 0;
    
    let strength = 1; // Start with 1 for minimum length
    
    // Use single regex test for better performance
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (hasUpperCase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    
    return strength;
  }, [password]);
  
  // Memoize strength text with dependency only on strength
  const strengthText = useMemo(() => {
    switch (passwordStrength) {
      case 0: return 'Muito fraca';
      case 1: return 'Fraca';
      case 2: return 'Média';
      case 3: return 'Forte';
      case 4: return 'Muito forte';
      default: return '';
    }
  }, [passwordStrength]);
  
  // Optimize password match check
  useEffect(() => {
    if (!confirmPassword || !password || password.length < 8) {
      setPasswordsMatch(null);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      setPasswordsMatch(password === confirmPassword);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [password, confirmPassword]);

  // Memoize toggle functions
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, [confirmPassword,password]);

  return {
    passwordStrength,
    strengthText,
    showPassword,
    showConfirmPassword,
    passwordsMatch,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility
  };
}; 