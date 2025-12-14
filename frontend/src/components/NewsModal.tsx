import React from 'react';

interface NewsModalProps {
  news: any;
  isOpen: boolean;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, isOpen, onClose }) => {
  if (!isOpen || !news) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '800px',
          width: '100%',
          margin: '20px auto',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700', margin: 0 }}>
            {news.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '20px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
          >
            ×
          </button>
        </div>
        
        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            {news.author?.username}
          </span>
          {' • '}
          {new Date(news.createdAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        <div
          style={{
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {news.content}
        </div>
      </div>
    </div>
  );
};

export default NewsModal;

