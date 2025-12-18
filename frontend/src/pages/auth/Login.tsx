import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaGraduationCap, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

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
      // Auth context usually handles the state, but we can verify role navigation here if needed
      // Force a slight delay to ensure local storage is updated or context is refreshed if necessary in some implementations
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

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
    <div className='flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)] p-4 relative overflow-hidden'>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--primary)] opacity-10 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
      </div>

      <div className='w-full max-w-md z-10 animate-fade-in'>
        <div className='overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-2xl backdrop-blur-sm'>
          {/* Header */}
          <div className='bg-[color:var(--bg-tertiary)]/30 p-8 text-center border-b border-[color:var(--border-color)]'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-blue-400 text-white shadow-lg shadow-blue-500/30'>
              <FaGraduationCap className='text-3xl' />
            </div>
            <h1 className='text-2xl font-bold text-[color:var(--text-primary)]'>Selamat Datang Kembali</h1>
            <p className='mt-2 text-sm text-[color:var(--text-secondary)]'>Masuk ke akun Tracer Study SMANTA Anda</p>
          </div>

          <div className='p-8'>
            {error && (
              <div className='mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400'>
                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className="space-y-1.5">
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]">
                    <FaUser />
                  </div>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder='Masukkan username'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>Password</label>
                <div className='relative'>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder='Masukkan password'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-12 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-0 top-0 h-full px-3 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full transform rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-500 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Masuk...
                  </span>
                ) : 'Masuk'}
              </button>
            </form>

            <div className='mt-8 text-center'>
              <p className='text-sm text-[color:var(--text-tertiary)]'>
                Belum punya akun?{' '}
                <Link
                  to='/register'
                  className='font-semibold text-[color:var(--primary)] transition-colors hover:text-blue-400'
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[color:var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
        </p>
      </div>
    </div>
  );
};

export default Login;
