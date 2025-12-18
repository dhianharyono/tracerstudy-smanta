import React from 'react';
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
            <div className="relative w-full max-w-md transform transition-all scale-100">
                <div className="relative bg-[color:var(--bg-card)] rounded-2xl shadow-2xl border border-[color:var(--border-color)]">
                    <div className="p-6 text-center">
                        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}>
                            <FaExclamationTriangle className={`text-2xl ${styles.iconColor}`} />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-[color:var(--text-primary)]">
                            {title}
                        </h3>

                        <p className="mb-6 text-[color:var(--text-secondary)]">
                            {message}
                        </p>

                        <div className="flex justify-center items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-5 py-2.5 text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--bg-secondary)] focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors w-full"
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`w-full rounded-xl px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 transition-colors ${styles.buttonBg} ${styles.buttonRing}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
