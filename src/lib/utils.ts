import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateItemId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
