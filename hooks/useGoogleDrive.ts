
import { useState, useEffect, useCallback } from 'react';
import { ExtractedData, ColumnConfig } from '../types';

// These must be set as environment variables.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_NAME = 'Visual Text Extractor Contacts';

declare global {
    var gapi: any;
    var google: any;
}

let tokenClient: any = null;

// NOTE: The hook is still named useGoogleDrive to avoid file system changes,
// but the functionality has been updated to use Google Sheets.
export const useGoogleDrive = () => {
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isGisReady, setIsGisReady] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [pendingSave, setPendingSave] = useState<{ data: ExtractedData; columnConfig: ColumnConfig[] } | null>(null);

    const performSave = useCallback(async (data: ExtractedData, columnConfig: ColumnConfig[]) => {
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);

        try {
            const visibleColumns = columnConfig.filter(c => c.visible);

            // 1. Find spreadsheet by name using Drive API.
            const searchResponse = await gapi.client.drive.files.list({
                q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and 'root' in parents and trashed=false`,
                fields: 'files(id)',
            });
            
            let spreadsheetId: string | null = null;
    
            if (searchResponse.result.files.length > 0) {
                spreadsheetId = searchResponse.result.files[0].id;
            } else {
                // 2. If not found, create it using Sheets API with headers.
                const headers = visibleColumns.map(c => c.header);
    
                const createResponse = await gapi.client.sheets.spreadsheets.create({
                    properties: {
                        title: SPREADSHEET_NAME,
                    },
                    sheets: [{
                        properties: { title: 'Contacts' },
                        data: [{
                            rowData: [{
                                values: headers.map(h => ({ userEnteredValue: { stringValue: h } }))
                            }]
                        }]
                    }]
                });
                spreadsheetId = createResponse.result.spreadsheetId;
            }
    
            if (!spreadsheetId) {
                throw new Error("Could not create or find the spreadsheet.");
            }
    
            // 3. Append data to the sheet.
            const dataRow = visibleColumns.map(c => data[c.key] || '');
            
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'Contacts!A1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [dataRow],
                },
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (e: any) {
            console.error("Error saving to Google Sheets:", e);
            const errorMessage = e?.result?.error?.message || "An error occurred while saving to Google Sheets.";
            setError(`Google API Error: ${errorMessage}`);
            if (e.status === 401 || e.result?.error?.status === 'UNAUTHENTICATED') {
                setIsAuthed(false); // Force re-auth on next attempt
            }
        } finally {
            setIsSaving(false);
        }
    }, []);

    const gisLoaded = useCallback(() => {
        if (!GOOGLE_CLIENT_ID) {
             console.error("GIS client init error: GOOGLE_CLIENT_ID is not set.");
             return;
        }
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        setError(`Authentication failed: ${tokenResponse.error_description || 'Please try again.'}`);
                        console.error(tokenResponse.error);
                        setIsAuthed(false);
                        setPendingSave(null);
                    } else {
                        setIsAuthed(true);
                        setError(null);
                        if (pendingSave) {
                           await performSave(pendingSave.data, pendingSave.columnConfig);
                           setPendingSave(null);
                        }
                    }
                },
            });
            setIsGisReady(true);
        } catch(e) {
            console.error("GIS client init error", e);
            setError("Could not initialize Google Sign-In. Check console for details.");
        }
    }, [pendingSave, performSave]);


    const gapiLoaded = useCallback(() => {
        if (!GOOGLE_API_KEY) {
            console.error("GAPI client init error: GOOGLE_API_KEY is not set.");
            return;
        }
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: DISCOVERY_DOCS,
                });
                setIsGapiReady(true);
            } catch(e) {
                console.error("GAPI client init error", e);
                setError("Could not connect to Google services. Check console for details.");
            }
        });
    }, []);
    
    useEffect(() => {
        window.addEventListener('gapiLoaded', gapiLoaded);
        window.addEventListener('gisLoaded', gisLoaded);

        return () => {
            window.removeEventListener('gapiLoaded', gapiLoaded);
            window.removeEventListener('gisLoaded', gisLoaded);
        }
    }, [gapiLoaded, gisLoaded]);
    
    const signIn = useCallback(() => {
        setError(null);
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: '' });
        } else {
            setError("Google client is not ready. Please ensure credentials are set and try again.");
        }
    }, []);

    const saveContact = useCallback(async (data: ExtractedData, columnConfig: ColumnConfig[]) => {
        if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
            setError("Google services are not configured. Administrator needs to provide API credentials.");
            return;
        }

        if (!isGapiReady || !isGisReady) {
             setError("Google client is not ready. Please try again in a moment.");
             return;
        }

        if (!isAuthed) {
            setPendingSave({ data, columnConfig });
            signIn();
            return;
        }
        
        await performSave(data, columnConfig);

    }, [isAuthed, signIn, performSave, isGapiReady, isGisReady]);

    const isReady = isGapiReady && isGisReady;

    return { isReady, isAuthed, isSaving, error, saveSuccess, signIn, saveContact };
};
