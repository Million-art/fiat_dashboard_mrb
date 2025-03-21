export interface KYCApplication {
  id: string; // Unique identifier for the KYC application
  ambassadorId: string; // ID of the user who submitted the application
  firstName: string; // Applicant's first name
  lastName: string; // Applicant's last name
  tgUsername: string; // Applicant's tg name
  email: string; // Applicant's email address
  address: string; // Applicant's address
  documentType: string; // Type of document submitted (e.g., "Passport", "Driver's License")
  photoUrl: string;
  documentFrontUrl: string; // URL to the front of the document
  documentBackUrl?: string; // Optional URL to the back of the document (if applicable)
  status: "pending" | "approved" | "rejected"; // Status of the KYC application
  submittedAt: string; // Timestamp when the application was submitted (in ISO format)
  reviewedAt?: string; // Optional timestamp when the application was reviewed (in ISO format)
  reviewedBy?: string; // Optional ID of the admin who reviewed the application
  rejectionReason?: string; // Optional reason for rejection (if status is "rejected")
}
export interface Receipt {
    id: string
    amount: number
    currency: string
    status: string
    ambassadorId?: string
    imageUrl?: string
    createdAt: Date
  }
  
  export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    ambassadorId?: string;
    type: "deposit" | "withdrawal";
    createdAt: Date;
  }
  
  export interface PaymentMethod {
    id: string
    bankName: string
    accountNumber: string
    accountName: string
    swiftCode?: string
  }
  
  export interface PaymentMethod {
    type: string;
    details: Record<string, any>;
  }
  
  export interface Ambassador {
    id: string;
    firstName: string;
    lastName: string;
    tgUsername: string;
    email: string;
    phone: string;
    address?: string; // Optional field
    idFront?: string; // Optional field (URL or base64 string)
    idBack?: string; // Optional field (URL or base64 string)
    country: string;
    photoUrl?: string; // Optional field (URL or base64 string)
    paymentMethods: PaymentMethod[]; // Array of payment methods
    createdAt: Date;
    role: string; //  "ambassador", "admin"
    kyc?: string; // Optional field ( "pending", "approved", "rejected")
  }
  
  
  export interface Country {
    name: string;
    currency:string;
    code: string;
    flag: string;
  }

export interface Receipt {
  id: string;
  aId: string;
  amount: number;
  senderTgId: string;
  documents: string[];
  status: string; 
  createdAt: Date;
}