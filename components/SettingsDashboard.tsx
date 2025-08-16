
import React, { useState } from 'react';
import { ColumnConfig } from '../types';
import { SaveIcon, TrashIcon, PlusIcon } from './Icons';

interface SettingsDashboardProps {
    currentConfig: ColumnConfig[];
    onSave: (newConfig: ColumnConfig[]) => void;
    onClose: () => void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ currentConfig, onSave, onClose }) => {
    const [config, setConfig] = useState<ColumnConfig[]>(() => JSON.parse(JSON.stringify(currentConfig)));
    const [newFieldKey, setNewFieldKey] = useState('');

    const CORE_FIELDS = ['name', 'dateAdded'];

    const handleHeaderChange = (key: string, newHeader: string) => {
        setConfig(prev => prev.map(c => c.key === key ? { ...c, header: newHeader } : c));
    };

    const handleVisibilityChange = (key: string, isVisible: boolean) => {
        setConfig(prev => prev.map(c => c.key === key ? { ...c, visible: isVisible } : c));
    };
    
    const handleDeleteField = (keyToDelete: string) => {
        const field = config.find(c => c.key === keyToDelete);
        if (CORE_FIELDS.includes(keyToDelete)) {
            alert(`The "${field?.header}" field is essential and cannot be deleted.`);
            return;
        }
        setConfig(prev => prev.filter(c => c.key !== keyToDelete));
    };

    const handleAddField = () => {
        const trimmedKey = newFieldKey.trim();
        if (!trimmedKey) {
            alert("Field name cannot be empty.");
            return;
        }
        const key = trimmedKey.toLowerCase().replace(/\s+/g, '_');
        if (config.some(c => c.key === key)) {
            alert(`A field with the key "${key}" already exists. Please choose a different name.`);
            return;
        }
        const newField: ColumnConfig = {
            key: key,
            header: trimmedKey,
            visible: true,
        };
        setConfig(prev => [...prev, newField]);
        setNewFieldKey('');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(config);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div 
                className="bg-base-200 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSave}>
                    <div className="p-6 sm:p-8">
                        <h2 id="settings-title" className="text-3xl font-bold mb-6 text-center text-base-content">Customize Table View</h2>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            {config.map(({ key, header, visible }) => (
                                <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-base-100 p-4 rounded-lg gap-4">
                                    <div className="w-full sm:w-1/4">
                                        <label htmlFor={`header-${key}`} className="font-medium text-lg capitalize text-gray-300 ">{header}</label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-3/4">
                                        <div className="w-full sm:w-auto flex-grow">
                                            <label htmlFor={`header-${key}`} className="sr-only">Header for {key}</label>
                                            <input
                                                id={`header-${key}`}
                                                type="text"
                                                value={header}
                                                onChange={(e) => handleHeaderChange(key, e.target.value)}
                                                className="bg-base-300 border border-base-300 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5"
                                                placeholder="Column Header"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`visible-${key}`}
                                                checked={visible}
                                                onChange={(e) => handleVisibilityChange(key, e.target.checked)}
                                                className="w-5 h-5 rounded text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-secondary focus:ring-offset-base-200"
                                            />
                                            <label htmlFor={`visible-${key}`} className="text-sm font-medium text-gray-300">Visible</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteField(key)}
                                            className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                            title={CORE_FIELDS.includes(key) ? 'This field cannot be deleted' : `Delete ${header} field`}
                                            disabled={CORE_FIELDS.includes(key)}
                                        >
                                          <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-base-300 mt-6 pt-6">
                            <h3 className="text-xl font-bold mb-4 text-center text-base-content">Add New Field</h3>
                            <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                                <input
                                    type="text"
                                    value={newFieldKey}
                                    onChange={(e) => setNewFieldKey(e.target.value)}
                                    className="bg-base-300 border border-base-300 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5"
                                    placeholder="e.g., Job Title, Website..."
                                    aria-label="New field name"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center shrink-0"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Add Field
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 p-4 bg-base-300/50 rounded-b-2xl mt-auto">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center">
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
