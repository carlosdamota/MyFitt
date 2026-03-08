import React, { useState, useEffect } from "react";
import { Bell, BellOff, Mail, MailX } from "lucide-react";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "../../hooks/useToast";
import { db, appId } from "../../config/firebase";
import { requestNotificationPermission } from "../../utils/notifications";
import type { User as FirebaseUser } from "firebase/auth";

interface NotificationSettingsProps {
  user: FirebaseUser | null;
}

// Helper to get the correct profile doc ref
const getProfileRef = (userId: string) =>
  doc(db as any, "artifacts", appId, "users", userId, "app_data", "profile");

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);
  const { info } = useToast();

  useEffect(() => {
    if (!user || !db) return;

    const loadPrefs = async () => {
      const snap = await getDoc(getProfileRef(user.uid));
      const data = snap.data();
      setEmailsEnabled(data?.emailOptOut !== true);
      setPushEnabled(!!data?.pushEnabled);
      setLoading(false);
    };

    loadPrefs();

    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, [user]);

  const toggleEmails = async () => {
    if (!user || !db) return;
    const newValue = !emailsEnabled;
    setEmailsEnabled(newValue);
    await updateDoc(getProfileRef(user.uid), { emailOptOut: !newValue, updatedAt: new Date() });
  };

  const handlePushToggle = async () => {
    if (!user) return;

    if (pushPermission === "denied") {
      info(
        "Las notificaciones push están bloqueadas en tu navegador. Actívalas desde la configuración del navegador.",
      );
      return;
    }

    if (!pushEnabled) {
      const token = await requestNotificationPermission(user.uid);
      if (token) {
        setPushEnabled(true);
        setPushPermission("granted");
        if (db) {
          await updateDoc(getProfileRef(user.uid), { pushEnabled: true, updatedAt: new Date() });
        }
      }
    } else {
      setPushEnabled(false);
      if (db) {
        await updateDoc(getProfileRef(user.uid), { pushEnabled: false, updatedAt: new Date() });
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className='bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-slate-200 dark:border-surface-700/50 space-y-4 shadow-sm dark:shadow-none transition-colors'>
      <h3 className='text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider'>
        Notificaciones
      </h3>

      {/* Email Toggle */}
      <button
        onClick={toggleEmails}
        className='w-full flex justify-between items-center py-3 px-4 rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 hover:border-slate-300 dark:hover:border-surface-600 transition-colors'
      >
        <div className='flex items-center gap-3'>
          {!emailsEnabled ? (
            <MailX
              size={18}
              className='text-danger-400'
            />
          ) : (
            <Mail
              size={18}
              className='text-success-400'
            />
          )}
          <div className='text-left'>
            <p className='text-sm font-semibold text-slate-800 dark:text-white'>Emails</p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {!emailsEnabled
                ? "No recibirás emails comerciales"
                : "Recibirás emails de motivación y novedades"}
            </p>
          </div>
        </div>
        <div
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
            !emailsEnabled ? "bg-slate-300 dark:bg-surface-600" : "bg-success-500"
          }`}
        >
          <div
            className={`absolute w-5 h-5 rounded-full bg-white transition-all transform duration-200 ease-in-out shadow-sm ${
              !emailsEnabled ? "translate-x-0.5" : "translate-x-5.5"
            }`}
          />
        </div>
      </button>

      {/* Push Toggle */}
      <button
        onClick={handlePushToggle}
        className='w-full flex justify-between items-center py-3 px-4 rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-surface-700 hover:border-slate-300 dark:hover:border-surface-600 transition-colors'
      >
        <div className='flex items-center gap-3'>
          {pushEnabled ? (
            <Bell
              size={18}
              className='text-success-400'
            />
          ) : (
            <BellOff
              size={18}
              className='text-danger-400'
            />
          )}
          <div className='text-left'>
            <p className='text-sm font-semibold text-slate-800 dark:text-white'>
              Notificaciones Push
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {pushPermission === "denied"
                ? "Bloqueadas en el navegador"
                : pushEnabled
                  ? "Recibirás alertas en tu dispositivo"
                  : "No recibirás notificaciones push"}
            </p>
          </div>
        </div>
        <div
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
            pushEnabled && pushPermission !== "denied"
              ? "bg-success-500"
              : "bg-slate-300 dark:bg-surface-600"
          }`}
        >
          <div
            className={`absolute w-5 h-5 rounded-full bg-white transition-all transform duration-200 ease-in-out shadow-sm ${
              pushEnabled && pushPermission !== "denied" ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>

      <p className='text-[10px] text-slate-500 dark:text-slate-500 text-center transition-colors'>
        Los emails de seguridad se envían siempre, independientemente de esta configuración.
      </p>
    </div>
  );
};

export default NotificationSettings;
