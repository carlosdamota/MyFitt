import React, { useState } from "react";
import { Mail, Lock, LogIn, UserPlus, Chrome } from "lucide-react";
import Modal from "../common/Modal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (): Promise<void> => {
    if (!email || !password) {
      setError("Completa email y contraseña.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      onSuccess();
    } catch (e) {
      setError("No se pudo completar el acceso.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (e) {
      setError("No se pudo iniciar sesión con Google.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      className='max-w-md mx-auto'
    >
        <div className='space-y-4 text-slate-200'>
          <div className='flex gap-2'>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "signup"
                  ? "bg-amber-400 text-slate-900"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className='w-full py-3 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 transition-all'
          >
            <Chrome size={16} /> Continuar con Google
          </button>

          <div className='relative flex items-center'>
            <div className='flex-1 h-px bg-slate-800' />
            <span className='px-3 text-[10px] text-slate-400 uppercase tracking-widest'>o</span>
            <div className='flex-1 h-px bg-slate-800' />
          </div>

          <div className='space-y-3'>
            <label className='block text-xs text-slate-300 font-semibold'>Email</label>
            <div className='flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 focus-within:border-cyan-400/60'>
              <Mail size={14} className='text-slate-400' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                placeholder='tu@email.com'
              />
            </div>

            <label className='block text-xs text-slate-300 font-semibold'>Contraseña</label>
            <div className='flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 focus-within:border-cyan-400/60'>
              <Lock size={14} className='text-slate-400' />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                placeholder='••••••••'
              />
            </div>
          </div>

          {error && <p className='text-xs text-red-300 font-semibold'>{error}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className='w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center gap-2 transition-all'
          >
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {mode === "login" ? "Entrar con email" : "Crear cuenta"}
          </button>
        </div>
    </Modal>
  );
};

export default AuthModal;
