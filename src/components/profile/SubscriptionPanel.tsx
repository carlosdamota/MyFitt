import React, { useMemo, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "../../config/firebase";
import { createBillingPortalSession, createCheckoutSession } from "../../api/billing";
import { useEntitlement } from "../../hooks/useEntitlement";

interface SubscriptionPanelProps {
  user: FirebaseUser | null;
  onRequireAuth?: () => void;
}

const formatRenewal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ user, onRequireAuth }) => {
  const { plan, currentPeriodEnd, loading } = useEntitlement(user);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<"checkout" | "portal" | "refresh" | null>(null);

  const planLabel = plan === "pro" ? "Pro" : "Free";
  const renewalLabel = useMemo(
    () => (plan === "pro" ? formatRenewal(currentPeriodEnd) : ""),
    [plan, currentPeriodEnd],
  );

  const handleCheckout = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setError(null);
    setProcessing("checkout");
    try {
      const origin = window.location.origin;
      // Hardcoded Founders Coupon
      const url = await createCheckoutSession(origin, origin, "OmyEug7I");
      window.location.assign(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar el pago.";
      setError(message);
    } finally {
      setProcessing(null);
    }
  };

  const handlePortal = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setError(null);
    setProcessing("portal");
    try {
      const origin = window.location.origin;
      const url = await createBillingPortalSession(origin);
      window.location.assign(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo abrir el portal.";
      setError(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRefreshPlan = async () => {
    if (!auth?.currentUser) return;
    setError(null);
    setProcessing("refresh");
    try {
      await auth.currentUser.getIdToken(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el plan.";
      setError(message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs text-slate-500 uppercase tracking-wider'>Suscripcion</p>
          <h3 className='text-xl font-bold text-white flex items-center gap-2'>
            {planLabel}
            {plan === "pro" && (
              <span className='text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300'>
                Activo
              </span>
            )}
          </h3>
          <p className='text-sm text-slate-400 mt-1'>
            {plan === "pro"
              ? renewalLabel
                ? `Renueva el ${renewalLabel}`
                : "Renueva automaticamente"
              : "No activo"}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleRefreshPlan}
            disabled={!user || processing === "refresh"}
            className='inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition disabled:opacity-60'
          >
            <RefreshCw
              size={14}
              className={processing === "refresh" ? "animate-spin" : ""}
            />
            Actualizar estado
          </button>
        </div>
      </div>

      {loading && <p className='text-xs text-slate-500'>Actualizando estado...</p>}

      {error && <p className='text-sm text-red-400'>{error}</p>}

      <div className='flex flex-col sm:flex-row gap-3'>
        {plan === "pro" ? (
          <button
            type='button'
            onClick={handlePortal}
            disabled={processing === "portal"}
            className='inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition disabled:opacity-60'
          >
            <CreditCard size={16} /> Gestionar suscripcion
          </button>
        ) : (
          <button
            type='button'
            onClick={handleCheckout}
            disabled={processing === "checkout"}
            className='inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-60 relative overflow-hidden group'
          >
            <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
            <CreditCard size={16} /> Desbloquear Oferta Pro (2.99€)
          </button>
        )}
        <p className='text-xs text-slate-500 sm:self-center'>
          Los cambios pueden tardar unos segundos tras el pago.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPanel;
