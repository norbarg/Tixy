//auth/LoginForm.tsx
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { GoogleButton } from './GoogleButton';
import arrowRight from '../../assets/arrow.png';

export function LoginForm() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    loginOrEmail: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState<
    'loginOrEmail' | 'password' | null
  >(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: 'loginOrEmail' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError('');
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.loginOrEmail.trim()) {
      setError('Enter email or login');
      return;
    }

    if (!form.password.trim()) {
      setError('Enter password');
      return;
    }

    try {
      setLoading(true);
      await login(form);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <GoogleButton />

      <div className="auth-divider">OR</div>

      <div
        className={`auth-field ${
          focusedField === 'loginOrEmail' || form.loginOrEmail
            ? 'auth-field--active'
            : ''
        }`}
      >
        <label className="auth-floating-label">Email/Login</label>
        <input
          type="text"
          value={form.loginOrEmail}
          onChange={handleChange('loginOrEmail')}
          onFocus={() => setFocusedField('loginOrEmail')}
          onBlur={() => setFocusedField(null)}
          placeholder="Email/Login"
        />
      </div>

      <div
        className={`auth-field ${
          focusedField === 'password' || form.password ? 'auth-field--active' : ''
        }`}
      >
        <label className="auth-floating-label">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          placeholder="Password"
        />
      </div>

      {error ? <p className="auth-error">{error}</p> : null}

      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? (
          'Loading...'
        ) : (
          <>
            <span className="auth-submit-btn__text">Log In</span>
            <img src={arrowRight} alt="" className="auth-submit-btn__icon" />
          </>
        )}
      </button>
    </form>
  );
}
