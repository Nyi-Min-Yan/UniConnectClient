export type Email = {
  id: number;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: { name: string; size: string }[];
};

export type Folder = "inbox" | "sent" | "draft" | "starred" | "trash";
