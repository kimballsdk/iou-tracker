
import React from 'react';
import { Transaction } from '../types';
import { PlusCircleIcon, MinusCircleIcon } from './icons';

interface HistoryListProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ transactions, onTransactionClick }) => {
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'narrowSymbol'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    };


  if (transactions.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto pr-2">
        <h2 className="text-lg font-semibold text-gray-400 mb-2">History</h2>
      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center justify-between bg-gray-900 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => onTransactionClick(tx)}
          >
            <div className="flex items-center space-x-3">
                {tx.type === 'add' ? 
                    <PlusCircleIcon className="w-6 h-6 text-red-400" /> : 
                    <MinusCircleIcon className="w-6 h-6 text-green-400" />
                }
              <div>
                <p className="font-medium text-gray-200">{tx.text}</p>
                <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
              </div>
            </div>
            <p className={`font-semibold text-right ${tx.type === 'add' ? 'text-red-400' : 'text-green-400'}`}>
              {tx.type === 'add' ? '+' : '-'}
              {formatCurrency(tx.originalAmount, tx.currency)}
               {tx.currency !== 'USD' && <span className="block text-xs text-gray-500 font-normal">({formatCurrency(tx.amount, 'USD')})</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryList;
