import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { ColumnConfig, ExtractedData } from '../types';
import { DataForm } from '../components/DataForm';
import { PrintIcon, EditIcon, TrashIcon } from '../components/Icons';
import { HeaderNavigation } from '../components/HeaderNavigation';
import '../styles/supabaseContactsPage.css';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'six_digit_id', header: 'ID', visible: true },
  { key: 'name', header: 'Name', visible: true },
  { key: 'email', header: 'Email', visible: true },
  { key: 'phone', header: 'Phone', visible: true },
  { key: 'date_added', header: 'Date Added', visible: true },
  { key: 'address', header: 'Address', visible: true },
];

export default function SupabaseContactsPage() {
  const [contacts, setContacts] = useState<ExtractedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<ExtractedData | null>(null);
  const [columnConfig] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appState, setAppState] = useState<'VIEWING' | 'EDITING' | 'SETTINGS'>('VIEWING');

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) {
        setError('Failed to fetch contacts from Supabase.');
        console.error(error);
      } else {
        setContacts(data || []);
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      alert('Error deleting contact: ' + error.message);
    } else {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleUpdate = async (updatedData: ExtractedData) => {
    const { id, ...updateFields } = updatedData;

    if ('id' in updateFields) {
      delete updateFields['id'];
    }

    const { error } = await supabase
      .from('contacts')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      alert('Error updating contact: ' + error.message);
    } else {
      setEditingContact(null);
      const updatedList = contacts.map(contact =>
        contact.id === id ? { ...contact, ...updateFields } : contact
      );
      setContacts(updatedList);
    }
  };

  const handlePrint = (contact: ExtractedData) => {
    const printableWindow = window.open('', '_blank');
    if (!printableWindow) return;

    const sixDigitId = contact.six_digit_id?.toString().padStart(6, '0') ?? '';

    const printableHtml = `
      <html>
        <head>
          <title>Print Contact</title>
          <link rel="stylesheet" href="/styles/print.css" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
              color: black;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
            }
            .id-block {
              text-align: right;
              font-family: 'OCR A Std', monospace;
            }
            .id-number {
              font-size: 28px;
              letter-spacing: 6px;
              user-select: none;
            }
            .barcode-upc {
              margin-top: 8px;
              display: flex;
              justify-content: flex-end;
              gap: 2px;
            }
            .barcode-bar {
              width: 3px;
              background: black;
            }
            .bar-narrow { height: 50px; }
            .bar-wide { height: 90px; }

            .bar-0 { height: 50px; }
            .bar-1 { height: 90px; }
            .bar-2 { height: 50px; }
            .bar-3 { height: 90px; }
            .bar-4 { height: 50px; }
            .bar-5 { height: 90px; }
            .bar-6 { height: 50px; }
            .bar-7 { height: 90px; }
            .bar-8 { height: 50px; }
            .bar-9 { height: 90px; }

            h2 {
              font-size: 20px;
              margin-bottom: 10px;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              margin-bottom: 8px;
              font-size: 16px;
            }
            .thank-you {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: gray;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="company-name">
              Mateng Delivery<br />
              Sagolband Sayang Leirak, near Indian Oil Pump<br />
              Mobile: +918787649928
            </div>

            <div class="id-block" aria-label="Contact ID and barcode">
              <div class="id-number">${sixDigitId}</div>
              <div class="barcode-upc" aria-hidden="true">
                ${sixDigitId
                  .split('')
                  .map(digit => `<div class="barcode-bar bar-${digit}"></div>`)
                  .join('')}
              </div>
            </div>
          </div>

          <h2>Contact Details</h2>
          <ul>
            ${columnConfig
              .filter(c => c.visible)
              .map(c => `<li><strong>${c.header}:</strong> ${contact[c.key] || ''}</li>`)
              .join('')}
          </ul>

          <div class="thank-you">
            <p>Thank you for using our services!</p>
            <p>Justmateng Service Pvt. ltd</p>
          </div>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printableWindow.document.write(printableHtml);
    printableWindow.document.close();
  };

  const onNavigate = (page: 'VIEWING' | 'EDITING' | 'SETTINGS') => {
    setAppState(page);
    setIsSettingsOpen(page === 'SETTINGS');
  };

  if (loading) return <p className="text-center text-lg text-gray-400">Loading contacts...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="supabase-contacts min-h-screen flex flex-col">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <HeaderNavigation
          appState={appState === 'SETTINGS' ? 'SETTINGS' : 'VIEWING'}
          isSettingsOpen={isSettingsOpen}
          onNavigate={onNavigate}
        />
      </div>

      <main className="flex-grow p-6">
        {editingContact && appState === 'VIEWING' ? (
          <DataForm
            initialData={editingContact}
            onSave={handleUpdate}
            onDiscard={() => setEditingContact(null)}
            columnConfig={columnConfig}
            isEditing={true}
          />
        ) : contacts.length === 0 ? (
          <p className="text-center text-gray-400">No contacts found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {columnConfig.filter(c => c.visible).map(col => (
                    <th key={col.key}>{col.header}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    {columnConfig.filter(c => c.visible).map(col => (
                      <td key={col.key} data-label={col.header}>
                        {contact[col.key]}
                      </td>
                    ))}
                    <td className="action-buttons" data-label="Actions">
                      <button onClick={() => setEditingContact(contact)} title="Edit">
                        <EditIcon className="w-5 h-5 text-white" />
                      </button>
                      <button onClick={() => handleDelete(contact.id)} title="Delete">
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                      <button onClick={() => handlePrint(contact)} title="Print">
                        <PrintIcon className="w-5 h-5 text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
