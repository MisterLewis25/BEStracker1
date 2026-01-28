
import React from 'react';

export const COLORS = {
  primary: '#4ade80', // Green
  secondary: '#60a5fa', // Blue
  accent: '#fbbf24', // Yellow
  danger: '#f87171', // Red
  background: '#fdfcf0'
};

/**
 * SECURITY CONFIGURATION
 * Set the code your teachers will use to enter the app.
 */
export const SECURITY_CONFIG = {
  ACCESS_CODE: 'BEARS', // Change this to your school mascot or a private password
};

/**
 * DISTRIBUTION CONFIGURATION
 * 
 * 1. SPREADSHEET_URL: This is the actual Google Sheet where rows are stored. 
 *    Looks like: docs.google.com/spreadsheets/d/...
 * 
 * 2. SYNC_ENDPOINT: This is the "Web App" URL from Apps Script.
 *    Looks like: script.google.com/macros/s/.../exec
 *    WARNING: It MUST end in "/exec". If it ends in "/edit", it won't work!
 */
export const SHEET_CONFIG = {
  // The actual spreadsheet link for the "Admin Sheet" button
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1Dy1pocVqZQLjEPMgT455MtEcr_NaDrC9LKAkyd1_9wo/edit#gid=0',
  
  // The deployed Web App URL (the database pipe)
  SYNC_ENDPOINT: 'https://script.google.com/macros/s/AKfycbxv6JLSm9r75OClwRjsJ7OnGXuVIaKCXnpvMG-3M9FU9w-040sRujPjZGRP6fj5-gi59Q/exec'
};

export const Icons = {
  Bear: () => (
    <svg className="w-8 h-8 text-orange-800" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,2C10.89,2 10,2.89 10,4C10,5.11 10.89,6 12,6C13.11,6 14,5.11 14,4C14,2.89 13.11,2 12,2M7,7C5.9,7 5,7.9 5,9C5,10.11 5.9,11 7,11C8.11,11 9,10.11 9,9C9,7.9 8.11,7 7,7M17,7C15.9,7 15,7.9 15,9C15,10.11 15.9,11 17,11C18.11,11 19,10.11 19,9C19,7.9 18.11,7 17,7M12,11C10.34,11 9,12.34 9,14C9,15.66 10.34,17 12,17C13.66,17 15,15.66 15,14C15,12.34 13.66,11 12,11M5,14C3.34,14 2,15.34 2,17C2,18.66 3.34,20 5,20C6.66,20 8,18.66 8,17C8,15.34 6.66,14 5,14M19,14C17.34,14 16,15.34 16,17C16,18.66 17.34,20 19,20C20.66,20 22,18.66 22,17C22,15.34 20.66,14 19,14Z" />
    </svg>
  ),
  Apple: () => (
    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
    </svg>
  ),
  Pencil: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Add: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  External: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  Share: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Note: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Cloud: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
};

export const GRADELIST = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
  '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'
];

export const getNextGrade = (currentGrade: string): string => {
  const index = GRADELIST.indexOf(currentGrade);
  if (index === -1 || index === GRADELIST.length - 1) return currentGrade;
  return GRADELIST[index + 1];
};

export const getNextYearString = (currentYear: string): string => {
  const parts = currentYear.split('-');
  if (parts.length !== 2) return currentYear;
  
  const start = parseInt(parts[0]);
  const end = parseInt(parts[1]);
  
  if (isNaN(start) || isNaN(end)) return currentYear;
  
  return `${start + 1}-${end + 1}`;
};

export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 is Jan, 6 is July
  if (month >= 6) { // July (6) to December (11)
    return `${year}-${year + 1}`;
  } else { // January (0) to June (5)
    return `${year - 1}-${year}`;
  }
};

export const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'Charlie Brown',
    grade: '2nd Grade',
    teacher: 'Mrs. Higgins',
    interests: ['Kites', 'Baseball'],
    assessments: [
      {
        id: 'a1',
        year: '2023-2024',
        grade: '1st Grade',
        fall: 82,
        winter: 85,
        spring: 89,
        starReadingLevel: '1.2'
      },
      {
        id: 'a2',
        year: '2024-2025',
        grade: '2nd Grade',
        fall: 90,
        winter: 92,
        starReadingLevel: '2.5'
      }
    ],
    strategies: ['Visual cues', 'Positive reinforcement'],
    notes: [],
    lastUpdated: new Date().toISOString()
  }
];
