import React, { useState } from 'react';
import { authApi } from '../../services/api';
import brandLogo from '../../assets/logo.png';

interface AuthPageProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(() =>
    typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#register'
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok.');
        return;
      }
      if (!agreeTerms) {
        setErrorMessage('Anda harus menyetujui syarat & ketentuan.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Email dan password wajib diisi.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        const res = await authApi.register(name.trim(), email.trim(), password);
        setIsLoading(false);
        onLoginSuccess(res.user);
      } else {
        const res = await authApi.login(email.trim(), password);
        setIsLoading(false);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Gagal terhubung ke server backend');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-body-md text-on-surface select-none">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      {/* Centered Auth Card (Only Form) */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container/70 p-7 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
            <img
              alt="LOKER Brand Logo"
              className="h-full w-full object-cover"
              src={brandLogo}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="font-headline-sm text-lg font-bold text-primary tracking-tight">
              {isRegister ? 'Buat Akun LOKER' : 'Masuk ke LOKER'}
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {isRegister
                ? 'Daftar untuk mulai melacak lamaran kerja Anda'
                : 'Kelola dan pantau seluruh status lamaran kerja Anda'}
            </p>
          </div>
        </div>


        {/* Error Banner */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-error-container/60 text-on-error-container text-xs flex items-center gap-2 border border-error/20 animate-in fade-in">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMessage}</span>
          </div>
        )}


        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-outline uppercase">
                Nama Lengkap *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-outline text-base">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-outline uppercase">
              Email Akun *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-outline text-base">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-outline uppercase">
                Password *
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => alert('Tautan reset password telah dikirim ke email demo Anda.')}
                  className="text-[11px] text-secondary hover:underline"
                >
                  Lupa password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-outline text-base">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-surface-container-low rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 text-outline hover:text-on-surface flex items-center"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-outline uppercase">
                Konfirmasi Password *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-outline text-base">
                  lock_reset
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="pt-0.5">
            {isRegister ? (
              <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-surface-container text-secondary focus:ring-secondary"
                />
                <span>
                  Saya menyetujui{' '}
                  <span className="text-secondary underline">Syarat &amp; Ketentuan</span> LOKER.
                </span>
              </label>
            ) : (
              <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-surface-container text-secondary focus:ring-secondary"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-2 px-4 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-headline-sm text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  {isRegister ? 'person_add' : 'login'}
                </span>
                <span>{isRegister ? 'Daftar Akun Baru' : 'Masuk ke Dashboard'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="pt-3 border-t border-surface-container text-center text-xs text-on-surface-variant">
          {isRegister ? (
            <span>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage('');
                  if (typeof window !== 'undefined') window.location.hash = '#login';
                }}
                className="text-secondary font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </span>
          ) : (
            <span>
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage('');
                  if (typeof window !== 'undefined') window.location.hash = '#register';
                }}
                className="text-secondary font-semibold hover:underline"
              >
                Daftar sekarang
              </button>
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
