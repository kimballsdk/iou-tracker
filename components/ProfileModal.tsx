
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isFirstProfile?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, isFirstProfile = false }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {isFirstProfile ? 'Create Your First Profile' : 'Add New Profile'}
          </h2>
          {!isFirstProfile && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
        <p className="text-gray-400 mb-4 text-sm">
            Enter the name of the person you want to track IOUs for.
        </p>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Jane Doe"
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          {!isFirstProfile && (
            <button 
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full py-2 px-5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                Cancel
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2 px-5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:opacity-50"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
