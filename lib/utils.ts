import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSalary(salary: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(salary);
}

export function generateId(): string {
  // Generate a proper UUID v4 (RFC4122 compliant)
  // This is compatible with Supabase's UUID format
  
  // Try browser/Node.js 18+ crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Try Node.js crypto module for server-side
  if (typeof require !== 'undefined') {
    try {
      const { randomUUID } = require('crypto');
      if (randomUUID) {
        return randomUUID();
      }
    } catch (e) {
      // Fall through to manual UUID generation
    }
  }
  
  // Fallback: Generate UUID v4 manually (RFC4122 compliant)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}