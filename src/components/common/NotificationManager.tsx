import { useEffect } from "react";
import { requestNotificationPermission } from "../../utils/notifications";
import { useAuth } from "../../hooks/useAuth";

export default function NotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      // We can add logic here to only ask if not already asked, or based on user action.
      // For now, let's ask on mount if user is logged in.
      // Best practice: Ask on a button click, but for this task we want to ensure it runs.
      // We'll wrap it in a timeout to not block initial render.
      const timer = setTimeout(() => {
        requestNotificationPermission(user.uid);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  return null;
}
