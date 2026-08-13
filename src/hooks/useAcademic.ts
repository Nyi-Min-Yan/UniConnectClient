"use client";

import useSWR from 'swr';
import type { StudentResponse, AttendanceResponse } from '@/types';

export function useStudentGrades(studentId: string | null) {
  const endpoint = studentId ? `/api/students/${studentId}/results` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { grades: data, isLoading, isError: !!error };
}

export function useStudentAttendance(studentId: string | null) {
  const endpoint = studentId ? `/api/students/${studentId}/attendance` : null;

  const { data, error, isLoading } = useSWR<AttendanceResponse[]>(endpoint);

  return { attendance: data, isLoading, isError: !!error };
}

export function useLowAttendanceStudents() {
  const { data, error, isLoading } = useSWR<AttendanceResponse[]>('/api/attendance?below75=true');

  return { lowAttendanceList: data ?? [], isLoading, isError: !!error };
}

export function useAttendanceBySession(sessionId: string | null) {
  const endpoint = sessionId ? `/api/attendance?sessionId=${sessionId}` : null;

  const { data, error, isLoading } = useSWR<AttendanceResponse[]>(endpoint);

  return { attendance: data ?? [], isLoading, isError: !!error };
}

export function useOrganizationalUnits() {
  const { data, error, isLoading } = useSWR<any[]>('/api/organizational-units');

  return { units: data ?? [], isLoading, isError: !!error };
}

export function useMajors() {
  const { data, error, isLoading } = useSWR<any[]>('/api/majors');

  return { majors: data ?? [], isLoading, isError: !!error };
}

export function useMajorsByUnit(unitId: string | null) {
  const endpoint = unitId ? `/api/organizational-units/${unitId}/majors` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { majors: data ?? [], isLoading, isError: !!error };
}

export function useSemesters() {
  const { data, error, isLoading } = useSWR<any[]>('/api/semesters');

  return { semesters: data ?? [], isLoading, isError: !!error };
}

export function useSections() {
  const { data, error, isLoading } = useSWR<any[]>('/api/sections');

  return { sections: data ?? [], isLoading, isError: !!error };
}

export function useAcademicTerms() {
  const { data, error, isLoading } = useSWR<any[]>('/api/terms');

  return { terms: data ?? [], isLoading, isError: !!error };
}

export function useActiveTerm() {
  const { data, error, isLoading } = useSWR<any[]>(
    '/api/terms?status=ACTIVE',
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return { activeTerm: data?.[0] ?? null, isLoading, isError: !!error };
}

export function usePositions() {
  const { data, error, isLoading } = useSWR<any[]>('/api/positions');

  return { positions: data ?? [], isLoading, isError: !!error };
}

export function useCourses() {
  const { data, error, isLoading } = useSWR<any[]>('/api/courses');

  return { courses: data ?? [], isLoading, isError: !!error };
}

export function useCoursesByMajor(majorId: string | null) {
  const endpoint = majorId ? `/api/courses?majorId=${majorId}` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { courses: data ?? [], isLoading, isError: !!error };
}

export function useCourseMeetingRequirements(courseId: string | null) {
  const endpoint = courseId ? `/api/courses/${courseId}/meeting-requirements` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { requirements: data ?? [], isLoading, isError: !!error };
}

export function useTeachingAssignments(
  termId?: string,
  sectionId?: string,
  staffId?: string
) {
  const params = new URLSearchParams();
  if (termId) params.append('termId', termId);
  if (sectionId) params.append('sectionId', sectionId);
  if (staffId) params.append('staffId', staffId);

  const endpoint = `/api/teaching-assignments${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { assignments: data ?? [], isLoading, isError: !!error };
}

export function useTimeSlots() {
  const { data, error, isLoading } = useSWR<any[]>('/api/time-slots');

  return { timeSlots: data ?? [], isLoading, isError: !!error };
}

export function useTimetableGenerations(termId?: string) {
  const endpoint = termId ? `/api/generations?termId=${termId}` : '/api/generations';

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { generations: data ?? [], isLoading, isError: !!error };
}

export function useSchedules(
  termId?: string,
  sectionId?: string,
  staffId?: string,
  dayOfWeek?: number
) {
  const params = new URLSearchParams();
  if (termId) params.append('termId', termId);
  if (sectionId) params.append('sectionId', sectionId);
  if (staffId) params.append('staffId', staffId);
  if (dayOfWeek) params.append('dayOfWeek', String(dayOfWeek));

  const endpoint = `/api/schedules${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { schedules: data ?? [], isLoading, isError: !!error };
}

export function useSchedulesByGeneration(generationId: string | null) {
  const endpoint = generationId ? `/api/generations/${generationId}/schedules` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { schedules: data ?? [], isLoading, isError: !!error };
}

export function useClassSessions(scheduleId: string | null) {
  const endpoint = scheduleId ? `/api/sessions?scheduleId=${scheduleId}` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { sessions: data ?? [], isLoading, isError: !!error };
}

export function useExamTypes() {
  const { data, error, isLoading } = useSWR<any[]>('/api/exam-types');

  return { examTypes: data ?? [], isLoading, isError: !!error };
}

export function useResultBatches(
  termId?: string,
  semesterId?: string,
  examTypeId?: string
) {
  const params = new URLSearchParams();
  if (termId) params.append('termId', termId);
  if (semesterId) params.append('semesterId', semesterId);
  if (examTypeId) params.append('examTypeId', examTypeId);

  const endpoint = `/api/result-batches${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { batches: data ?? [], isLoading, isError: !!error };
}

export function useResultDocuments(batchId: string | null) {
  const endpoint = batchId ? `/api/result-documents?batchId=${batchId}` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { documents: data ?? [], isLoading, isError: !!error };
}

export function useStudentResultDocuments(studentId: string | null) {
  const endpoint = studentId ? `/api/result-documents/by-student/${studentId}` : null;

  const { data, error, isLoading } = useSWR<any[]>(endpoint);

  return { documents: data ?? [], isLoading, isError: !!error };
}