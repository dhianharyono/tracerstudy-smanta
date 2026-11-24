import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  FaPaperPlane,
  FaTrashAlt,
  FaRobot,
  FaPlus,
  FaHistory,
  FaTimes,
  FaRegCommentDots,
  FaChevronDown,
  FaCheck,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export interface AlumniRecommendationCard {
  title: string;
  subtitle?: string;
  category?: 'kampus' | 'jurusan' | 'karir' | 'alumni';
  peluangLabel?: 'Peluang Tinggi' | 'Peluang Sedang' | 'Kompetitif';
  statsInfo?: string;
  description?: string;
  actionText?: string;
}

export interface AlumniCitation {
  totalCount: number;
  label: string;
  cohortRange?: string;
  details?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citation?: AlumniCitation;
  recommendations?: AlumniRecommendationCard[];
  followUpSuggestions?: string[];
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface SmartMatchChatProps {
  initialRole?: 'student' | 'alumni' | 'admin' | 'school';
  className?: string;
  isFullScreen?: boolean;
}

const STORAGE_SESSIONS_PREFIX = 'smanta_ai_sessions_';
const STORAGE_USER_MODEL_KEY = 'smanta_user_selected_model';

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
  tag?: string;
  desc: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    tag: 'Default',
    desc: 'Super Cepat, Hemat Kuota, Latency Rendah',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    desc: 'Stabil & Handal untuk Pertanyaan Rutin',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    desc: 'Generasi Baru, Kecepatan Respons Tinggi',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    desc: 'Model Penalaran & Logika Multimodal Terbaru',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    desc: 'Analisis Kompleks & Pemahaman Dataset Luas',
  },
];

// Sub-komponen teks respons AI dengan animasi Typewriter / Streaming Typing Effect
const TypewriterMessage: React.FC<{
  content: string;
  isTyping?: boolean;
  onDoneTyping?: () => void;
  onTick?: () => void;
  renderMarkdown: (text: string) => React.ReactNode;
}> = ({ content, isTyping, onDoneTyping, onTick, renderMarkdown }) => {
  const [displayedLength, setDisplayedLength] = useState(() => (isTyping ? 0 : content.length));
  const isComplete = displayedLength >= content.length;

  useEffect(() => {
    if (!isTyping || isComplete) {
      if (isTyping && isComplete && onDoneTyping) {
        onDoneTyping();
      }
      return;
    }

    const timer = setTimeout(() => {
      // Chunk pengetikan dinamis (2-4 karakter sekaligus agar cepat dan mulus)
      setDisplayedLength((prev) => {
        const next = Math.min(content.length, prev + 3);
        if (next >= content.length && onDoneTyping) {
          onDoneTyping();
        }
        return next;
      });
      if (onTick) onTick();
    }, 15);

    return () => clearTimeout(timer);
  }, [displayedLength, content.length, isTyping, isComplete, onDoneTyping, onTick]);

  const visibleText = isTyping ? content.slice(0, displayedLength) : content;

  return (
    <div className='relative'>
      {renderMarkdown(visibleText)}
    </div>
  );
};

export const SmartMatchChat: React.FC<SmartMatchChatProps> = ({
  initialRole,
  className = '',
  isFullScreen = false,
}) => {
  const { user } = useAuth();
  const activeRole = initialRole || (user?.role === 'admin' ? 'admin' : user?.role === 'alumni' ? 'alumni' : 'student');
  const userId = (user as any)?.id || (user as any)?._id || 'guest';
  const sessionsStorageKey = `${STORAGE_SESSIONS_PREFIX}${userId}_${activeRole}`;
  const legacyStorageKey = `smanta_ai_chat_${userId}_${activeRole}`;

  // State Sessions (daftar semua sesi obrolan yang tersimpan)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem(sessionsStorageKey);
      if (savedSessions) {
        return JSON.parse(savedSessions);
      }
      // Migrasi dari legacy single session jika ada
      const legacySaved = localStorage.getItem(legacyStorageKey);
      if (legacySaved) {
        const legacyMsgs: ChatMessage[] = JSON.parse(legacySaved);
        if (legacyMsgs.length > 0) {
          const firstQuery = legacyMsgs.find((m) => m.role === 'user')?.content || 'Percakapan Sebelumnya';
          const initialSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: firstQuery.slice(0, 45) + (firstQuery.length > 45 ? '...' : ''),
            updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            messages: legacyMsgs,
          };
          return [initialSession];
        }
      }
    } catch {
      // ignore parse error
    }
    return [];
  });

  // State current active session ID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      const savedSessions = localStorage.getItem(sessionsStorageKey);
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // Abaikan error parsing JSON saat inisialisasi state sesi
    }
    return null;
  });

  // User-selected model state
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const savedModel = localStorage.getItem(STORAGE_USER_MODEL_KEY);
      if (savedModel && MODEL_OPTIONS.some((m) => m.id === savedModel)) {
        return savedModel;
      }
    } catch {
      // Abaikan error pembacaan model dari localStorage
    }
    return 'gemini-3.5-flash-lite';
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Close model dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem(STORAGE_USER_MODEL_KEY, modelId);
    } catch {
      // Abaikan error penyimpanan model ke localStorage
    }
    setIsModelDropdownOpen(false);
  };

  const activeModelObj =
    MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  // Messages in active conversation
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedSessions = localStorage.getItem(sessionsStorageKey);
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        if (parsed.length > 0) return parsed[0].messages;
      }
      const legacySaved = localStorage.getItem(legacyStorageKey);
      if (legacySaved) return JSON.parse(legacySaved);
    } catch {
      // Abaikan error parsing JSON saat inisialisasi pesan
    }
    return [];
  });

  // Drawer History Open/Close State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal Konfirmasi Hapus Chat
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'current' | 'session';
    targetSessionId?: string;
  }>({
    isOpen: false,
    type: 'current',
  });

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const LOADING_STEPS = [
    'Membaca pertanyaanmu...',
    'Menelusuri pangkalan data alumni SMANTA...',
    'Menganalisis sebaran kampus & riwayat karir...',
    'Menyusun rekomendasi faktual dan terstruktur...',
  ];

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    try {
      localStorage.setItem(sessionsStorageKey, JSON.stringify(sessions));
    } catch {
      // Abaikan error saat kuota penyimpanan localStorage penuh
    }
  }, [sessions, sessionsStorageKey]);

  // Sync active messages with sessions state
  useEffect(() => {
    if (messages.length === 0) return;

    setSessions((prevSessions) => {
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 45) + (firstUserMsg.content.length > 45 ? '...' : '')
        : 'Percakapan Baru';
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      if (currentSessionId) {
        const exists = prevSessions.some((s) => s.id === currentSessionId);
        if (exists) {
          return prevSessions.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages, updatedAt: timeStr, title: s.title || title }
              : s
          );
        }
      }

      // If new session without ID yet
      const newId = currentSessionId || `session-${Date.now()}`;
      if (!currentSessionId) setCurrentSessionId(newId);
      const newSession: ChatSession = {
        id: newId,
        title,
        updatedAt: timeStr,
        messages,
      };
      return [newSession, ...prevSessions.filter((s) => s.id !== newId)];
    });
  }, [messages, currentSessionId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Loading indicator step cycle
  useEffect(() => {
    if (!loading) {
      setLoadingTextIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const studentPrompts = [
    'Kampus mana saja yang paling banyak dituju alumni SMANTA?',
    'Jurusan apa yang paling favorit dipilih alumni?',
    'Alumni SMANTA paling banyak bekerja di bidang apa?',
    'Bagaimana persebaran alumni yang lolos jalur SNBP dan SNBT?',
  ];

  const alumniPrompts = [
    'Perguruan tinggi mana saja yang paling banyak menjadi almamater alumni SMANTA?',
    'Apa saja bidang pekerjaan atau profesi yang paling banyak ditekuni alumni saat ini?',
    'Berapa banyak alumni SMANTA yang melanjutkan kuliah di UNS dan Undip?',
    'Bagaimana persebaran alumni berdasarkan angkatan kelulusan?',
  ];

  const adminPrompts = [
    'Bagaimana ringkasan rekapitulasi data tracer study alumni saat ini?',
    'Kampus mana saja yang paling mendominasi tujuan kuliah alumni SMANTA?',
    'Bagaimana statistik serapan kerja alumni dan bidang profesi terbanyak?',
    'Rekomendasi tindak lanjut monitoring pengisian kuesioner tracer study',
  ];

  const starterPrompts =
    activeRole === 'admin'
      ? adminPrompts
      : activeRole === 'alumni'
        ? alumniPrompts
        : studentPrompts;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await axios.post('/api/smart-match/chat', {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        message: textToSend,
        userRole: activeRole,
        selectedModel,
      }, {
        signal: controller.signal,
        timeout: 60000,
      });

      const { reply, citation, recommendations, followUpSuggestions } = response.data;

      const botMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply || 'Berikut adalah informasi berdasarkan data alumni SMANTA.',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        citation,
        recommendations,
        followUpSuggestions,
        isTyping: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      const errorMsg =
        err.response?.data?.message ||
        'Maaf, terjadi gangguan saat menghubungi asisten AI. Silakan coba lagi.';
      const errorMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Gagal memproses pesan**: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mulai Percakapan Baru (Reset current chat session)
  const handleNewConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setCurrentSessionId(`session-${Date.now()}`);
    setMessages([]);
    setInputQuery('');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Muat Sesi Tertentu dari Drawer Riwayat (Tampilkan langsung tanpa typewriter)
  const handleSelectSession = (session: ChatSession) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setCurrentSessionId(session.id);
    setMessages(session.messages.map((m) => ({ ...m, isTyping: false })));
    setIsHistoryOpen(false);
  };

  // Hapus Satu Sesi Spesifik dari Riwayat (Buka Modal Konfirmasi)
  const handleDeleteSession = (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      type: 'session',
      targetSessionId: sessionIdToDelete,
    });
  };

  // Bersihkan Percakapan Aktif (Buka Modal Konfirmasi)
  const handleClearCurrentChat = () => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'current',
    });
  };

  // Eksekusi Konfirmasi Hapus
  const handleConfirmDelete = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);

    if (deleteConfirmation.type === 'current') {
      const activeId = currentSessionId;
      const nextSessionId = `session-${Date.now()}`;

      setMessages([]);
      setCurrentSessionId(nextSessionId);
      setInputQuery('');

      setSessions((prev) => {
        const filtered = activeId ? prev.filter((s) => s.id !== activeId) : prev;
        try {
          localStorage.setItem(sessionsStorageKey, JSON.stringify(filtered));
        } catch {
          // Abaikan kegagalan sinkronisasi ke localStorage
        }
        return filtered;
      });

      try {
        localStorage.removeItem(legacyStorageKey);
      } catch {
        // Abaikan kegagalan penghapusan legacy key
      }
    } else if (deleteConfirmation.type === 'session' && deleteConfirmation.targetSessionId) {
      const sessionIdToDelete = deleteConfirmation.targetSessionId;
      const isDeletingActive = currentSessionId === sessionIdToDelete;
      const updated = sessions.filter((s) => s.id !== sessionIdToDelete);

      setSessions(updated);
      try {
        localStorage.setItem(sessionsStorageKey, JSON.stringify(updated));
      } catch {
        // Abaikan kegagalan sinkronisasi ke localStorage
      }

      if (isDeletingActive) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
          setMessages(updated[0].messages.map((m) => ({ ...m, isTyping: false })));
        } else {
          handleNewConversation();
        }
      }
    }
    setDeleteConfirmation({ isOpen: false, type: 'current' });
  };

  // Helper to render markdown-like simple syntax (bold, lists)
  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className='space-y-2 text-sm leading-relaxed text-[var(--text-primary)]'>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className='h-1.5' />;
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className='flex items-start gap-2 pl-1'>
                <span className='text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0' />
                <div>{parseBold(content)}</div>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className='flex items-start gap-2 pl-1'>
                <span className='font-semibold text-primary text-xs flex-shrink-0 mt-0.5'>
                  {numMatch[1]}.
                </span>
                <div>{parseBold(numMatch[2])}</div>
              </div>
            );
          }

          // Heading 2/3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className='font-bold text-sm text-[var(--text-primary)] mt-3 mb-1'>
                {parseBold(trimmed.substring(4))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className='font-bold text-base text-[var(--text-primary)] mt-3.5 mb-1'>
                {parseBold(trimmed.substring(3))}
              </h3>
            );
          }

          return <p key={idx}>{parseBold(line)}</p>;
        })}
      </div>
    );
  };

  const parseBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className='font-bold text-[var(--text-primary)]'>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`relative flex flex-col h-full max-h-screen ${isFullScreen
        ? 'h-screen rounded-none border-0'
        : 'h-[750px] max-h-[85vh] rounded-2xl border border-[var(--border-color)]'
        } bg-[var(--bg-card)] shadow-sm overflow-hidden overflow-x-hidden ${className}`}
    >
      {/* Top Fixed / Sticky Navigation Bar: Model Selector (Kiri) & Tombol Aksi (Kanan) */}
      <div className='shrink-0 h-14 bg-white pl-11 pr-2.5 sm:px-6 md:px-8 flex items-center justify-between gap-1.5 sm:gap-3 z-20 border-b border-slate-100 min-w-0'>
        {/* Sisi Kiri: Model Selector Popover */}
        <div className='relative min-w-0' ref={modelDropdownRef}>
          <button
            type='button'
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className='inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] sm:text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer whitespace-nowrap'
            title='Pilih Model AI'
          >
            <span className='w-2 h-2 rounded-full bg-blue-600 shrink-0' />
            <span className='max-w-[90px] xs:max-w-[110px] sm:max-w-[180px] truncate text-slate-800 text-[11px] sm:text-xs'>
              {activeModelObj.name}
            </span>
            <FaChevronDown
              className={`text-[9px] sm:text-[10px] text-slate-400 transition-transform duration-200 shrink-0 ${
                isModelDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isModelDropdownOpen && (
            <div className='absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-32px)] bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-30 animate-fade-in'>
              <div className='mb-3'>
                <h4 className='text-xs font-bold uppercase tracking-wider text-slate-900'>
                  PILIHAN MODEL AI
                </h4>
                <p className='text-[11px] text-slate-500 mt-0.5 leading-snug'>
                  Pilih model cerdas sesuai kebutuhan atau saat kuota model utama terbatas
                </p>
              </div>

              <div className='space-y-1.5'>
                {MODEL_OPTIONS.map((opt) => {
                  const isSelected = opt.id === selectedModel;
                  return (
                    <button
                      key={opt.id}
                      type='button'
                      onClick={() => handleSelectModel(opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 text-blue-950'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {opt.name}
                          </span>
                          {opt.tag && (
                            <span className='px-1.5 py-0.2 text-[9px] font-semibold bg-blue-100 text-blue-700 rounded-md'>
                              {opt.tag}
                            </span>
                          )}
                        </div>
                        <p className='text-[11px] text-slate-500 mt-0.5 leading-normal'>
                          {opt.desc}
                        </p>
                      </div>

                      {/* Radio / Checkmark Icon */}
                      <div className='mt-0.5 shrink-0'>
                        {isSelected ? (
                          <div className='w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white'>
                            <FaCheck className='text-[8px]' />
                          </div>
                        ) : (
                          <div className='w-4 h-4 rounded-full border border-slate-300' />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sisi Kanan: Aksi Chat */}
        <div className='flex items-center gap-1.5 sm:gap-2.5 shrink-0'>
          {/* Tombol 1: + Percakapan Baru (Pill Clean) */}
          <button
            type='button'
            onClick={handleNewConversation}
            className='inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-[11px] sm:text-sm font-medium shadow-2xs hover:border-slate-300 transition-all cursor-pointer whitespace-nowrap'
            title='Mulai Percakapan Baru'
          >
            <FaPlus className='text-[10px] sm:text-xs text-blue-600 shrink-0' />
            <span className='hidden sm:inline whitespace-nowrap'>Percakapan Baru</span>
            <span className='sm:hidden inline whitespace-nowrap text-[11px]'>Baru</span>
          </button>

          {/* Tombol 2: History (Icon Jam / Clock) */}
          <button
            type='button'
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 sm:p-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${isHistoryOpen
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            title='Riwayat Percakapan'
            aria-label='Riwayat Percakapan'
          >
            <FaHistory className='text-xs sm:text-sm' />
          </button>

          {/* Tombol 3: Delete (Tempat Sampah) */}
          <button
            type='button'
            onClick={handleClearCurrentChat}
            className='p-1.5 sm:p-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all cursor-pointer flex items-center justify-center shrink-0'
            title='Hapus percakapan aktif'
            aria-label='Hapus percakapan aktif'
          >
            <FaTrashAlt className='text-xs sm:text-sm' />
          </button>
        </div>
      </div>

      {/* 2 & 3 Message Stream Area (flex-1 min-h-0 overflow-y-auto tanpa scrollbar saat kosong) */}
      <div
        className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6 flex flex-col bg-gradient-to-b from-transparent via-transparent to-[var(--bg-secondary)]/30'
        aria-live='polite'
      >
        <div className={`max-w-2xl md:max-w-3xl mx-auto w-full ${messages.length === 0 ? 'my-auto flex flex-col items-center justify-center' : 'space-y-6'}`}>
          {messages.length === 0 ? (
            /* 3.2 Starter Screen & Prompt Pills (Tepat Center Vertikal & Horizontal, Tanpa Memicu Scroll) */
            <div className='flex flex-col items-center justify-center text-center max-w-xl mx-auto py-2 animate-fade-in'>
              <div className='w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-2xl mb-3 shadow-sm border border-blue-600/20'>
                <FaRobot />
              </div>
              <h4 className='text-base md:text-lg font-bold text-[var(--text-primary)] mb-1.5'>
                Halo, {user?.profile?.fullName || (activeRole === 'admin' ? 'Administrator' : 'Siswa SMANTA')}!
              </h4>
              <p className='text-xs md:text-sm text-[var(--text-secondary)] mb-5 max-w-md'>
                {activeRole === 'admin'
                  ? 'Pusat asisten cerdas untuk rekapitulasi data tracer study, sebaran kampus, analisis statistik pekerjaan, dan monitoring sekolah.'
                  : activeRole === 'alumni'
                    ? 'Konsultasikan info sebaran alumni SMANTA, koneksi profesi/industri, atau peluang mentoring bersama rekan seangkatan.'
                    : 'Punya pertanyaan seputar pemilihan kampus, peluang jurusan, jalur masuk SNBP/SNBT, atau karir alumni? Tanyakan langsung disini.'}
              </p>

              <div className='w-full text-left space-y-2'>
                <div className='text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-1'>
                  Contoh Pertanyaan yang Sering Diajukan:
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => handleSendMessage(prompt)}
                      className='text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium group shadow-2xs cursor-pointer'
                    >
                      <span className='line-clamp-2 leading-relaxed'>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className='space-y-2'>
                {msg.role === 'user' ? (
                  /* 3.3.A User Message */
                  <div className='flex justify-end'>
                    <div className='max-w-[85%] md:max-w-[70%]'>
                      <div className='bg-[var(--primary)] text-white rounded-2xl rounded-tr-xs p-3.5 md:p-4 shadow-sm text-sm md:text-base leading-relaxed'>
                        {msg.content}
                      </div>
                      <div className='text-[10px] text-[var(--text-tertiary)] text-right mt-1 px-1'>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3.3.B AI Assistant Message (Rata Kiri Presisi Tegak Lurus dengan Field Input, Bersih Tanpa Header/Icon) */
                  <div className='w-full pl-0 space-y-2'>
                    <div className='w-full pl-0'>
                      <div className='bg-transparent text-[var(--text-primary)] border-0 p-0 space-y-3.5'>
                        {/* Markdown reply content with Typewriter Streaming Effect */}
                        <TypewriterMessage
                          content={msg.content}
                          isTyping={msg.isTyping}
                          onDoneTyping={() => {
                            setMessages((prev) =>
                              prev.map((m) => (m.id === msg.id ? { ...m, isTyping: false } : m))
                            );
                          }}
                          onTick={() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          renderMarkdown={renderMarkdownText}
                        />
                      </div>

                      <div className='text-[10px] text-[var(--text-tertiary)] mt-1.5'>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* 3.5 AI Thinking State (Bersih Rata Kiri Tanpa Header) */}
          {loading && (
            <div className='w-full pl-0 animate-fade-in py-1'>
              <div className='flex items-center gap-2.5'>
                <div className='flex items-center space-x-1.5 flex-shrink-0'>
                  <span className='w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce' />
                  <span className='w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce [animation-delay:0.2s]' />
                  <span className='w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-bounce [animation-delay:0.4s]' />
                </div>
                <span className='text-xs text-[var(--text-secondary)] font-medium leading-none'>
                  {LOADING_STEPS[loadingTextIndex]}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3.6 Bottom Input Bar (Ramping & Terpusat seperti ChatGPT / Gemini, Seamless Tanpa Border Atas) */}
      <div className='px-4 py-3 md:px-6 md:py-4 border-0 bg-[var(--bg-card)] sticky bottom-0 z-10'>
        <div className='max-w-2xl md:max-w-3xl mx-auto w-full'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className='flex items-center gap-2'
          >
            <div className='relative flex-1'>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeRole === 'admin'
                    ? 'Tanyakan rekapitulasi data tracer study, sebaran kampus, serapan kerja...'
                    : activeRole === 'alumni'
                      ? 'Tanyakan seputar rekan alumni, karir, industri...'
                      : 'Tanyakan seputar jurusan, kampus, karir...'
                }
                disabled={loading}
                className='w-full resize-none min-h-[46px] max-h-28 rounded-2xl !bg-white text-slate-800 placeholder:text-slate-400 placeholder:truncate border border-slate-200 px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-slate-300 shadow-xs transition-all disabled:opacity-50 overflow-hidden leading-normal'
              />
            </div>

            <button
              type='submit'
              disabled={!inputQuery.trim() || loading}
              aria-label='Kirim pertanyaan'
              className='w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex-shrink-0 shadow-sm cursor-pointer'
            >
              <FaPaperPlane className='text-sm' />
            </button>
          </form>

          <p className='text-[10px] text-[var(--text-tertiary)] text-center mt-2'>
            SMANTA AI menyajikan wawasan berbasis data historis alumni Tracer Study.
          </p>
        </div>
      </div>

      {/* Drawer Riwayat Percakapan (Slide-over dari kanan dengan transisi halus) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-visibility duration-300 ${isHistoryOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
      >
        {/* Backdrop gelap transparan / blur dengan fade transition */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${isHistoryOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsHistoryOpen(false)}
        />

        <div className='fixed inset-y-0 right-0 max-w-full flex'>
          <div
            className={`w-[85vw] sm:w-80 md:w-96 max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            {/* Header Drawer */}
            <div className='px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0'>
              <div className='min-w-0 flex-1 mr-2'>
                <h3 className='text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 truncate'>
                  <FaHistory className='text-blue-600 text-sm shrink-0' />
                  <span className='truncate'>Riwayat Percakapan</span>
                </h3>
                <p className='text-[11px] text-slate-500 mt-0.5 truncate'>
                  Pilih percakapan untuk dilanjutkan
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsHistoryOpen(false)}
                className='p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0'
                aria-label='Tutup drawer'
              >
                <FaTimes className='text-sm' />
              </button>
            </div>

            {/* Isi Drawer: Daftar Sesi Percakapan */}
            <div className='flex-1 overflow-y-auto p-3 sm:p-4 space-y-2'>
              {sessions.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-64 text-center p-4 text-slate-400'>
                  <div className='w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3'>
                    <FaRegCommentDots className='text-xl' />
                  </div>
                  <p className='text-xs font-semibold text-slate-600'>Belum Ada Riwayat Obrolan</p>
                  <p className='text-[11px] text-slate-400 mt-1 max-w-[200px]'>
                    Mulai konsultasi dengan asisten AI untuk menyimpan percakapan.
                  </p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`group relative flex items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${isActive
                        ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-2xs'
                        : 'bg-white border-slate-200/70 hover:border-blue-200 hover:bg-slate-50/80 text-slate-700'
                        }`}
                    >
                      <div className='flex items-start gap-2.5 min-w-0 flex-1'>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs mt-0.5 ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}
                        >
                          <FaRegCommentDots />
                        </div>
                        <div className='min-w-0 flex-1 overflow-hidden'>
                          <h4 className='text-xs font-semibold truncate leading-tight'>
                            {session.title || 'Percakapan Tanpa Judul'}
                          </h4>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-[10px] text-slate-400 shrink-0'>
                              {session.updatedAt}
                            </span>
                            <span className='text-[10px] text-slate-300'>•</span>
                            <span className='text-[10px] text-slate-400 truncate'>
                              {session.messages.length} pesan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Hapus per Item */}
                      <button
                        type='button'
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className='p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100 shrink-0'
                        title='Hapus sesi ini'
                        aria-label='Hapus sesi ini'
                      >
                        <FaTrashAlt className='text-xs' />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Drawer: Tombol Percakapan Baru */}
            <div className='p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0'>
              <button
                type='button'
                onClick={() => {
                  handleNewConversation();
                  setIsHistoryOpen(false);
                }}
                className='w-full py-2.5 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer'
              >
                <FaPlus className='text-xs' />
                <span>Mulai Percakapan Baru</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog Konfirmasi Hapus Chat (Tema Putih Bersih) */}
      {deleteConfirmation.isOpen &&
        createPortal(
          <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in'>
            <div className='bg-white border border-slate-100 shadow-xl rounded-2xl max-w-sm w-full p-6 space-y-5'>
              <div className='flex items-start gap-3.5'>
                <div className='w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5'>
                  <FaTrashAlt className='text-base' />
                </div>
                <div>
                  <h4 className='text-base font-semibold text-slate-900'>
                    Hapus Percakapan?
                  </h4>
                  <p className='text-sm text-slate-600 mt-1 leading-relaxed'>
                    Pesan dalam percakapan ini akan dihapus dan tidak dapat dikembalikan.
                  </p>
                </div>
              </div>

              <div className='flex items-center justify-end gap-3 pt-1'>
                <button
                  type='button'
                  onClick={() => setDeleteConfirmation({ isOpen: false, type: 'current' })}
                  className='bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm'
                >
                  Batal
                </button>
                <button
                  type='button'
                  onClick={handleConfirmDelete}
                  className='bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer text-sm'
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SmartMatchChat;
