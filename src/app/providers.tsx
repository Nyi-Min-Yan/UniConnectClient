"use client";

import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { apiClient } from '@/lib/axios';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
      <Toaster richColors position="top-right" />
    </SWRConfig>
  );
}
