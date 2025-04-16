import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as a percentage
 * @param value The number to format
 * @param decimals The number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a date as a string
 * @param date The date to format
 * @param format The format to use
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return d.toLocaleDateString()
  } else if (format === 'long') {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } else if (format === 'year') {
    return d.getFullYear().toString()
  }

  return d.toISOString()
}

/**
 * Truncate a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) return str
  return `${str.substring(0, maxLength)}...`
}

/**
 * Extract domain from URL
 * @param url The URL to extract domain from
 * @returns Domain string
 */
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace(/^www\./, '')
  } catch (e) {
    return url
  }
}

/**
 * Calculate average of an array of numbers
 * @param arr Array of numbers
 * @returns Average value
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((sum, val) => sum + val, 0) / arr.length
}

/**
 * Get environment variable with fallback
 * @param key Environment variable key
 * @param fallback Fallback value
 * @returns Environment variable value or fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback
  }
  return fallback
}

/**
 * Check if dynamic APO is enabled
 * @returns Boolean indicating if dynamic APO is enabled
 */
export function isDynamicAPOEnabled(): boolean {
  return getEnv('NEXT_PUBLIC_USE_DYNAMIC_APO') === 'true'
}

/**
 * Get API key for a service
 * @param service Service name
 * @returns API key
 */
export function getAPIKey(service: 'jina' | 'serp' | 'firecrawl'): string {
  switch (service) {
    case 'jina':
      return getEnv('NEXT_PUBLIC_JINA_API_KEY')
    case 'serp':
      return getEnv('NEXT_PUBLIC_SERP_API_KEY')
    case 'firecrawl':
      return getEnv('NEXT_PUBLIC_FIRECRAWL_API_KEY')
    default:
      return ''
  }
}