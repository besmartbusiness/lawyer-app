import type { Timestamp } from 'firebase/firestore';

export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  caseDetails?: string;
  createdAt: Timestamp;
};

export type LegalDocument = {
  id: string;
  clientId: string;
  title: string;
  content: string;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
