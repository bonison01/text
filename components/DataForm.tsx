import React, { useState, useEffect } from 'react';
import { SaveIcon, ArrowUturnLeftIcon, GoogleSheetsIcon } from './Icons';
import { ExtractedData, ColumnConfig } from '../types';
import { supabase } from '../supabase/supabaseClient';

interface DataFormProps {
  initialData: ExtractedData;
  onSave?: (data: ExtractedData) => void; // Optional callback on save
  onDiscard: () => void;
  columnConfig: ColumnConfig[];
  isEditing?: boolean;
  onSaveToSheet?: (data: ExtractedData) => void;
  isSheetReady?: boolean;
  isAuthed?: boolean;
  isSavingToSheet?: boolean;
  isSheetSaveSuccess?: boolean;
  sheetError?: string | null;
}

export const DataForm: React.FC<DataFormProps> = ({
  initialData,
  onSave,
  onDiscard,
  columnConfig,
  isEditing = false,
  onSaveToSheet,
  isSheetReady,
  isAuthed,
  isSavingToSheet,
  isSheetSaveSuccess,
  sheetError,
}) => {
  const [formData, setFormData] = useState<ExtractedData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generates a unique 6-digit integer for six_digit_id column
  const generateUniqueSixDigitId = async (): Promise<number> => {
    while (true) {
      const randomId = Math.floor(100000 + Math.random() * 900000); // 6-digit number

      const { data, error } = await supabase
        .from('contacts')
        .select('six_digit_id')
        .eq('six_digit_id', randomId)
        .single();

      if (!data) {
        return randomId; // Unique number found
      }
      // else, retry with a new number
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      let result;

      if (isEditing) {
        // Update existing contact using UUID primary key
        const { data, error } = await supabase
          .from('contacts')
          .update({
            ...formData,
            date_added: formData.date_added || new Date().toISOString(),
          })
          .eq('id', formData.id) // Use UUID PK here
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // New contact: generate unique 6-digit number for six_digit_id
        const newSixDigitId = await generateUniqueSixDigitId();

        const { data, error } = await supabase
          .from('contacts')
          .insert([
            { ...formData, six_digit_id: newSixDigitId, date_added: new Date().toISOString() },
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setSaveSuccess(true);
      if (onSave && result) onSave(result);
    } catch (error: any) {
      setSaveError(error.message || 'Error saving contact');
    } finally {
      setIsSaving(false);
    }
  };

  const hasData = Object.entries(initialData)
    .filter(([key]) => key !== 'id' && key !== 'dateAdded')
    .some(([, val]) => typeof val === 'string' && val.length > 0);

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <h3 className="text-2xl font-bold text-base-content mb-4 text-center">
        {isEditing ? 'Edit Contact Details' : 'Verify & Save Data'}
      </h3>

      {!hasData && !isEditing && (
        <p className="text-center text-yellow-400 bg-yellow-900/50 p-3 rounded-md mb-4">
          No contact details were automatically identified. You can enter them manually or retake the photo.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {columnConfig
          .filter((c) => c.key !== 'dateAdded' && c.key !== 'six_digit_id') // Exclude six_digit_id from form editing
          .map(({ key, header }) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">
                {header}
              </label>
              <input
                type="text"
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                className="bg-base-100 border border-base-300 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5"
                placeholder={`Enter ${header}...`}
              />
            </div>
          ))}

        <div className="flex justify-center flex-wrap gap-4 pt-4">
          <button
            type="button"
            onClick={onDiscard}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
          >
            <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
            {isEditing ? 'Cancel' : 'Discard'}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className={`${
              isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-secondary'
            } text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center`}
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : isEditing ? 'Update Contact' : 'Save Contact'}
          </button>

          {onSaveToSheet && (
            <button
              type="button"
              onClick={() => onSaveToSheet(formData)}
              disabled={!isSheetReady || isSavingToSheet}
              title={
                !isSheetReady
                  ? 'Google Sheets client is loading...'
                  : 'Save contact to a Google Sheet in your Google Drive'
              }
              className={`font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed ${
                isSheetSaveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-secondary text-white hover:bg-brand-primary'
              }`}
            >
              <GoogleSheetsIcon className="w-5 h-5 mr-2" />
              <span>
                {isSavingToSheet
                  ? 'Saving...'
                  : isSheetSaveSuccess
                  ? 'Saved!'
                  : isAuthed
                  ? 'Save to Sheet'
                  : 'Connect & Save'}
              </span>
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <p className="text-green-400 text-center mt-2 text-sm">Contact saved successfully!</p>
        )}
        {saveError && (
          <p className="text-red-400 text-center mt-2 text-sm">{saveError}</p>
        )}
        {sheetError && (
          <p className="text-red-400 text-center mt-2 text-sm">{sheetError}</p>
        )}
      </form>
    </div>
  );
};
