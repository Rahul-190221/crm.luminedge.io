// Common TypeScript types for API responses

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'bdm' | 'student';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  scheduleId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
