
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emiratesId: string;
  emirate: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  approvalDate?: string;
  paymentStatus: boolean;
  paymentRemarks?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  emiratesId: string;
  emirate: string;
  password: string;
}
