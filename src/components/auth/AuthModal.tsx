import React, { useState } from "react";
import { Mail, Lock, LogIn, UserPlus, Chrome, ArrowLeft, KeyRound } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import Modal from "../common/Modal";
import { mainLogo } from "../../branding/logoConfig";

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
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const handleForgotPassword = async (): Promise<void> => {
    if (!email) {
      setError("Introduce tu email para recuperar la contraseña.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
      }
      setResetSent(true);
    } catch (e: any) {
      if (e?.code === "auth/user-not-found") {
        setError("No existe una cuenta con ese email.");
      } else if (e?.code === "auth/invalid-email") {
        setError("El email no es válido.");
      } else {
        setError("No se pudo enviar el email. Inténtalo de nuevo.");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "forgot") return "Recuperar contraseña";
    return mode === "login" ? "Iniciar sesión" : "Crear cuenta";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      className='max-w-md mx-auto'
    >
      <div className='space-y-4 text-slate-200'>
        <div className='flex justify-center'>
          <img
            src={mainLogo.src}
            alt={mainLogo.alt}
            className='h-12 w-12 rounded-2xl border border-surface-700/70 bg-surface-900/80 p-1.5 object-contain'
          />
        </div>
        {/* ─── Forgot Password View ─── */}
        {mode === "forgot" ? (
          <>
            <button
              onClick={() => {
                setMode("login");
                setResetSent(false);
                setError(null);
              }}
              className='flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors'
            >
              <ArrowLeft size={12} /> Volver al login
            </button>

            {resetSent ? (
              <div className='text-center space-y-3 py-4'>
                <div className='w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center'>
                  <Mail
                    size={20}
                    className='text-emerald-400'
                  />
                </div>
                <p className='text-sm text-slate-200 font-semibold'>¡Email enviado!</p>
                <p className='text-xs text-slate-400'>
                  Revisa tu bandeja de entrada en <strong className='text-white'>{email}</strong>.
                  <br />
                  Sigue el enlace para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => {
                    setMode("login");
                    setResetSent(false);
                  }}
                  className='text-xs text-cyan-400 hover:text-cyan-300 font-semibold'
                >
                  Volver al login
                </button>
              </div>
            ) : (
              <>
                <p className='text-xs text-slate-400'>
                  Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div>
                  <label className='block text-xs text-slate-300 font-semibold'>Email</label>
                  <div className='flex items-center gap-2 bg-surface-900 border border-surface-700/80 rounded-xl px-3 py-2 focus-within:border-cyan-400/60 mt-1'>
                    <Mail
                      size={14}
                      className='text-slate-400'
                    />
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                      placeholder='tu@email.com'
                      onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    />
                  </div>
                </div>

                {error && <p className='text-xs text-red-300 font-semibold'>{error}</p>}

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className='w-full py-3 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 flex items-center justify-center gap-2 transition-all disabled:opacity-50'
                >
                  <KeyRound size={16} />
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </>
            )}
          </>
        ) : (
          /* ─── Login / Signup View ─── */
          <>
            <div className='flex gap-2'>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === "login"
                    ? "bg-cyan-500 text-slate-900"
                    : "bg-surface-800 text-slate-200 hover:bg-surface-700"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === "signup"
                    ? "bg-amber-400 text-slate-900"
                    : "bg-surface-800 text-slate-200 hover:bg-surface-700"
                }`}
              >
                Crear cuenta
              </button>
            </div>

            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='block text-xs text-slate-300 font-bold ml-1 uppercase tracking-wider'>
                  Email
                </label>
                <div className='flex items-center gap-2 bg-surface-950 border border-surface-700/80 rounded-xl px-4 py-3 focus-within:border-cyan-400 mt-1 transition-all shadow-inner'>
                  <Mail
                    size={16}
                    className='text-slate-500'
                  />
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                    placeholder='tu@email.com'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-xs text-slate-300 font-bold ml-1 uppercase tracking-wider'>
                  Contraseña
                </label>
                <div className='flex items-center gap-2 bg-surface-950 border border-surface-700/80 rounded-xl px-4 py-3 focus-within:border-cyan-400 mt-1 transition-all shadow-inner'>
                  <Lock
                    size={16}
                    className='text-slate-500'
                  />
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                    placeholder='••••••••'
                    onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                  />
                </div>
              </div>
            </div>

            {/* Forgot password link (only in login mode) */}
            {mode === "login" && (
              <div className='flex justify-end'>
                <button
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                  }}
                  className='text-[11px] text-slate-400 hover:text-cyan-400 transition-colors font-semibold'
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Checkbox for Signup Mode */}
            {mode === "signup" && (
              <div className='flex items-start gap-2 bg-surface-950/50 p-3 rounded-xl border border-surface-800/50'>
                <input
                  type='checkbox'
                  id='terms'
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className='mt-1 w-4 h-4 rounded border-surface-700 bg-surface-900 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer'
                />
                <label
                  htmlFor='terms'
                  className='text-[10px] text-slate-400 leading-normal cursor-pointer'
                >
                  Al crear una cuenta, acepto la{" "}
                  <a
                    href='/privacy'
                    target='_blank'
                    className='text-cyan-400 hover:text-cyan-300 transition-colors'
                  >
                    Pol. de Privacidad
                  </a>{" "}
                  y{" "}
                  <a
                    href='/terms'
                    target='_blank'
                    className='text-cyan-400 hover:text-cyan-300 transition-colors'
                  >
                    Términos de Uso
                  </a>
                  .
                </label>
              </div>
            )}

            {error && (
              <div className='p-3 rounded-xl bg-red-500/10 border border-red-500/20'>
                <p className='text-[11px] text-red-300 text-center font-bold'>{error}</p>
              </div>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={loading || (mode === "signup" && !acceptedTerms)}
              className='w-full py-3.5 rounded-2xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:scale-100'
            >
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === "login" ? "Entrar con email" : "Crear mi cuenta"}
            </button>

            <div className='relative flex items-center py-4'>
              <div className='flex-1 h-px bg-surface-800/60' />
              <span className='px-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900 relative z-10'>
                O accede con
              </span>
              <div className='flex-1 h-px bg-surface-800/60' />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className='w-full py-3.5 rounded-2xl font-bold text-sm bg-surface-800 text-white hover:bg-surface-700 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] border border-surface-700/50'
            >
              <Chrome
                size={18}
                className='text-white'
              />
              Continuar con Google
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
