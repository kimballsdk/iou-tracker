
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
  icon?: React.ReactNode;
  iconContainerClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Confirm',
    confirmButtonClass = 'bg-blue-600 hover:bg-blue-500',
    icon,
    iconContainerClass = 'bg-blue-900/50',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
        <div className="flex items-start space-x-4">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${iconContainerClass}`}>
            {icon || <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />}
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <div className="mt-2">
              <div className="text-sm text-gray-400">{message}</div>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full justify-center rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 shadow-sm hover:bg-gray-600 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
