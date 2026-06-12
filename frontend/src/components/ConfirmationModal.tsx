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
  theme?: 'light' | 'dark';
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
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    if (theme === 'light') {
      switch (variant) {
        case 'danger':
          return {
            iconBg: 'bg-red-50 border border-red-100',
            iconColor: 'text-red-500',
            buttonBg: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
            buttonRing: 'focus:ring-red-500',
          };
        case 'warning':
          return {
            iconBg: 'bg-amber-50 border border-amber-100',
            iconColor: 'text-amber-500',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
            buttonRing: 'focus:ring-amber-500',
          };
        case 'info':
        default:
          return {
            iconBg: 'bg-blue-50 border border-blue-100',
            iconColor: 'text-blue-500',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
            buttonRing: 'focus:ring-blue-500',
          };
      }
    }

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

  const overlayClass = theme === 'light'
    ? 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in'
    : 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in';

  const containerClass = theme === 'light'
    ? 'relative w-full max-w-sm md:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-scale-up'
    : 'relative w-full max-w-sm md:max-w-md bg-[color:var(--bg-card)] rounded-2xl shadow-2xl border border-[color:var(--border-color)] overflow-hidden animate-scale-up';

  const titleClass = theme === 'light'
    ? 'mb-2 text-lg md:text-xl font-black text-slate-900 tracking-tight'
    : 'mb-2 text-lg md:text-xl font-bold text-[color:var(--text-primary)]';

  const messageClass = theme === 'light'
    ? 'mb-6 text-sm text-slate-500 font-semibold leading-relaxed'
    : 'mb-6 text-sm md:text-base text-[color:var(--text-secondary)] leading-relaxed';

  const cancelButtonClass = theme === 'light'
    ? 'flex-1 rounded-xl border border-slate-200 bg-slate-100/80 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200/80 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100'
    : 'flex-1 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-5 py-2.5 text-sm font-bold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-secondary)] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 transition-all';

  return createPortal(
    <div className={overlayClass}>
      <div className={containerClass}>
        <div className='p-6 text-center'>
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}
          >
            <FaExclamationTriangle
              className={`text-2xl ${styles.iconColor}`}
            />
          </div>

          <h3 className={titleClass}>
            {title}
          </h3>

          <p className={messageClass}>
            {message}
          </p>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={onClose}
              className={cancelButtonClass}
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
