import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useStrava } from "../hooks/useStrava";

type CallbackStatus = "exchanging" | "success" | "error";

const StravaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { exchangeCode } = useStrava({ user, profile });

  const [status, setStatus] = useState<CallbackStatus>("exchanging");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      setStatus("error");
      setErrorMsg(
        error === "access_denied"
          ? "Permiso denegado por el usuario"
          : "No se recibió código de autorización",
      );
      return;
    }

    if (!user) return; // Wait for auth to be ready

    let cancelled = false;

    const doExchange = async () => {
      try {
        await exchangeCode(code);
        if (!cancelled) {
          setStatus("success");
          setTimeout(() => navigate("/app/profile", { replace: true }), 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Error al conectar con Strava");
        }
      }
    };

    doExchange();
    return () => {
      cancelled = true;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-surface-950 px-4 transition-colors'>
      <div className='w-full max-w-sm rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 shadow-lg dark:shadow-xl p-8 text-center space-y-4'>
        {status === "exchanging" && (
          <>
            <Loader2
              size={40}
              className='mx-auto text-primary-500 animate-spin'
            />
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Conectando con Strava...
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Estamos vinculando tu cuenta. Un momento.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle
              size={40}
              className='mx-auto text-secondary-500'
            />
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
              ¡Strava conectado!
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Redirigiendo a tu perfil...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              size={40}
              className='mx-auto text-red-500'
            />
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Error de conexión
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>{errorMsg}</p>
            <button
              onClick={() => navigate("/app/profile", { replace: true })}
              className='mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-surface-700 transition-all'
            >
              Volver al perfil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StravaCallback;
