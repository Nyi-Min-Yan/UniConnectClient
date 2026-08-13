export type UUID = string;

export type BackendRole = 'SYSTEM_ADMIN' | 'STAFF' | 'STUDENT';

export type ScheduleType = 'COURSE' | 'LMS' | 'ASSIGNMENT' | 'BREAK';
export type ScheduleStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type MeetingType = 'LECTURE' | 'LAB';
export type AssignmentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type GenerationStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'PUBLISHED';
export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT';
export type BatchStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PUBLISHED';
export type ReleaseStatus = 'PENDING' | 'RELEASED' | 'BLOCKED';
export type TermStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PositionName =
  | 'LECTURER'
  | 'HOD'
  | 'STUDENT_AFFAIRS_OFFICER'
  | 'FINANCE_OFFICER'
  | 'ADMINISTRATIVE_OFFICER'
  | 'SENIOR_CLERK'
  | 'JUNIOR_CLERK';

export type PathRole = 'students' | 'teachers' | 'admin' | 'manage' | 'student-affire' | 'finance';

export type AuthUser = {
  userId: UUID;
  email: string;
  roleName: BackendRole;
  isActive: boolean;
  registrationStatus: RegistrationStatus;
  lastLogin: string | null;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  userId: UUID;
  email: string;
  roleName: BackendRole;
  isActive: boolean;
};

export type RefreshTokenResponse = LoginResponse;

export type CurrentUserResponse = AuthUser;

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
};

export type UserResponse = {
  userId: UUID;
  email: string;
  roleName: BackendRole;
  isActive: boolean;
  registrationStatus: RegistrationStatus;
  lastLogin: string | null;
  createdAt: string;
};

export type StaffResponse = {
  staffId: UUID;
  userId: UUID;
  staffNo: string;
  staffName: string;
  phoneNo: string | null;
  batchYear: number | null;
  address: string | null;
  unitId: UUID | null;
  unitName: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  createdAt: string;
  positions?: PositionAssignment[];
};

export type PositionAssignment = {
  positionAssignmentId: UUID;
  positionId: UUID;
  positionName: string;
  startDate: string;
  endDate: string | null;
  assignedByStaffId: UUID | null;
};

export type StudentResponse = {
  studentId: UUID;
  userId: UUID;
  email: string;
  majorId: UUID;
  majorCode: string;
  semesterId: UUID | null;
  semesterNo: number | null;
  sectionId: UUID | null;
  sectionName: string | null;
  termId: UUID | null;
  academicYear: number | null;
  rollNo: string;
  studentName: string;
  phoneNo: string | null;
  address: string | null;
  birthYear: number | null;
  createdAt: string;
};

export type OrganizationalUnitResponse = {
  unitId: UUID;
  unitName: string;
  unitCode: string;
  unitType: string | null;
  description: string | null;
};

export type PositionResponse = {
  positionId: UUID;
  positionName: string;
  description: string | null;
};

export type MajorResponse = {
  majorId: UUID;
  unitId: UUID;
  unitCode: string;
  majorCode: string;
  majorName: string;
};

export type SemesterResponse = {
  semesterId: UUID;
  semesterNo: number;
};

export type SectionResponse = {
  sectionId: UUID;
  sectionName: string;
};

export type AcademicTermResponse = {
  termId: UUID;
  academicYear: number;
  startDate: string | null;
  endDate: string | null;
  status: TermStatus;
};

export type CourseResponse = {
  courseId: UUID;
  unitId: UUID;
  unitCode: string;
  courseCode: string;
  courseName: string;
  creditUnit: number;
  majorId: UUID | null;
  majorCode: string | null;
  semesterId: UUID | null;
  semesterNo: number | null;
  isRequired: boolean;
  displayOrder: number;
};

export type MeetingRequirementResponse = {
  requirementId: UUID;
  courseId: UUID;
  courseCode: string;
  meetingType: MeetingType;
  sessionsPerWeek: number;
  periodsPerSession: number;
};

export type TeachingAssignmentResponse = {
  assignmentId: UUID;
  courseId: UUID;
  courseCode: string;
  courseName: string;
  staffId: UUID;
  staffNo: string;
  staffName: string;
  sectionId: UUID;
  sectionName: string;
  termId: UUID;
  academicYear: number;
  assignmentStatus: AssignmentStatus;
  assignedAt: string;
  assignedByStaffId: UUID | null;
};

export type TimeSlotResponse = {
  slotId: UUID;
  periodNo: number;
  startTime: string;
  endTime: string;
  displayOrder: number;
};

export type GenerationSessionResponse = {
  generationId: UUID;
  termId: UUID;
  academicYear: number;
  generatedByStaffId: UUID;
  generatedByStaffNo: string;
  status: GenerationStatus;
  startedAt: string | null;
  publishedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export type ScheduleResponse = {
  scheduleId: UUID;
  generationId: UUID;
  teachingAssignmentId: UUID | null;
  courseCode: string | null;
  staffName: string | null;
  sectionName: string | null;
  dayOfWeek: number;
  startSlotId: UUID;
  startPeriodNo: number;
  endSlotId: UUID;
  endPeriodNo: number;
  scheduleStatus: ScheduleStatus;
  scheduleType: ScheduleType;
  createdAt: string;
};

export type ClassSessionResponse = {
  sessionId: UUID;
  scheduleId: UUID;
  courseCode: string | null;
  sectionName: string | null;
  sessionDate: string;
  sessionStatus: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
};

export type AttendanceResponse = {
  attendanceId: UUID;
  sessionId: UUID;
  studentId: UUID;
  rollNo: string;
  studentName: string;
  attendanceStatus: AttendanceStatus;
  remark: string | null;
  markedAt: string;
  markedByStaffId: UUID | null;
};

export type ExamTypeResponse = {
  examTypeId: UUID;
  examTypeName: string;
};

export type ResultBatchResponse = {
  batchId: UUID;
  termId: UUID;
  academicYear: number;
  examTypeId: UUID;
  examTypeName: string;
  semesterId: UUID;
  semesterNo: number;
  uploadedByStaffId: UUID;
  uploadedByStaffNo: string;
  uploadedType: string | null;
  sourceFileName: string | null;
  totalFiles: number;
  matchedFiles: number;
  failedFiles: number;
  status: BatchStatus;
  uploadedAt: string;
  publishedAt: string | null;
};

export type ResultDocumentResponse = {
  resultDocumentId: UUID;
  batchId: UUID;
  examTypeName: string;
  studentId: UUID;
  rollNo: string;
  studentName: string;
  pdfFileName: string;
  storageObjectPath: string;
  releaseStatus: ReleaseStatus;
  blockedReason: string | null;
  viewedAt: string | null;
  downloadedAt: string | null;
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type CreateOrganizationalUnitRequest = {
  unitName: string;
  unitCode: string;
  unitType?: string;
  description?: string;
};

export type CreatePositionRequest = {
  positionName: string;
  description?: string;
};

export type CreateStaffRequest = {
  userId: UUID;
  staffNo: string;
  staffName: string;
  phoneNo?: string;
  batchYear?: number;
  address?: string;
  unitId?: UUID;
  joinedAt?: string;
  leftAt?: string;
};

export type CreateStaffPositionAssignmentRequest = {
  positionId: UUID;
  startDate: string;
  endDate?: string;
  assignedByStaffId?: UUID;
};

export type CreateMajorRequest = {
  unitId: UUID;
  majorCode: string;
  majorName: string;
};

export type CreateStudentRequest = {
  userId: UUID;
  majorId: UUID;
  semesterId?: UUID;
  sectionId?: UUID;
  termId?: UUID;
  rollNo: string;
  studentName: string;
  phoneNo?: string;
  address?: string;
  birthYear?: number;
};

export type CreateCourseRequest = {
  unitId: UUID;
  courseCode: string;
  courseName: string;
  creditUnit: number;
  majorId?: UUID;
  semesterId?: UUID;
  isRequired?: boolean;
  displayOrder?: number;
};

export type CreateMeetingRequirementRequest = {
  courseId: UUID;
  meetingType: MeetingType;
  sessionsPerWeek: number;
  periodsPerSession: number;
};

export type CreateTeachingAssignmentRequest = {
  courseId: UUID;
  staffId: UUID;
  sectionId: UUID;
  termId: UUID;
  assignmentStatus?: AssignmentStatus;
  assignedByStaffId?: UUID;
};

export type CreateTimeSlotRequest = {
  periodNo: number;
  startTime: string;
  endTime: string;
  displayOrder?: number;
};

export type CreateGenerationRequest = {
  termId: UUID;
  generatedByStaffId: UUID;
};

export type CreateScheduleRequest = {
  generationId: UUID;
  teachingAssignmentId?: UUID;
  dayOfWeek: number;
  startSlotId: UUID;
  endSlotId: UUID;
  scheduleType: ScheduleType;
  scheduleStatus?: ScheduleStatus;
};

export type CreateClassSessionRequest = {
  scheduleId: UUID;
  sessionDate: string;
  startedAt?: string;
  endedAt?: string;
  sessionStatus?: SessionStatus;
};

export type MarkAttendanceRequest = {
  entries: Array<{
    studentId: UUID;
    attendanceStatus: AttendanceStatus;
    remark?: string;
  }>;
};

export type UpdateAttendanceRequest = {
  attendanceStatus: AttendanceStatus;
  remark?: string;
};

export type CreateExamTypeRequest = {
  examTypeName: string;
};

export type CreateResultBatchRequest = {
  termId: UUID;
  examTypeId: UUID;
  semesterId: UUID;
  uploadedByStaffId: UUID;
  uploadedType?: string;
  sourceFileName?: string;
  totalFiles?: number;
  matchedFiles?: number;
  failedFiles?: number;
};