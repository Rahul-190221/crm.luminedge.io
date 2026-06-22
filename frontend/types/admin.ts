// Test Types - shared across MockTestPackage, MockTestSchedule, Exam
export type TestType = 'IELTS' | 'PTE' | 'GRE' | 'TOEFL';

// Course Types - specific Luminedge program names
export type CourseType =
  | 'IELTS Premium'
  | 'IELTS Crash'
  | 'IELTS Intense'
  | 'IELTS Elementary'
  | 'IELTS Mock Test'
  | 'Basic English'
  | 'GRE Premium'
  | 'TOEFL Premium'
  | 'PTE Premium';

// Course Interface
export interface Course {
  _id: string;
  name: string;
  testType: CourseType;
  description: string;
  durationMonths: number;
  enrolledCount: number;
  capacity: number;
  startDate: string;
  price: number;
  currency: string;
  instructor: string;
  schedule: string;
  syllabus: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock Test Package Interface
export interface MockTestPricing {
  testCount: number;
  fee: number;
}

export interface MockTestPackage {
  _id: string;
  testType: TestType;
  description: string;
  features: string[];
  pricing: MockTestPricing[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock Test Schedule Interface
export interface MockTestSchedule {
  _id: string;
  listNumber: number;
  name: string;
  testType: TestType;
  examType: ExamType;
  examDate: string;
  examTime: string;
  totalSeats: number;
  availableSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Luminedge Schedule (external API)
export interface LuminedgeTimeSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  slot: number;
  totalSlot: string;
}

export interface LuminedgeSchedule {
  _id: string;
  courseId: string;
  startDate: string;
  endDate: string;
  timeSlots: LuminedgeTimeSlot[];
  name: string;
  testSystem: string;
  testType: string;
  status: string;
  createdAt: string;
}

// Exam Interface
export type ExamType = 'Computer-Based' | 'Paper-Based';

export interface Exam {
  _id: string;
  name: string;
  examType: ExamType;
  testType: TestType;
  examDate: string;
  examTime: string;
  venue: string;
  registrationDeadline: string;
  fee: number;
  currency: string;
  totalSlots: number;
  availableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filter State Interface
export interface FilterState {
  courseType?: string;
  testType?: TestType | CourseType | 'all';
  examType?: ExamType | 'all';
  status?: string;
  sortBy?: string;
  dateRange?: { start: string; end: string };
}

// Badge color mappings
export const testTypeBadgeColors: Record<TestType, string> = {
  'IELTS': 'bg-red-100 text-red-700 border-red-200',
  'PTE': 'bg-purple-100 text-purple-700 border-purple-200',
  'GRE': 'bg-green-100 text-green-700 border-green-200',
  'TOEFL': 'bg-blue-100 text-blue-700 border-blue-200',
};

export const courseTypeBadgeColors: Record<CourseType, string> = {
  'IELTS Premium':   'bg-red-100 text-red-700 border-red-200',
  'IELTS Crash':     'bg-red-100 text-red-700 border-red-200',
  'IELTS Intense':   'bg-red-100 text-red-700 border-red-200',
  'IELTS Elementary':'bg-red-100 text-red-700 border-red-200',
  'IELTS Mock Test': 'bg-red-100 text-red-700 border-red-200',
  'Basic English':   'bg-orange-100 text-orange-700 border-orange-200',
  'GRE Premium':     'bg-green-100 text-green-700 border-green-200',
  'TOEFL Premium':   'bg-blue-100 text-blue-700 border-blue-200',
  'PTE Premium':     'bg-purple-100 text-purple-700 border-purple-200',
};

export const examTypeBadgeColors: Record<ExamType, string> = {
  'Computer-Based': 'bg-blue-100 text-blue-700',
  'Paper-Based': 'bg-amber-100 text-amber-700',
};

export const statusBadgeColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-700',
  'inactive': 'bg-gray-100 text-gray-600',
  'upcoming': 'bg-blue-100 text-blue-700',
  'ongoing': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
  'open': 'bg-green-100 text-green-700',
  'closed': 'bg-gray-100 text-gray-600',
};

// Lead Types
export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Facebook' | 'Instagram' | 'WhatsApp' | 'Email Campaign' | 'Walk-in' | 'Phone' | 'Other';
export type LeadStage = 'Intake' | 'Processing' | 'Hot' | 'Converted' | 'Dead';
export type ServiceInterest =
  | 'IELTS Premium'
  | 'IELTS Crash'
  | 'IELTS Intense'
  | 'IELTS Elementary'
  | 'IELTS Mock Test'
  | 'Basic English'
  | 'GRE Premium'
  | 'TOEFL Premium'
  | 'PTE Premium'
  | 'Study Abroad'
  | 'Visa Processing';

export interface FollowUp {
  date: string;
  note: string;
  nextFollowUpDate: string;
}

export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  source: LeadSource;
  serviceInterest: ServiceInterest[];
  assignedTo?: string | { _id: string; name: string; email: string };
  notes?: string;
  followUps: FollowUp[];
  lifecycleStage: LeadStage;
  createdAt: string;
  updatedAt: string;
}

export interface BDM {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'bdm' | 'admin' | string;
  status: 'active' | 'inactive' | string;
  activeLeads?: number;
  convertedLeads?: number;
  joinDate?: string;
  reportingTo?: string;
  reportingToName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const leadStageBadgeColors: Record<LeadStage, string> = {
  'Intake': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Hot': 'bg-orange-100 text-orange-700',
  'Converted': 'bg-green-100 text-green-700',
  'Dead': 'bg-red-100 text-red-700',
};
