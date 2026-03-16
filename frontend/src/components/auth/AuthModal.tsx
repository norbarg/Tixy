//auth/AuthModal.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './auth.css';

type TabType = 'login' | 'register';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('login');

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
            type="button"
          >
            Create Account
          </button>

          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Log in
          </button>

          <span
            className={`auth-tab-indicator ${
              activeTab === 'login' ? 'is-login' : 'is-register'
            }`}
          />
        </div>

        <div className="auth-content">
          <div
            className={`auth-fade-panel ${
              activeTab === 'login' ? 'auth-fade-panel--active' : ''
            }`}
          >
            {activeTab === 'login' && <LoginForm />}
          </div>

          <div
            className={`auth-fade-panel ${
              activeTab === 'register' ? 'auth-fade-panel--active' : ''
            }`}
          >
            {activeTab === 'register' && <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
