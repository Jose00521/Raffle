// import axios from 'axios';
// import { toast } from 'react-toastify';

// interface RegisterParticipantData {
//   name: string;
//   email: string;
//   cpf: string;
//   phone: string;
//   birthdate: string;
//   password?: string;
//   confirmPassword?: string;
//   role?: string;
// }

// interface LoginCredentials {
//   email: string;
//   password: string;
// }

// interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
//   cpf: string;
//   phone: string;
//   birthdate: string;
//   userType: 'participant' | 'creator';
// }

// const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// const authService = {
//   /**
//    * Login with email and password
//    */
//   login: async (credentials: LoginCredentials) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, credentials);
//       return response.data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   },

//   /**
//    * Register a new participant user
//    */
//   registerParticipant: async (data: RegisterData) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/register/participant`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Register participant error:', error);
//       throw error;
//     }
//   },

//   /**
//    * Register a new creator user
//    */
//   registerCreator: async (data: RegisterData) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/register/creator`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Register creator error:', error);
//       throw error;
//     }
//   },

//   /**
//    * Check if user is authenticated
//    */
//   validateToken: async (token: string) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/validate-token`, { token });
//       return response.data;
//     } catch (error) {
//       console.error('Token validation error:', error);
//       throw error;
//     }
//   },

//   /**
//    * Reset password request (sends email)
//    */
//   requestPasswordReset: async (email: string) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/reset-password/request`, { email });
//       return response.data;
//     } catch (error) {
//       console.error('Password reset request error:', error);
//       throw error;
//     }
//   },

//   /**
//    * Reset password with token
//    */
//   resetPassword: async (token: string, password: string) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/reset-password/reset`, {
//         token,
//         password,
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Password reset error:', error);
//       throw error;
//     }
//   },
// };

// export default authService;

// /**
//  * Verifica se um usuário já existe pelo email ou CPF
//  * @param email Email do usuário
//  * @param cpf CPF do usuário
//  * @returns Resposta indicando se o usuário existe
//  */
// export const checkUserExists = async (email: string, cpf: string): Promise<boolean> => {
//   try {
//     const response = await fetch(`/api/user/check?email=${encodeURIComponent(email)}&cpf=${encodeURIComponent(cpf)}`);
    
//     if (!response.ok) {
//       throw new Error('Erro ao verificar usuário');
//     }
    
//     const data = await response.json();
//     return data.exists;
//   } catch (error) {
//     console.error('Erro ao verificar usuário:', error);
//     return false;
//   }
// }; 