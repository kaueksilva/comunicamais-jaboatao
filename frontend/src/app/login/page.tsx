'use client';

import React, { useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const { theme, toggle }       = useTheme();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/auth/ad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string; firebaseCustomToken?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Falha na autenticação via AD.');
      }

      if (!payload.firebaseCustomToken) {
        throw new Error('O servidor de autenticação não retornou um token válido.');
      }

      await signInWithCustomToken(auth, payload.firebaseCustomToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string; message?: string })?.code ?? '';
      const message = (err as { message?: string })?.message;

      if (['auth/invalid-custom-token', 'auth/custom-token-mismatch'].includes(code)) {
        setError('Token de autenticação inválido. Verifique a configuração do backend.');
      } else if (message) {
        setError(message);
      } else {
        setError('Erro de conexão. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      {/* Faixa Superior de Identidade Jaboatão */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-brand-gold z-50" />
      <div className="fixed top-[1.5px] left-0 w-full h-1.5 bg-brand-green z-50" />

      {/* Theme Toggle Floating */}
      <button
        onClick={toggle}
        className="fixed top-8 right-8 p-3 bg-[var(--surface)] border-2 border-brand-blue text-brand-blue shadow-brutal-sm shadow-brand-blue hover:shadow-none transition-all"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md animate-fade-up">
        
        {/* Logo/Branding Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brand-blue flex items-center justify-center shadow-brutal-md shadow-brand-gold mb-6">
            <span className="font-display font-extrabold text-white text-3xl">C+</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-brand-blue-text tracking-tighter uppercase">
            COMUNICA<span className="text-brand-gold">+</span>
          </h1>
          <p className="text-[10px] font-bold text-brand-green uppercase tracking-[0.3em] mt-1">
            Prefeitura do Jaboatão dos Guararapes
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--surface)] border-4 border-brand-blue p-8 shadow-brutal-xl shadow-brand-blue relative">
          
          <div className="absolute top-0 right-0 py-1 px-3 bg-brand-blue text-white font-display font-bold text-[10px] uppercase tracking-widest">
            Acesso Restrito
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-display font-bold text-xs uppercase tracking-widest text-brand-blue-text/60">
                E-mail Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border-2 border-brand-blue/20 p-4 font-sans text-sm focus:border-brand-blue outline-none transition-all placeholder:opacity-30"
                placeholder="exemplo@jaboatao.pe.gov.br"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-display font-bold text-xs uppercase tracking-widest text-brand-blue-text/60">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg)] border-2 border-brand-blue/20 p-4 font-sans text-sm focus:border-brand-blue outline-none transition-all placeholder:opacity-30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue/40 hover:text-brand-blue"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-brand-red/5 border-l-4 border-brand-red p-4 text-brand-red">
                <AlertCircle size={18} />
                <p className="font-sans text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white py-5 font-display font-bold text-sm uppercase tracking-widest shadow-brutal-md shadow-brand-gold hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verificando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-blue/10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-brand-green font-bold text-[9px] uppercase tracking-widest">
              <ShieldCheck size={14} />
              Ambiente de Navegação Seguro
            </div>
            <p className="text-[10px] text-center text-brand-blue-text/40 font-sans px-4">
              Primeiro acesso? Procure o setor de TI da sua secretaria para cadastramento institucional.
            </p>
          </div>
        </div>

        {/* Footer Identity */}
        <p className="mt-8 text-center text-[10px] font-bold text-brand-blue-text/30 uppercase tracking-[0.2em]">
          Prefeitura Municipal do Jaboatão dos Guararapes — 2025
        </p>
      </div>
    </main>
  );
}
