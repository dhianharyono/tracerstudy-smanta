import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaPlus, FaTimes } from 'react-icons/fa';

interface SearchableSelectProps {
    label?: string;
    name: string;
    value: string;
    options: string[];
    onChange: (e: { target: { name: string; value: string } }) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    validationErrors?: Record<string, string>;
    onManualInput?: (value: string) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    name,
    value,
    options,
    onChange,
    placeholder = 'Pilih atau cari...',
    required = false,
    disabled = false,
    validationErrors = {},
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: string) => {
        onChange({ target: { name, value: option } });
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleManualInput = () => {
        if (searchTerm.trim()) {
            onChange({ target: { name, value: searchTerm.trim() } });
            setSearchTerm('');
            setIsOpen(false);
        }
    };

    return (
        <div className='form-group' ref={wrapperRef}>
            {label && (
                <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
                    {label}{' '}
                    {required && !disabled && <span className='text-red-500'>*</span>}
                </label>
            )}

            <div className='relative'>
                <div className='flex items-center'>
                    <input
                        type='text'
                        className={`w-full bg-transparent py-3 text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-tertiary)] ${disabled
                            ? 'bg-[color:var(--bg-tertiary)] opacity-70 cursor-not-allowed grayscale-[0.5]'
                            : 'bg-[color:var(--bg-secondary)]'
                            }`}
                        placeholder={value || placeholder}
                        required={required}
                        value={isOpen ? searchTerm : value}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (!disabled) setIsOpen(true);
                        }}
                        disabled={disabled}
                    />
                    <div className='flex items-center gap-2 ml-2'>
                        {value && !disabled && (
                            <button
                                type='button'
                                onClick={() => handleSelect('')}
                                className='text-[color:var(--text-tertiary)] hover:text-red-500'
                            >
                                <FaTimes className='h-3 w-3' />
                            </button>
                        )}
                        <FaChevronDown
                            className={`h-4 w-4 text-[color:var(--text-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </div>

                {isOpen && !disabled && (
                    <div className='absolute z-50 mt-2 w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl animate-fade-in max-h-64 overflow-hidden flex flex-col'>
                        <div className='overflow-y-auto'>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        type='button'
                                        className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[color:var(--bg-tertiary)] ${value === option ? 'bg-[var(--primary)] text-white' : 'text-[color:var(--text-primary)]'
                                            }`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {option}
                                    </button>
                                ))
                            ) : (
                                <div className='px-4 py-3 text-sm text-[color:var(--text-tertiary)]'>
                                    Tidak ada hasil ditemukan
                                </div>
                            )}
                        </div>

                        {searchTerm && !options.includes(searchTerm) && (
                            <button
                                type='button'
                                className='w-full px-4 py-3 text-left text-sm border-t border-[color:var(--border-color)] font-semibold text-[var(--primary)] hover:bg-[color:var(--bg-tertiary)] flex items-center gap-2'
                                onClick={handleManualInput}
                            >
                                <FaPlus className='h-3 w-3' />
                                <span>Gunakan "{searchTerm}"</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {validationErrors[name] && (
                <span className='mt-1 text-xs text-red-500'>
                    {validationErrors[name]}
                </span>
            )}
        </div>
    );
};

export default SearchableSelect;
