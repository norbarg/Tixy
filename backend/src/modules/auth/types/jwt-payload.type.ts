import { UserRole } from '../../../common/enums/user-role.enum';
import { AuthProvider } from '../../../common/enums/auth-provider.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  login: string;
  role: UserRole;
  authProvider: AuthProvider;
};

export type RefreshTokenPayload = JwtPayload & {
  tokenType: 'refresh';
};
