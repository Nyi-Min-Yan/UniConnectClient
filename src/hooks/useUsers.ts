"use client";

import useSWR from 'swr';
import type { UserResponse, StaffResponse, StudentResponse, LecturerResponse } from '@/types';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<UserResponse[]>('/api/users');

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
    refreshUsers: mutate,
  };
}

export function useUsersByRole(role: string | null) {
  const endpoint = role ? `/api/users/role/${role}` : null;

  const { data, error, isLoading } = useSWR<UserResponse[]>(endpoint);

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR<StaffResponse[]>('/api/staff');

  return {
    staff: data ?? [],
    isLoading,
    isError: !!error,
    refreshStaff: mutate,
  };
}

export function useLecturers(termId?: string | null) {
  const endpoint = termId
    ? `/api/staff/lecturers?termId=${termId}`
    : '/api/staff/lecturers';

  const { data, error, isLoading, mutate } = useSWR<LecturerResponse[]>(endpoint);

  return {
    lecturers: data ?? [],
    isLoading,
    isError: !!error,
    refreshLecturers: mutate,
  };
}

export function useStaffById(staffId: string | null) {
  const { data, error, isLoading } = useSWR<StaffResponse>(
    staffId ? `/api/staff/${staffId}` : null
  );

  return {
    staff: data,
    isLoading,
    isError: !!error,
  };
}

export function useStaffPositionAssignments(staffId: string | null) {
  const { data, error, isLoading } = useSWR<any[]>(
    staffId ? `/api/staff/${staffId}/position-assignments` : null
  );

  return {
    assignments: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useStaffTeachingAssignments(staffId: string | null) {
  const { data, error, isLoading } = useSWR<any[]>(
    staffId ? `/api/staff/${staffId}/teaching-assignments` : null
  );

  return {
    assignments: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR<StudentResponse[]>('/api/students');

  return {
    students: data ?? [],
    isLoading,
    isError: !!error,
    refreshStudents: mutate,
  };
}

export function useStudentsByFilters(
  majorId?: string,
  semesterId?: string,
  sectionId?: string,
  termId?: string
) {
  const params = new URLSearchParams();
  if (majorId) params.append('majorId', majorId);
  if (semesterId) params.append('semesterId', semesterId);
  if (sectionId) params.append('sectionId', sectionId);
  if (termId) params.append('termId', termId);

  const endpoint = `/api/students${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading } = useSWR<StudentResponse[]>(endpoint);

  return {
    students: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useStudentById(studentId: string | null) {
  const { data, error, isLoading } = useSWR<StudentResponse>(
    studentId ? `/api/students/${studentId}` : null
  );

  return {
    student: data,
    isLoading,
    isError: !!error,
  };
}

export function useStudentAttendance(studentId: string | null) {
  const { data, error, isLoading } = useSWR<any[]>(
    studentId ? `/api/students/${studentId}/attendance` : null
  );

  return {
    attendance: data ?? [],
    isLoading,
    isError: !!error,
  };
}

export function useStudentResults(studentId: string | null) {
  const { data, error, isLoading } = useSWR<any[]>(
    studentId ? `/api/students/${studentId}/results` : null
  );

  return {
    results: data ?? [],
    isLoading,
    isError: !!error,
  };
}