import React, { useState, useEffect, FormEvent } from "react";
import { Dumbbell, Loader, Check, Trash2, Sparkles, Link, Unlink } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/Button";
import { useProfile } from "../../hooks/useProfile";
import { useEntitlement } from "../../hooks/useEntitlement";
import { useToast } from "../../hooks/useToast";
import { useStrava } from "../../hooks/useStrava";
import RoutineManager from "../routines/RoutineManager";
import ProfileForm from "./ProfileForm";
import SubscriptionPanel from "./SubscriptionPanel";
import NotificationSettings from "./NotificationSettings";
import ThemeToggle from "../common/ThemeToggle";
import DeleteAccountModal from "./DeleteAccountModal";
import ChangelogModal from "./ChangelogModal";
import type { User as FirebaseUser } from "firebase/auth";
import type { ProfileFormData } from "../../types";
import { APP_VERSION } from "../../config/version";
import { PersonalDataSchema } from "../../schemas/validation";

interface ProfileEditorProps {
  user: FirebaseUser | null;
  onRequireAuth?: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onRequireAuth }) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { plan } = useEntitlement(user);
  const isPro = plan === "pro";
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showRoutineManager, setShowRoutineManager] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);
  const navigate = useNavigate();
  const { info, error, success: toast$ } = useToast();
  const {
    isLinked: stravaLinked,
    athleteName: stravaAthlete,
    isConnecting: stravaConnecting,
    isDisconnecting: stravaDisconnecting,
    connect: stravaConnect,
    disconnect: stravaDisconnect,
  } = useStrava({ user, profile });

  // Sync profile to formData only on initial load or reset
  useEffect(() => {
    if (!profile) {
      setFormData(null);
    } else if (!formData) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile, formData]);

  const handleChange = (field: keyof ProfileFormData, value: any): void => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();
    if (!formData) return;

    const validationResult = PersonalDataSchema.safeParse({
      age: formData.age,
      height: formData.height,
      weight: formData.weight,
    });

    if (!validationResult.success) {
      error(validationResult.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleSaveClick = async (): Promise<void> => {
    if (!formData) return;

    const validationResult = PersonalDataSchema.safeParse({
      age: formData.age,
      height: formData.height,
      weight: formData.weight,
    });

    if (!validationResult.success) {
      error(validationResult.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  if (loading || !formData)
    return (
      <div className='p-8 text-center text-slate-500 dark:text-slate-400'>Cargando perfil...</div>
    );

  return (
    <>
      {/* ── Main scrollable content ─────────────────────────── */}
      <div className='space-y-6 pb-24 sm:pb-6 px-1'>
        <ProfileForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isSaving={isSaving}
          isGenerating={false}
          savedSuccess={savedSuccess}
          isPro={isPro}
        />

        {/* Save button — hidden on mobile (rendered sticky below) */}
        <div className='hidden sm:block'>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${savedSuccess ? "bg-success-600 hover:bg-success-600 text-white shadow-success-900/20" : ""}`}
            variant='primary'
            leftIcon={
              isSaving ? (
                <Loader
                  size={18}
                  className='animate-spin'
                />
              ) : savedSuccess ? (
                <Check size={18} />
              ) : undefined
            }
          >
            {savedSuccess ? "Guardado" : "Guardar Perfil"}
          </Button>
        </div>

        {/* ── Subscription ─────────────────────────── */}
        <SubscriptionPanel
          user={user}
          onRequireAuth={onRequireAuth}
        />

        {/* ── Secondary settings (lower visual weight) ─────────────────────────── */}
        <div className='space-y-3'>
          <p className='text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1'>
            Ajustes
          </p>

          {/* Notificaciones — compact */}
          <NotificationSettings user={user} />

          {/* Apariencia — compact */}
          <div className='bg-white dark:bg-surface-900/40 border border-slate-200 dark:border-surface-800/60 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 shadow-none transition-colors'>
            <p className='text-sm font-semibold text-slate-700 dark:text-slate-300'>Apariencia</p>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Integraciones ─────────────────────────── */}
        <div className='space-y-3'>
          <p className='text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1'>
            Integraciones
          </p>

          <div className='bg-white dark:bg-surface-900/40 border border-slate-200 dark:border-surface-800/60 rounded-xl px-4 py-3 shadow-none transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-[#FC4C02]/10'>
                  <svg
                    viewBox='0 0 24 24'
                    className='w-4 h-4 text-[#FC4C02]'
                    fill='currentColor'
                  >
                    <path d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169' />
                  </svg>
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-700 dark:text-slate-300'>Strava</p>
                  {stravaLinked && stravaAthlete && (
                    <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                      {stravaAthlete}
                    </p>
                  )}
                </div>
              </div>

              {stravaLinked ? (
                <button
                  onClick={async () => {
                    await stravaDisconnect();
                    toast$("Strava desconectado");
                  }}
                  disabled={stravaDisconnecting}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50'
                >
                  {stravaDisconnecting ? (
                    <Loader
                      size={12}
                      className='animate-spin'
                    />
                  ) : (
                    <Unlink size={12} />
                  )}
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={stravaConnect}
                  disabled={stravaConnecting}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-[#FC4C02] hover:bg-[#e04402] px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-sm'
                >
                  {stravaConnecting ? (
                    <Loader
                      size={12}
                      className='animate-spin'
                    />
                  ) : (
                    <svg
                      viewBox='0 0 24 24'
                      className='w-3 h-3'
                      fill='currentColor'
                    >
                      <path d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169' />
                    </svg>
                  )}
                  Connect with Strava
                </button>
              )}
            </div>
            {stravaLinked && (
              <p className='text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right'>
                Powered by Strava
              </p>
            )}
          </div>
        </div>

        {/* ── Routine manager ─────────────────────────── */}
        <div className='pt-2 border-t border-slate-200 dark:border-surface-800 text-center transition-colors'>
          <Button
            variant='ghost'
            onClick={() => setShowRoutineManager(true)}
            className='w-full sm:w-auto mx-auto'
            leftIcon={<Dumbbell size={16} />}
          >
            Gestionar Mis Rutinas Guardadas
          </Button>
        </div>

        {showRoutineManager && (
          <RoutineManager
            user={user}
            onClose={() => setShowRoutineManager(false)}
          />
        )}

        {/* ── Footer: version + changelog link ─────────────────────────── */}
        <div className='mt-6 text-center space-y-1'>
          <button
            onClick={() => setShowChangelog(true)}
            className='inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-primary-400 dark:text-slate-600 dark:hover:text-primary-400 transition-colors group'
          >
            <span
              className='font-mono'
              onClick={(e) => {
                // Secret dev tap: 7 taps on the version text toggles analytics opt-out
                const newCount = ((window as any)._devTapCount =
                  ((window as any)._devTapCount || 0) + 1);
                if (newCount === 7) {
                  const currentOptOut = localStorage.getItem("fittwiz_analytics_optout") === "true";
                  const newState = !currentOptOut;
                  localStorage.setItem("fittwiz_analytics_optout", String(newState));
                  info(`Modo Desarrollador: Analytics ${newState ? "DESACTIVADO" : "ACTIVADO"}`);
                  (window as any)._devTapCount = 0;
                }
                e.stopPropagation();
              }}
            >
              v{APP_VERSION}
            </span>
            <span className='text-slate-300 dark:text-slate-700'>·</span>
            <Sparkles
              size={11}
              className='text-primary-400 opacity-60 group-hover:opacity-100 transition-opacity'
            />
            <span>Novedades</span>
          </button>
          <p className='text-[9px] text-slate-300 dark:text-slate-700'>FittWiz © 2026</p>
        </div>

        {/* ── Danger Zone ─────────────────────────── */}
        {user && (
          <div className='mt-4 pt-4 border-t border-danger-500/20'>
            <Button
              variant='danger'
              onClick={() => setShowDeleteModal(true)}
              className='w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2'
              leftIcon={<Trash2 size={16} />}
            >
              Eliminar mi cuenta
            </Button>
            <p className='text-[11px] text-slate-500 dark:text-slate-600 text-center mt-2 transition-colors'>
              Se eliminarán todos tus datos de forma irreversible.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky Save Button (mobile only) ─────────────────────────── */}
      <div className='sm:hidden fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pointer-events-none'>
        <div className='pointer-events-auto'>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/20 ${savedSuccess ? "bg-success-600 hover:bg-success-600 text-white" : ""}`}
            variant='primary'
            leftIcon={
              isSaving ? (
                <Loader
                  size={18}
                  className='animate-spin'
                />
              ) : savedSuccess ? (
                <Check size={18} />
              ) : undefined
            }
          >
            {savedSuccess ? "Guardado ✓" : "Guardar Perfil"}
          </Button>
        </div>
      </div>

      {/* ── Modals ─────────────────────────── */}
      {user && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onAccountDeleted={() => {
            setShowDeleteModal(false);
            navigate("/");
          }}
        />
      )}

      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </>
  );
};

export default ProfileEditor;
