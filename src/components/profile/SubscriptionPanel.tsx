import React, { useMemo, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    <div className='rounded-2xl border border-surface-800 bg-surface-900/40 p-5 space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs text-slate-500 uppercase tracking-wider'>Suscripcion</p>
          <h3 className='text-xl font-bold text-white flex items-center gap-2'>
            {planLabel}
            {plan === "pro" && <Badge variant='primary'>Activo</Badge>}
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
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshPlan}
            disabled={!user || processing === "refresh"}
            className='inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition disabled:opacity-60'
            leftIcon={
              <RefreshCw
                size={14}
                className={processing === "refresh" ? "animate-spin" : ""}
              />
            }
          >
            Actualizar estado
          </Button>
        </div>
      </div>

      {loading && <p className='text-xs text-slate-500'>Actualizando estado...</p>}

      {error && <p className='text-sm text-red-400'>{error}</p>}

      <div className='flex flex-col gap-3'>
        {/* Terms Checkbox for PRO purchase */}
        {plan !== "pro" && (
          <div className='flex items-start gap-2 bg-primary-500/10 p-3 rounded-lg border border-primary-500/20'>
            <input
              type='checkbox'
              id='sub-terms'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='mt-1 w-4 h-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500/50 shrink-0'
            />
            <label
              htmlFor='sub-terms'
              className='text-[11px] text-slate-300 leading-tight'
            >
              Acepto las{" "}
              <a
                href='/terms'
                target='_blank'
                className='text-primary-400 hover:underline'
              >
                Condiciones de Suscripción
              </a>{" "}
              y entiendo que al ser un servicio digital inmediato, renuncio a mi derecho de
              desistimiento una vez iniciado el servicio.
            </label>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-3'>
          {plan === "pro" ? (
            <Button
              variant='outline'
              onClick={handlePortal}
              disabled={processing === "portal"}
              leftIcon={<CreditCard size={16} />}
            >
              Gestionar suscripcion
            </Button>
          ) : (
            <Button
              variant='primary'
              onClick={handleCheckout}
              disabled={processing === "checkout" || !acceptedTerms}
              leftIcon={<CreditCard size={16} />}
            >
              Desbloquear Oferta Pro (2.99€)
            </Button>
          )}
          <p className='text-xs text-slate-500 sm:self-center'>
            Los cambios pueden tardar unos segundos tras el pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPanel;
