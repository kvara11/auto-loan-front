import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// One width for every personal ID input (11 digits): 24rem at most, narrower when the space is.
export const PERSONAL_ID_WIDTH = "w-full max-w-sm"
