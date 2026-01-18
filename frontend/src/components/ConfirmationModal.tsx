import React from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          buttonRing: 'focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          buttonRing: 'focus:ring-yellow-500',
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          buttonRing: 'focus:ring-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
      <div className='relative w-full max-w-sm md:max-w-md bg-[color:var(--bg-card)] rounded-2xl shadow-2xl border border-[color:var(--border-color)] overflow-hidden animate-scale-up'>
        <div className='p-6 text-center'>
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}
          >
            <FaExclamationTriangle
              className={`text-2xl ${styles.iconColor}`}
            />
          </div>

          <h3 className='mb-2 text-lg md:text-xl font-bold text-[color:var(--text-primary)]'>
            {title}
          </h3>

          <p className='mb-6 text-sm md:text-base text-[color:var(--text-secondary)] leading-relaxed'>
            {message}
          </p>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-5 py-2.5 text-sm font-bold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-secondary)] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 transition-all'
            >
              {cancelText}
            </button>
            <button
              type='button'
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 rounded-xl px-5 py-2.5 text-center text-sm font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 transition-all ${styles.buttonBg} ${styles.buttonRing}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
