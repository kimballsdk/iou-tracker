
import React from 'react';

interface BalanceDisplayProps {
  amount: number;
  profileName: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ amount, profileName }) => {
  const isOwedToUser = amount < 0;
  const displayAmount = Math.abs(amount);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(displayAmount);

  const label = isOwedToUser ? `${profileName} Owes You` : `You Owe ${profileName}`;
  const textColor = isOwedToUser ? 'text-green-400' : 'text-red-400';

  return (
    <div className="text-center py-8">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-6xl font-bold tracking-tighter ${amount === 0 ? 'text-white' : textColor}`}>
        {formattedAmount}
      </p>
    </div>
  );
};

export default BalanceDisplay;
