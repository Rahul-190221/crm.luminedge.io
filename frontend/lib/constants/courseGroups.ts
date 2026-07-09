// Service-interest options grouped by category, for "All Courses" filter dropdowns.
// Values must stay in sync with SERVICE_INTEREST_OPTIONS in @/types/admin.
export const COURSE_GROUPS: { label: string; options: string[] }[] = [
  { label: 'Registration', options: ['IELTS Reg', 'PTE Reg', 'TOEFL Reg', 'GRE Reg', 'Duolingo Reg'] },
  { label: 'IELTS Courses', options: ['IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS 1 Module', 'IELTS 1-on-1', 'IELTS Mock Tests'] },
  { label: 'PTE Courses', options: ['PTE Premium', 'PTE Crash', 'PTE Intense', 'PTE 1 Module', 'PTE 1-on-1', 'PTE Mock Tests'] },
  { label: 'TOEFL Courses', options: ['TOEFL Premium', 'TOEFL Crash', 'TOEFL 1 Module', 'TOEFL 1-on-1', 'TOEFL Mock Tests'] },
  { label: 'GRE Courses', options: ['GRE Premium', 'GRE Quant', 'GRE Verbal', 'GRE 1-on-1', 'GRE Mock Tests', 'GRE Portal'] },
  { label: 'Other', options: ['Basic English', 'Spoken', 'Service Charge', 'SSC English', 'Study Abroad', 'Others'] },
]
