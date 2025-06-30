
export interface User {
  id: string;
  regNo: string;
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
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'master_admin' | 'mandalam_admin';
  mandalamAccess?: 'BALUSHERI' | 'KUNNAMANGALAM' | 'KODUVALLI' | 'NADAPURAM' | 'KOYLANDI' | 'VADAKARA' | 'BEPUR' | 'KUTTIYADI';
  registrationDate: string;
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
}
