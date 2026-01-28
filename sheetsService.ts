
import { SHEET_CONFIG } from '../constants.tsx';
import { Student } from '../types.ts';

/**
 * Syncs the entire student state to a Google Sheet.
 * We use 'text/plain' to avoid CORS preflight (OPTIONS request),
 * as Google Apps Script's doPost handles the raw body contents regardless.
 */
export const syncToGoogleSheet = async (students: Student[]): Promise<boolean> => {
  try {
    if (!SHEET_CONFIG.SYNC_ENDPOINT || SHEET_CONFIG.SYNC_ENDPOINT.includes('YOUR_DEPLOYMENT_ID')) {
      console.warn('Sync ignored: SYNC_ENDPOINT is not configured.');
      return false;
    }

    // Using a simple POST to avoid preflight issues
    const response = await fetch(SHEET_CONFIG.SYNC_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // This allows the POST to reach the script even if CORS headers are missing
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain',
      },
      redirect: 'follow', // Crucial for Apps Script
      body: JSON.stringify(students)
    });
    
    // Note: With 'no-cors', response.ok will be false and status will be 0
    // but the request still reaches the server. We assume success if no error is thrown.
    return true;
  } catch (error) {
    console.error('Failed to sync to Google Sheet:', error);
    return false;
  }
};

/**
 * Fetches the master student record from Google Sheets.
 */
export const fetchFromGoogleSheet = async (): Promise<Student[] | null> => {
  try {
    if (!SHEET_CONFIG.SYNC_ENDPOINT || SHEET_CONFIG.SYNC_ENDPOINT.includes('YOUR_DEPLOYMENT_ID')) {
      return null;
    }

    // GET requests generally handle CORS better if the script returns ContentService.MimeType.JSON
    const response = await fetch(SHEET_CONFIG.SYNC_ENDPOINT, {
      method: 'GET',
      cache: 'no-cache',
      redirect: 'follow'
    });

    if (!response.ok) {
      console.error(`Fetch failed with status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    // If we get a "Failed to fetch", it's almost certainly a CORS/Permissions issue
    console.error('Network error fetching from Sheet. Check "Anyone" permissions:', error);
    return null;
  }
};
