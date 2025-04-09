export interface IUserInput {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'user' | 'admin';
  }
declare global {
  namespace Express {
    export interface Request {
      user: {
        userId: string
        role: string;
      };

    }
  }
}

