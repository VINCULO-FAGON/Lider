// shared/types.ts

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// Document Interface
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// AppConfig Interface
export interface AppConfig {
  appName: string;
  version: string;
  apiUrl: string;
  features: string[];
}