declare global {
  namespace Express {
    interface Request {
      activeRoleId?: number;
      userId?: string;
    }
  }
}

export {};
