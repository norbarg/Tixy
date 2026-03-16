//auth/RegisterForm.tsx
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { GoogleButton } from './GoogleButton';
import arrowRight from '../../assets/arrow.png';

export function RegisterForm() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [focusedField, setFocusedField] = useState<
    'login' | 'email' | 'password' | 'confirmPassword' | null
  >(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: 'login' | 'email' | 'password' | 'confirmPassword') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError('');
    };

  const validate = () => {
    if (!form.login.trim()) return 'Enter login';
    if (form.login.length < 3) return 'Login must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.login)) {
      return 'Login can contain only letters, numbers and underscore';
    }

    if (!form.email.trim()) return 'Enter email';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter valid email';

    if (!form.password.trim()) return 'Enter password';
    if (form.password.length < 6) return 'Password must be at least 6 characters';

    if (!form.confirmPassword.trim()) return 'Confirm your password';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await register({
        login: form.login,
        email: form.email,
        password: form.password,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
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
          focusedField === 'login' || form.login ? 'auth-field--active' : ''
        }`}
      >
        <label className="auth-floating-label">Login</label>
        <input
          type="text"
          value={form.login}
          onChange={handleChange('login')}
          onFocus={() => setFocusedField('login')}
          onBlur={() => setFocusedField(null)}
          placeholder="Login"
        />
      </div>

      <div
        className={`auth-field ${
          focusedField === 'email' || form.email ? 'auth-field--active' : ''
        }`}
      >
        <label className="auth-floating-label">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          placeholder="Email"
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

      <div
        className={`auth-field ${
          focusedField === 'confirmPassword' || form.confirmPassword
            ? 'auth-field--active'
            : ''
        }`}
      >
        <label className="auth-floating-label">Confirm Password</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField(null)}
          placeholder="Confirm Password"
        />
      </div>

      {error ? <p className="auth-error">{error}</p> : null}

      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? (
          'Loading...'
        ) : (
          <>
            <span className="auth-submit-btn__text">Create</span>
            <img src={arrowRight} alt="" className="auth-submit-btn__icon" />
          </>
        )}
      </button>
    </form>
  );
}
