import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const mergeClasses = (...values: ClassValue[]): string =>
  twMerge(clsx(values));
