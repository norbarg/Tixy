//src/types/auth.types.ts
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'LOCAL_GOOGLE';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    login: string;
    authProvider: AuthProvider;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginPayload {
    loginOrEmail: string;
    password: string;
}

export interface RegisterPayload {
    login: string;
    email: string;
    password: string;
}
