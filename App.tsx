
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction, RecurringExpense, Currency } from './types';
import Header from './components/Header';
import BalanceDisplay from './components/BalanceDisplay';
import HistoryList from './components/HistoryList';
import TransactionForm from './components/TransactionForm';
import { UserPlusIcon, CheckCircleIcon } from './components/icons';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import SummaryModal from './components/SummaryModal';
import ConfirmationModal from './components/ConfirmationModal';

// Static conversion rates for simplicity
export const CONVERSION_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08, // 1 EUR = 1.08 USD
  JPY: 0.0064, // 1 JPY = 0.0064 USD
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useLocalStorage<string[]>('profiles', []);
  const [activeProfile, setActiveProfile] = useLocalStorage<string | null>('activeProfile', null);
  const [allTransactions, setAllTransactions] = useLocalStorage<Record<string, Transaction[]>>('allTransactions', {});
  const [allRecurringExpenses, setAllRecurringExpenses] = useLocalStorage<Record<string, RecurringExpense[]>>('allRecurringExpenses', {});
  
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // New logic for flexible recurring expenses
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updatedTransactions = JSON.parse(JSON.stringify(allTransactions));
    let updatedRecurringExpenses = JSON.parse(JSON.stringify(allRecurringExpenses));
    let hasChanges = false;

    const calculateNextDate = (startDate: Date, recurrenceType: 'days' | 'weeks' | 'months', recurrenceValue: number): Date => {
        const nextDate = new Date(startDate);
        if (recurrenceType === 'days') {
            nextDate.setDate(nextDate.getDate() + recurrenceValue);
        } else if (recurrenceType === 'weeks') {
            nextDate.setDate(nextDate.getDate() + recurrenceValue * 7);
        } else if (recurrenceType === 'months') {
            nextDate.setMonth(nextDate.getMonth() + recurrenceValue);
        }
        return nextDate;
    };

    Object.keys(updatedRecurringExpenses).forEach(profile => {
        if (!updatedTransactions[profile]) updatedTransactions[profile] = [];

        updatedRecurringExpenses[profile].forEach((expense: RecurringExpense, index: number) => {
            let nextDueDate: Date;
            if (expense.lastAddedDate) {
                nextDueDate = calculateNextDate(new Date(expense.lastAddedDate), expense.recurrenceType, expense.recurrenceValue);
            } else {
                nextDueDate = new Date(expense.startDate);
            }
            nextDueDate.setHours(0, 0, 0, 0);

            // Catch-up loop for overdue expenses
            while (nextDueDate <= today) {
                const newTransaction: Transaction = {
                    id: `${nextDueDate.toISOString()}-recurring-${expense.id}`,
                    text: `${expense.text} (Recurring)`,
                    amount: expense.amount * CONVERSION_RATES[expense.currency],
                    type: 'add',
                    date: nextDueDate.toISOString(),
                    currency: expense.currency,
                    originalAmount: expense.amount,
                };
                
                if (!updatedTransactions[profile].some((t: Transaction) => t.id === newTransaction.id)) {
                    updatedTransactions[profile].push(newTransaction);
                    hasChanges = true;
                }
                
                updatedRecurringExpenses[profile][index].lastAddedDate = nextDueDate.toISOString();
                nextDueDate = calculateNextDate(nextDueDate, expense.recurrenceType, expense.recurrenceValue);
            }
        });
    });

    if (hasChanges) {
        Object.keys(updatedTransactions).forEach(profile => {
            updatedTransactions[profile].sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        setAllTransactions(updatedTransactions);
        setAllRecurringExpenses(updatedRecurringExpenses);
        setShowUpdateToast(true);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (showUpdateToast) {
        const timer = setTimeout(() => {
            setShowUpdateToast(false);
        }, 4000);
        return () => clearTimeout(timer);
    }
  }, [showUpdateToast]);


  useEffect(() => {
    if (profiles.length > 0 && (!activeProfile || !profiles.includes(activeProfile))) {
      setActiveProfile(profiles[0]);
    } else if (profiles.length === 0) {
      setActiveProfile(null);
    }
  }, [profiles, activeProfile, setActiveProfile]);

  const currentTransactions = useMemo(() => {
    if (!activeProfile) return [];
    return allTransactions[activeProfile] || [];
  }, [allTransactions, activeProfile]);
  
  const currentRecurringExpenses = useMemo(() => {
    if (!activeProfile) return [];
    return allRecurringExpenses[activeProfile] || [];
  }, [allRecurringExpenses, activeProfile]);

  const totalOwed = useMemo(() => {
    return currentTransactions.reduce((acc, curr) => {
      if (curr.type === 'add') {
        return acc + curr.amount;
      } else {
        return acc - curr.amount;
      }
    }, 0);
  }, [currentTransactions]);

  const handleSaveProfile = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      if (profiles.includes(trimmedName)) {
        alert("A profile with this name already exists.");
        return;
      }
      const newProfiles = [...profiles, trimmedName];
      setProfiles(newProfiles);
      setActiveProfile(trimmedName);
      if (!allTransactions[trimmedName]) {
        setAllTransactions(prev => ({ ...prev, [trimmedName]: [] }));
      }
      if(!allRecurringExpenses[trimmedName]) {
        setAllRecurringExpenses(prev => ({ ...prev, [trimmedName]: [] }));
      }
      setIsProfileModalOpen(false);
    }
  };

  const handleAddTransaction = (text: string, amount: number, type: 'add' | 'subtract', currency: Currency) => {
    if (!activeProfile) return;
    if (!text.trim()) {
      setError("Please enter a description for the transaction.");
      return;
    }
    if (amount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }
    setError(null);

    const newTransaction: Transaction = {
      id: `${new Date().toISOString()}-${Math.random()}`,
      text,
      amount: amount * CONVERSION_RATES[currency], // Convert to USD for storage
      type,
      date: new Date().toISOString(),
      currency,
      originalAmount: amount,
    };

    const updatedTransactions = [newTransaction, ...currentTransactions];
    setAllTransactions(prev => ({...prev, [activeProfile]: updatedTransactions }));
  };

  const handleSaveRecurringExpenses = (expenses: RecurringExpense[]) => {
      if (!activeProfile) return;
      setAllRecurringExpenses(prev => ({...prev, [activeProfile]: expenses }));
  };

  const requestDeleteProfile = (profileName: string) => {
    setProfileToDelete(profileName);
    setIsConfirmModalOpen(true);
  };
  
  const handleDeleteProfile = () => {
    if (!profileToDelete) return;

    // Update profiles list
    const newProfiles = profiles.filter(p => p !== profileToDelete);
    setProfiles(newProfiles);

    // Update transactions
    const newAllTransactions = { ...allTransactions };
    delete newAllTransactions[profileToDelete];
    setAllTransactions(newAllTransactions);

    // Update recurring expenses
    const newAllRecurringExpenses = { ...allRecurringExpenses };
    delete newAllRecurringExpenses[profileToDelete];
    setAllRecurringExpenses(newAllRecurringExpenses);
    
    // If the deleted profile was active, switch to another or clear
    if (activeProfile === profileToDelete) {
      setActiveProfile(newProfiles.length > 0 ? newProfiles[0] : null);
    }
    
    setIsConfirmModalOpen(false);
    setProfileToDelete(null);
  };

  const handleBackup = () => {
      const data = {
          profiles,
          activeProfile,
          allTransactions,
          allRecurringExpenses,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "iou-tracker-backup.json";
      link.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File is not valid text");
            const data = JSON.parse(text);

            if (data.profiles && data.allTransactions && data.allRecurringExpenses) {
                setProfiles(data.profiles);
                setActiveProfile(data.activeProfile || (data.profiles.length > 0 ? data.profiles[0] : null));
                setAllTransactions(data.allTransactions);
                setAllRecurringExpenses(data.allRecurringExpenses);
                alert("Data restored successfully!");
                setIsSettingsModalOpen(false);
            } else {
                alert("Invalid backup file format.");
            }
          } catch (error) {
              console.error("Failed to parse backup file:", error);
              alert("Failed to restore data. The file may be corrupt.");
          }
      };
      reader.readAsText(file);
      // Reset file input value to allow restoring the same file again if needed
      if (event.target) {
        event.target.value = '';
      }
  };
  
  const triggerRestore = () => {
    restoreInputRef.current?.click();
  };
  
  const clearError = () => { setError(null); };

  if (profiles.length === 0) {
    return (
       <>
        <div className="bg-black text-white h-screen w-screen flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-3xl font-bold mb-2">Welcome to IOU Tracker</h1>
            <p className="text-gray-400 mb-6">Create a profile to start tracking what you owe.</p>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-3 px-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <UserPlusIcon className="w-6 h-6 mr-2" />
                Add First Profile
            </button>
            <div className="mt-4 text-sm">
                <button
                    onClick={triggerRestore}
                    className="text-gray-400 hover:text-white underline transition-colors"
                >
                    Or Restore from Backup
                </button>
            </div>
        </div>
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
          isFirstProfile={true}
        />
        <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestore} className="hidden" />
       </>
    )
  }

  return (
    <div className="bg-black text-white h-screen w-screen flex flex-col font-sans">
      <div className="max-w-md w-full mx-auto flex flex-col h-full">
        <Header 
          profiles={profiles}
          activeProfile={activeProfile}
          onProfileChange={setActiveProfile}
          onAddProfile={() => setIsProfileModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenSummary={() => setIsSummaryModalOpen(true)}
        />
        <main className="flex-grow flex flex-col px-4 pt-8 pb-4 overflow-hidden">
          <BalanceDisplay amount={totalOwed} profileName={activeProfile || ''} />
          <HistoryList transactions={currentTransactions} />
        </main>
        {error && (
            <div 
                className="mx-4 mb-2 p-3 bg-red-800/50 border border-red-600 rounded-lg text-sm text-center text-red-200 cursor-pointer"
                onClick={clearError}
            >
                {error}
            </div>
        )}
        <TransactionForm onAddTransaction={handleAddTransaction} disabled={!activeProfile} />
      </div>
       <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          recurringExpenses={currentRecurringExpenses}
          onSaveRecurring={handleSaveRecurringExpenses}
          onBackup={handleBackup}
          onTriggerRestore={triggerRestore}
          profiles={profiles}
          activeProfile={activeProfile}
          onDeleteProfile={requestDeleteProfile}
        />
        <SummaryModal
            isOpen={isSummaryModalOpen}
            onClose={() => setIsSummaryModalOpen(false)}
            allTransactions={allTransactions}
        />
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleDeleteProfile}
            title="Delete Profile"
            message={
                <>
                    Are you sure you want to delete the profile "<strong>{profileToDelete}</strong>"? 
                    This will permanently remove all associated transactions and recurring expenses. 
                    This action cannot be undone.
                </>
            }
        />
        {/* Recurring Expenses Update Toast */}
        <div 
          aria-live="assertive"
          className={`fixed inset-x-0 bottom-0 flex items-center justify-center p-4 transition-transform duration-300 ease-in-out ${showUpdateToast ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div className="flex items-center space-x-3 bg-blue-900/80 backdrop-blur-sm border border-blue-700 text-blue-200 text-sm font-medium px-4 py-3 rounded-full shadow-lg">
                <CheckCircleIcon className="w-5 h-5"/>
                <span>Recurring expenses have been checked and updated.</span>
            </div>
        </div>
      <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestore} className="hidden" />
    </div>
  );
};

export default App;

