import React, { useMemo } from 'react';
import { XMarkIcon } from './icons';
import { Transaction } from '../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTransactions: Record<string, Transaction[]>;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, allTransactions }) => {
  const { totalOwed, totalOwedToUser, netBalance, combinedHistory, balancesByProfile } = useMemo(() => {
    let totalOwed = 0;
    let totalOwedToUser = 0;
    const combinedHistory: (Transaction & { profile: string })[] = [];
    const balancesByProfile: Record<string, number> = {};

    Object.keys(allTransactions).forEach(profile => {
      balancesByProfile[profile] = 0;
      allTransactions[profile].forEach(tx => {
        combinedHistory.push({ ...tx, profile });
        const amount = tx.amount;
        if (tx.type === 'add') {
          totalOwed += amount;
          balancesByProfile[profile] += amount;
        } else {
          totalOwedToUser += amount;
          balancesByProfile[profile] -= amount;
        }
      });
    });

    combinedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalOwed,
      totalOwedToUser,
      netBalance: totalOwed - totalOwedToUser,
      combinedHistory,
      balancesByProfile
    };
  }, [allTransactions]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Overall Summary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Total You Owe</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(totalOwed)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Total Owed To You</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(totalOwedToUser)}</p>
                </div>
                <div className="col-span-2 border-t border-gray-700 pt-4">
                    <p className="text-sm text-gray-400">Net Balance</p>
                    <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(netBalance)}
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Breakdown by Profile</h3>
                <ul className="space-y-2">
                    {/* FIX: Use Object.keys() to map over profiles. This ensures `balance` is correctly inferred as a number, as Object.entries was incorrectly typing it as `unknown`. */}
                    {Object.keys(balancesByProfile).map((profile) => {
                       const balance = balancesByProfile[profile];
                       return (
                         <li key={profile} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                             <p className="font-medium text-gray-200">{profile}</p>
                             <p className={`font-semibold ${balance > 0 ? 'text-red-400' : balance < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                 {formatCurrency(balance)}
                             </p>
                         </li>
                       );
                    })}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
