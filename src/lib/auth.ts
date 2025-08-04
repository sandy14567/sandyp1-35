export interface User {
  id: string;
  username: string;
  role: 'admin' | 'kasir';
  name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Demo credentials
const DEMO_USERS: Record<string, { user: User; password: string }> = {
  admin: {
    user: {
      id: 'admin-1',
      username: 'admin',
      role: 'admin',
      name: 'Administrator'
    },
    password: 'admin123'
  },
  kasir: {
    user: {
      id: 'kasir-1', 
      username: 'kasir',
      role: 'kasir',
      name: 'Kasir 1'
    },
    password: 'kasir123'
  }
};

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    const stored = localStorage.getItem('pos_current_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  login(credentials: LoginCredentials): { success: boolean; error?: string; user?: User } {
    const userRecord = DEMO_USERS[credentials.username];
    
    if (!userRecord || userRecord.password !== credentials.password) {
      return { success: false, error: 'Username atau password salah' };
    }

    this.currentUser = userRecord.user;
    localStorage.setItem('pos_current_user', JSON.stringify(this.currentUser));
    
    return { success: true, user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('pos_current_user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: 'admin' | 'kasir'): boolean {
    return this.currentUser?.role === role;
  }

  canAccess(requiredRoles: ('admin' | 'kasir')[]): boolean {
    if (!this.currentUser) return false;
    return requiredRoles.includes(this.currentUser.role);
  }
}

export const authService = new AuthService();