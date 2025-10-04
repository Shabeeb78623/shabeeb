
export interface User {
  id: string;
  regNo: string;
  fullName: string;
  mobileNo: string;
  whatsApp: string;
  nominee: string;
  relation?: 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Wife' | 'Husband' | '';
  emirate: string;
  mandalam: string;
  email: string;
  addressUAE: string;
  addressIndia: string;
  kmccMember: boolean;
  kmccMembershipNumber?: string;
  pratheekshaMember: boolean;
  pratheekshaMembershipNumber?: string;
  recommendedBy: string;
  photo?: string;
  emiratesId: string;
  password?: string;
  isImported?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'renewal_pending';
  role: 'user' | 'admin' | 'master_admin' | 'mandalam_admin' | 'custom_admin';
  mandalamAccess?: string;
  paymentDate?: string;
  customPermissions?: {
    canViewUsers: boolean;
    canEditUsers: boolean;
    canApproveUsers: boolean;
    canManagePayments: boolean;
    canManageBenefits: boolean;
    canSendNotifications: boolean;
    mandalamAccess?: ('BALUSHERI' | 'KUNNAMANGALAM' | 'KODUVALLI' | 'NADAPURAM' | 'KOYLANDI' | 'VADAKARA' | 'BEPUR' | 'KUTTIYADI')[];
  };
  registrationDate: string;
  registrationYear: number;
  isReregistration?: boolean;
  originalUserId?: string;
  approvalDate?: string;
  paymentStatus: boolean;
  paymentAmount?: number;
  paymentRemarks?: string;
  paymentSubmission?: {
    submitted: boolean;
    submissionDate?: string;
    approvalStatus: 'pending' | 'approved' | 'declined';
    userRemarks?: string;
    adminRemarks?: string;
    amount?: number;
  };
  benefitsUsed: BenefitUsage[];
  notifications: Notification[];
  passwordResetToken?: string;
  passwordResetExpiry?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  sentBy: string;
  read?: boolean;
  fromAdmin?: string;
}

export interface BenefitUsage {
  id: string;
  type: 'hospital' | 'death' | 'gulf_returnee' | 'cancer';
  remarks: string;
  amountPaid: number;
  date: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  mobileNo: string;
  whatsApp: string;
  nominee: string;
  relation: 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Wife' | 'Husband';
  emirate: string;
  mandalam: 'BALUSHERI' | 'KUNNAMANGALAM' | 'KODUVALLI' | 'NADAPURAM' | 'KOYLANDI' | 'VADAKARA' | 'BEPUR' | 'KUTTIYADI';
  email: string;
  addressUAE: string;
  addressIndia: string;
  kmccMember: boolean;
  kmccMembershipNumber?: string;
  pratheekshaMember: boolean;
  pratheekshaMembershipNumber?: string;
  recommendedBy: string;
  photo?: string;
  emiratesId: string;
  password: string;
  isReregistration?: boolean;
  originalUserId?: string;
}

export interface YearlyData {
  year: number;
  users: User[];
  isActive: boolean;
}
