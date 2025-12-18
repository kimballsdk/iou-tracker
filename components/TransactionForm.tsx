
import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from './icons';
import { Currency } from '../types';

interface TransactionFormProps {
  onAddTransaction: (text: string, amount: number, type: 'add' | 'subtract', currency: Currency) => void;
  disabled: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, disabled }) => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');

  const handleSubmit = (type: 'add' | 'subtract') => {
    const numericAmount = parseFloat(amount);
    if (!text || !numericAmount || numericAmount <= 0) {
        return;
    };
    onAddTransaction(text, numericAmount, type, currency);
    setText('');
    setAmount('');
  };

  const isSubmitDisabled = disabled || !text.trim() || !amount.trim() || parseFloat(amount) <= 0;

  return (
    <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
      <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50' : ''}`}>
        {/* Unified Input Bar */}
        <div className="flex items-center bg-gray-800 rounded-full focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={disabled ? 'Select a profile to begin' : 'Description'}
            className="flex-1 bg-transparent text-white placeholder-gray-500 rounded-l-full py-3 px-4 focus:outline-none"
            disabled={disabled}
          />
          <div className="flex items-center pr-2">
              <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-24 bg-transparent text-white text-right placeholder-gray-500 py-3 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={disabled}
              />
               <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-transparent text-white rounded-r-full pr-3 py-3 focus:outline-none"
                  disabled={disabled}
              >
                  <option value="USD" className="bg-gray-900">$ USD</option>
                  <option value="EUR" className="bg-gray-900">€ EUR</option>
                  <option value="JPY" className="bg-gray-900">¥ JPY</option>
              </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit('subtract')}
              disabled={isSubmitDisabled}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-full py-3 px-4 disabled:bg-gray-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Paid Back"
            >
              <MinusIcon className="w-6 h-6" />
              <span>Paid Back</span>
            </button>
            <button
              onClick={() => handleSubmit('add')}
              disabled={isSubmitDisabled}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold rounded-full py-3 px-4 disabled:bg-gray-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Owe More"
            >
              <PlusIcon className="w-6 h-6" />
              <span>Owe More</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;

