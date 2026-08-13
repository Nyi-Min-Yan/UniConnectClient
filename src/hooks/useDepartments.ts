"use client";

import useSWR from 'swr';
import { apiClient } from '@/lib/axios';
import type { OrganizationalUnitResponse } from '@/types';

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR<OrganizationalUnitResponse[]>('/api/organizational-units');

  const createDepartment = async (deptData: { unitName: string; unitCode: string; unitType?: string; description?: string }) => {
    const res = await apiClient.post<OrganizationalUnitResponse>('/api/organizational-units', deptData);
    mutate();
    return res.data;
  };

  const updateDepartment = async (id: string, deptData: Partial<OrganizationalUnitResponse>) => {
    const res = await apiClient.put<OrganizationalUnitResponse>(`/api/organizational-units/${id}`, deptData);
    mutate();
    return res.data;
  };

  const deleteDepartment = async (id: string) => {
    await apiClient.delete(`/api/organizational-units/${id}`);
    mutate();
  };

  return {
    departments: data ?? [],
    isLoading,
    isError: !!error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}

export function usePositions() {
  const { data, error, isLoading, mutate } = useSWR<any[]>('/api/positions');

  const createPosition = async (posData: { positionName: string; description?: string }) => {
    const res = await apiClient.post('/api/positions', posData);
    mutate();
    return res.data;
  };

  const updatePosition = async (id: string, posData: { positionName: string; description?: string }) => {
    const res = await apiClient.put(`/api/positions/${id}`, posData);
    mutate();
    return res.data;
  };

  const deletePosition = async (id: string) => {
    await apiClient.delete(`/api/positions/${id}`);
    mutate();
  };

  return {
    positions: data ?? [],
    isLoading,
    isError: !!error,
    createPosition,
    updatePosition,
    deletePosition,
  };
}

export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR<any[]>('/api/staff');

  const createStaff = async (staffData: any) => {
    const res = await apiClient.post('/api/staff', staffData);
    mutate();
    return res.data;
  };

  const updateStaff = async (id: string, staffData: any) => {
    const res = await apiClient.put(`/api/staff/${id}`, staffData);
    mutate();
    return res.data;
  };

  const deleteStaff = async (id: string) => {
    await apiClient.delete(`/api/staff/${id}`);
    mutate();
  };

  return {
    staff: data ?? [],
    isLoading,
    isError: !!error,
    createStaff,
    updateStaff,
    deleteStaff,
  };
}