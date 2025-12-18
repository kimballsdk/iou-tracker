
import React from 'react';
import { UserPlusIcon, Cog6ToothIcon, ChartBarIcon } from './icons';

interface HeaderProps {
    profiles: string[];
    activeProfile: string | null;
    onProfileChange: (profileName: string) => void;
    onAddProfile: () => void;
    onOpenSettings: () => void;
    onOpenSummary: () => void;
}

const Header: React.FC<HeaderProps> = ({ profiles, activeProfile, onProfileChange, onAddProfile, onOpenSettings, onOpenSummary }) => {
  return (
    <header className="py-3 px-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex-grow">
          <select
            value={activeProfile || ''}
            onChange={(e) => onProfileChange(e.target.value)}
            className="bg-transparent text-xl font-semibold text-gray-200 w-full focus:outline-none appearance-none"
            aria-label="Select Profile"
          >
            {profiles.map(profile => (
              <option key={profile} value={profile} className="bg-gray-800 text-white">
                {profile}
              </option>
            ))}
          </select>
      </div>
      <div className="flex items-center space-x-1">
        <button 
          onClick={onOpenSummary}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="View Summary"
        >
          <ChartBarIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Open Settings"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onAddProfile}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Add New Profile"
        >
          <UserPlusIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
