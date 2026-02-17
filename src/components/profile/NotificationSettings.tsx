import React, { useState, useEffect } from "react";
import { Bell, BellOff, Mail, MailX } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { requestNotificationPermission } from "../../utils/notifications";
import type { User as FirebaseUser } from "firebase/auth";

interface NotificationSettingsProps {
  user: FirebaseUser | null;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const [emailOptOut, setEmailOptOut] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;
    const firestore = db;

    const loadPrefs = async () => {
      const snap = await getDoc(doc(firestore, "users", user.uid));
      const data = snap.data();
      setEmailOptOut(data?.emailOptOut === true);
      setPushEnabled(!!data?.pushEnabled);
      setLoading(false);
    };

    loadPrefs();

    // Check current push permission state
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, [user]);

  const toggleEmailOptOut = async () => {
    if (!user || !db) return;
    const newValue = !emailOptOut;
    setEmailOptOut(newValue);
    await updateDoc(doc(db!, "users", user.uid), { emailOptOut: newValue });
  };

  const handlePushToggle = async () => {
    if (!user) return;

    if (pushPermission === "denied") {
      // Can't re-request, user blocked it in browser
      alert(
        "Las notificaciones push están bloqueadas en tu navegador. Actívalas desde la configuración del navegador.",
      );
      return;
    }

    if (!pushEnabled) {
      // Enable: request permission + register token
      const token = await requestNotificationPermission(user.uid);
      if (token) {
        setPushEnabled(true);
        setPushPermission("granted");
        if (db) {
          await updateDoc(doc(db!, "users", user.uid), { pushEnabled: true });
        }
      }
    } else {
      // Disable: just flag it (token stays but we check flag server-side)
      setPushEnabled(false);
      if (db) {
        await updateDoc(doc(db!, "users", user.uid), { pushEnabled: false });
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className='bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 space-y-4'>
      <h3 className='text-sm font-bold text-slate-300 uppercase tracking-wider'>Notificaciones</h3>

      {/* Email Toggle */}
      <button
        onClick={toggleEmailOptOut}
        className='w-full flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors'
      >
        <div className='flex items-center gap-3'>
          {emailOptOut ? (
            <MailX
              size={18}
              className='text-red-400'
            />
          ) : (
            <Mail
              size={18}
              className='text-emerald-400'
            />
          )}
          <div className='text-left'>
            <p className='text-sm font-semibold text-white'>Emails</p>
            <p className='text-xs text-slate-400'>
              {emailOptOut
                ? "No recibirás emails comerciales"
                : "Recibirás emails de motivación y novedades"}
            </p>
          </div>
        </div>
        <div
          className={`w-10 h-6 rounded-full transition-colors relative ${
            emailOptOut ? "bg-slate-600" : "bg-emerald-500"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              emailOptOut ? "left-1" : "left-5"
            }`}
          />
        </div>
      </button>

      {/* Push Toggle */}
      <button
        onClick={handlePushToggle}
        className='w-full flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors'
      >
        <div className='flex items-center gap-3'>
          {pushEnabled ? (
            <Bell
              size={18}
              className='text-emerald-400'
            />
          ) : (
            <BellOff
              size={18}
              className='text-red-400'
            />
          )}
          <div className='text-left'>
            <p className='text-sm font-semibold text-white'>Notificaciones Push</p>
            <p className='text-xs text-slate-400'>
              {pushPermission === "denied"
                ? "Bloqueadas en el navegador"
                : pushEnabled
                  ? "Recibirás alertas en tu dispositivo"
                  : "No recibirás notificaciones push"}
            </p>
          </div>
        </div>
        <div
          className={`w-10 h-6 rounded-full transition-colors relative ${
            pushEnabled && pushPermission !== "denied" ? "bg-emerald-500" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              pushEnabled && pushPermission !== "denied" ? "left-5" : "left-1"
            }`}
          />
        </div>
      </button>

      <p className='text-[10px] text-slate-500 text-center'>
        Los emails de seguridad se envían siempre, independientemente de esta configuración.
      </p>
    </div>
  );
};

export default NotificationSettings;
