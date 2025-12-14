import { FaBell } from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';
import React, { SetStateAction } from 'react';

interface UnreadNewsItem {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NotificationsProps {
  notificationRef: React.RefObject<HTMLDivElement>;
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<SetStateAction<boolean>>;
  unreadNewsCount: number;
  unreadNews: UnreadNewsItem[];
  handleNewsClick: (id: string) => void;
}

const Notifications = ({
  notificationRef,
  isNotificationOpen,
  setIsNotificationOpen,
  unreadNewsCount,
  unreadNews,
  handleNewsClick,
}: NotificationsProps) => {
  return (
    <>
      <div ref={notificationRef} className='relative h-fit'>
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaBell
            size={20}
            color={unreadNewsCount > 0 ? '#f59e0b' : 'var(--text-primary)'}
          />
          {unreadNewsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5px',
                fontWeight: '600',
              }}
            >
              {unreadNewsCount > 9 ? '9+' : unreadNewsCount}
            </span>
          )}
        </button>

        {isNotificationOpen && (
          <div
            className='notification-dropdown'
            style={{
              position: 'fixed',
              top: '45px',
              right: '0px',
              left: 'auto',
              marginTop: '0px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              minWidth: '280px',
              maxWidth: 'calc(100vw - 32px)',
              width: '300px',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: 'var(--bg-card)',
                zIndex: 1001,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}
              >
                Notifikasi
              </h3>
              {unreadNewsCount > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {unreadNewsCount} baru
                </span>
              )}
            </div>
            <div>
              {unreadNews.length === 0 ? (
                <div
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Tidak ada notifikasi baru
                </div>
              ) : (
                unreadNews.map((newsItem) => (
                  <div
                    key={newsItem._id}
                    onClick={() => handleNewsClick(newsItem._id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 8px 0',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      {newsItem.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stripHtml(newsItem.content).substring(0, 100)}...
                    </p>
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {new Date(newsItem.createdAt).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;
