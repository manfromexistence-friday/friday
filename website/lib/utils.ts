import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this utility function to strip prefixes before sending to AI
export function stripPrefixes(text: string): string {
  // Check for all standard prefixes
  const prefixes = [
    "Image: ", 
    "Thinking: ", 
    "Search: ", 
    "Research: ", 
    "Canvas: "
  ];
  
  // Remove the prefix if found at the start of the text
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      return text.substring(prefix.length);
    }
  }
  
  return text;
}
