export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
