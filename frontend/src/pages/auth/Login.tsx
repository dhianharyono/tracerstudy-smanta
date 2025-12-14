import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user.role === 'alumni') {
        navigate('/alumni');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'student') {
        navigate('/student');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-[color:var(--bg-primary)]'>
      <div className='w-full max-w-md rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-8 shadow-2xl'>
        <div className='mb-8 text-center'>
          <div className='mb-4 text-6xl'>🎓</div>
          <h1 className='mb-2 text-3xl font-bold text-[color:var(--text-primary)]'>
            Login
          </h1>
          <p className='text-[color:var(--text-tertiary)]'>
            Tracer Study SMANTA
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-semibold text-[color:var(--text-secondary)]'>
              Username
            </label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder='Masukkan username Anda'
              className='w-full rounded-lg border-2 border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] px-4 py-3 text-[color:var(--text-primary)] transition-all placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[color:var(--primary)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-semibold text-[color:var(--text-secondary)]'>
              Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='Masukkan password Anda'
                className='w-full rounded-lg border-2 border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] px-4 py-3 pr-12 text-[color:var(--text-primary)] transition-all placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[color:var(--primary)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)] transition-colors focus:outline-none'
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                    />
                  </svg>
                ) : (
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className='flex items-center gap-2 rounded-lg border-2 border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] px-4 py-3 text-[#ef4444]'>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg px-4 py-3 font-semibold text-white transition-all enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%)',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='mt-6 text-center text-[color:var(--text-tertiary)]'>
          Don't have an account?{' '}
          <Link
            to='/register'
            className='font-semibold text-[color:var(--primary)] transition-colors'
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
