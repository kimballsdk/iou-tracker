
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon, PencilIcon, ArrowUturnLeftIcon } from './icons';
import { RecurringExpense, Currency, Transaction } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringExpenses: RecurringExpense[];
  onSaveRecurring: (expenses: RecurringExpense[]) => void;
  onBackup: () => void;
  onTriggerRestore: () => void;
  profiles: string[];
  activeProfile: string | null;
  onDeleteProfile: (profileName: string) => void;
  onRenameProfile: (oldName: string, newName: string) => void;
  deletedTransactions: Transaction[];
  onRestoreTransaction: (transaction: Transaction) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    recurringExpenses, 
    onSaveRecurring, 
    onBackup, 
    onTriggerRestore,
    profiles,
    activeProfile,
    onDeleteProfile,
    onRenameProfile,
    deletedTransactions,
    onRestoreTransaction
}) => {
  const [localExpenses, setLocalExpenses] = useState<RecurringExpense[]>([]);
  
  const [newExpenseText, setNewExpenseText] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [recurrenceValue, setRecurrenceValue] = useState(1);
  const [recurrenceType, setRecurrenceType] = useState<'days' | 'weeks' | 'months'>('months');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalExpenses(recurringExpenses);
      setEditingProfile(null); // Reset editing state when modal opens
    }
  }, [isOpen, recurringExpenses]);

  const resetForm = () => {
    setNewExpenseText('');
    setNewExpenseAmount('');
    setRecurrenceValue(1);
    setRecurrenceType('months');
    setStartDate(new Date().toISOString().split('T')[0]);
  };
  
  const handleAddExpense = () => {
      const amount = parseFloat(newExpenseAmount);
      if (newExpenseText.trim() && amount > 0 && recurrenceValue > 0) {
          const newExpense: RecurringExpense = {
              id: `${Date.now()}`,
              text: newExpenseText.trim(),
              amount,
              currency: 'USD',
              recurrenceType,
              recurrenceValue,
              startDate,
          };
          setLocalExpenses(prev => [...prev, newExpense]);
          resetForm();
      }
  };
  
  const handleRemoveExpense = (id: string) => {
      setLocalExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const handleStartRename = (profileName: string) => {
    setEditingProfile(profileName);
    setNewProfileName(profileName);
  };

  const handleSaveRename = () => {
    if (editingProfile) {
        onRenameProfile(editingProfile, newProfileName);
    }
    setEditingProfile(null);
    setNewProfileName('');
  };

  const handleCancelRename = () => {
    setEditingProfile(null);
    setNewProfileName('');
  };

  const handleSave = () => {
    onSaveRecurring(localExpenses);
    onClose();
  };
  
  if (!isOpen) return null;

  const formatRecurrenceRule = (exp: RecurringExpense) => {
      const value = exp.recurrenceValue;
      const type = exp.recurrenceType;
      const plural = value > 1 ? 's' : '';
      return `Every ${value} ${type.slice(0, -1)}${plural}, starting ${new Date(exp.startDate).toLocaleDateString()}`;
  };
  
  const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            {/* Recurring Expenses Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Recurring IOUs</h3>
                <div className="space-y-2 mb-3">
                    {localExpenses.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                            <div>
                                <p>{exp.text} - {formatCurrency(exp.amount, exp.currency)}</p>
                                <p className="text-xs text-gray-400">{formatRecurrenceRule(exp)}</p>
                            </div>
                            <button onClick={() => handleRemoveExpense(exp.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    {localExpenses.length === 0 && <p className="text-sm text-gray-500">No recurring expenses.</p>}
                </div>
                
                <div className="space-y-2 p-3 border border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-200">Add New Recurring Expense</h4>
                    <input type="text" placeholder="Description" value={newExpenseText} onChange={e => setNewExpenseText(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" placeholder="Amount (USD)" value={newExpenseAmount} onChange={e => setNewExpenseAmount(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Recurs Every</label>
                            <div className="flex">
                                <input type="number" min="1" value={recurrenceValue} onChange={e => setRecurrenceValue(parseInt(e.target.value, 10))} className="w-16 bg-gray-700 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value as any)} className="w-full bg-gray-700 rounded-r-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="text-xs text-gray-400 block mb-1">Start Date</label>
                             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button onClick={handleAddExpense} className="w-full flex items-center justify-center bg-blue-600 p-2 rounded-md text-white font-semibold hover:bg-blue-700 transition-colors"><PlusIcon className="w-5 h-5 mr-1"/> Add Expense</button>
                </div>
            </div>

            {/* Manage Profiles Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Manage Profiles</h3>
                <div className="space-y-2">
                    {profiles.map(profile => (
                        <div key={profile} className="flex items-center justify-between bg-gray-800 p-2 pl-4 rounded-lg">
                            {editingProfile === profile ? (
                                <>
                                    <input
                                        type="text"
                                        value={newProfileName}
                                        onChange={e => setNewProfileName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
                                        className="flex-grow bg-gray-700 rounded-md p-1 -m-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <div className="flex-shrink-0 flex items-center">
                                        <button onClick={handleSaveRename} className="p-2 text-green-400 hover:text-green-300">Save</button>
                                        <button onClick={handleCancelRename} className="p-2 text-gray-400 hover:text-white">Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className={profile === activeProfile ? "font-bold text-white" : "text-gray-300"}>
                                        {profile} {profile === activeProfile && <span className="text-xs text-blue-400">(Active)</span>}
                                    </p>
                                    <div className="flex-shrink-0 flex items-center">
                                        <button onClick={() => handleStartRename(profile)} className="p-2 text-gray-400 hover:text-white" title={`Rename ${profile}`}><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDeleteProfile(profile)} className="p-2 text-red-500 hover:text-red-400" title={`Delete ${profile}`}><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Deleted Transactions Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Deleted Transactions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {deletedTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                            <div>
                                <p>{tx.text} - {formatCurrency(tx.originalAmount, tx.currency)}</p>
                                <p className="text-xs text-gray-400">Deleted on {formatDate(tx.date)}</p>
                            </div>
                            <button onClick={() => onRestoreTransaction(tx)} className="text-blue-400 hover:text-blue-300" title="Restore Transaction"><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    {deletedTransactions.length === 0 && <p className="text-sm text-gray-500">No deleted transactions.</p>}
                </div>
            </div>

            {/* Data Management Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Data Management</h3>
                <div className="flex space-x-3">
                    <button onClick={onBackup} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full py-2 px-4 transition-colors">Backup Data</button>
                    <button onClick={onTriggerRestore} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full py-2 px-4 transition-colors">Restore Data</button>
                </div>
            </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full py-2 px-5 transition-colors">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2 px-5 transition-colors">Save & Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
