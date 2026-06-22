export interface AcademicRecord {
  level: 'SSC' | 'HSC' | 'Diploma' | 'Bachelor' | 'Master';
  institution: string;
  board?: string;
  result?: string;
  year?: number;
}

export interface EnglishTest {
  type: 'IELTS' | 'PTE' | 'TOEFL' | 'Duolingo';
  score?: string;
  testDate?: string;
  expiryDate?: string;
}

export interface FinancialInfo {
  sponsorName?: string;
  sponsorRelation?: string;
  fundingSource?: string;
  estimatedBudget?: string;
}

export interface StudyPreferences {
  country?: string;
  university?: string;
  course?: string;
  budgetRange?: string;
  intakeYear?: string;
  intakeSemester?: string;
}

export interface AssignedStaff {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  serviceCategory?: 'Language Prep' | 'Study Abroad' | 'Migration' | 'Visa' | 'Career';
  referralSource?: string;
  preferredCountry?: string;
  preferredIntake?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  nativeLanguage?: string;
  currentAddress?: string;
  passportNumber?: string;
  passportExpiry?: string;
  emergencyContact?: string;
  academicRecords?: AcademicRecord[];
  englishTest?: EnglishTest;
  financialInfo?: FinancialInfo;
  studyPreferences?: StudyPreferences;
  assignedBDM?: AssignedStaff;
  avatarUrl?: string;
  onboardingComplete: boolean;
  isActive: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | 'Draft' | 'Submitted' | 'Under Review' | 'University Applied'
  | 'Offer Received' | 'Accepted' | 'Tuition Paid' | 'COE Received'
  | 'Visa Applied' | 'Visa Granted';

export interface StageHistory {
  status: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Application {
  _id: string;
  studentId: string;
  serviceType: 'Language Prep' | 'Study Abroad' | 'Migration' | 'Visa' | 'Career';
  serviceDetail?: string;
  targetCountry?: string;
  targetUniversity?: string;
  targetCourse?: string;
  preferredIntake?: string;
  status: ApplicationStatus;
  assignedBDM?: AssignedStaff;
  stageHistory: StageHistory[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  participantId: string;
  participantType: 'student' | 'staff';
  name: string;
  role: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  applicationId?: string;
  title: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderType: 'student' | 'staff';
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string;
  readBy: string[];
  createdAt: string;
}

export type DocumentType =
  | 'Passport' | 'National ID' | 'Birth Certificate' | 'Transcript'
  | 'Certificate' | 'Recommendation Letter' | 'SOP' | 'LOR' | 'CV'
  | 'Bank Statement' | 'Sponsor Documents' | 'Visa Form'
  | 'Medical Report' | 'Police Clearance' | 'Other';

export type DocumentStatus =
  | 'Requested' | 'Uploaded' | 'Under Review' | 'Approved' | 'Rejected' | 'Revision Requested';

export interface StudentDocument {
  _id: string;
  studentId: string;
  applicationId?: string;
  documentType: DocumentType;
  fileName: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  filePath?: string;
  uploadedBy: 'student' | 'staff';
  status: DocumentStatus;
  requestedBy?: string;
  requestNote?: string;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
}

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';

export interface Milestone {
  _id: string;
  studentId: string;
  applicationId: string;
  serviceType: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  order: number;
  completedAt?: string;
  updatedBy?: string;
  notes?: string;
  createdAt: string;
}

export type AppointmentType = 'Counseling' | 'Visa Consultation' | 'Interview Prep' | 'Language Course Meeting';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface Appointment {
  _id: string;
  studentId: string;
  staffId?: AssignedStaff;
  staffType?: 'bdm';
  type: AppointmentType;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export type NewsCategory = 'General' | 'IELTS' | 'Study Abroad' | 'Visa' | 'Event' | 'Scholarship';

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  category: NewsCategory;
  isPinned: boolean;
  isActive: boolean;
  createdBy: { _id: string; name: string };
  createdAt: string;
}
