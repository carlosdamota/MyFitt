import { useState, useCallback, useMemo } from "react";
import type { User } from "firebase/auth";
import type { UserProfile } from "./useProfile";
import {
  exchangeStravaToken,
  syncWorkoutToStrava,
  disconnectStrava as disconnectStravaApi,
  type StravaSyncPayload,
  type StravaSyncResult,
} from "../api/strava";

const STRAVA_CLIENT_ID = (import.meta.env.VITE_STRAVA_CLIENT_ID as string | undefined) || "";

interface UseStravaOptions {
  user: User | null;
  profile: UserProfile | null;
}

export interface UseStravaReturn {
  /** Whether the user has linked their Strava account */
  isLinked: boolean;
  /** Strava athlete name (if linked) */
  athleteName: string | undefined;
  /** Loading state for OAuth connect flow */
  isConnecting: boolean;
  /** Loading state for workout sync */
  isSyncing: boolean;
  /** Loading state for disconnect */
  isDisconnecting: boolean;
  /** Start the Strava OAuth flow (opens popup/redirect) */
  connect: () => void;
  /** Disconnect Strava */
  disconnect: () => Promise<void>;
  /** Sync a workout to Strava */
  syncWorkout: (payload: StravaSyncPayload) => Promise<StravaSyncResult>;
  /** Exchange the code from the OAuth callback (called by StravaCallback page) */
  exchangeCode: (code: string) => Promise<void>;
}

export const useStrava = ({ user, profile }: UseStravaOptions): UseStravaReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isLinked = useMemo(() => !!profile?.strava?.linked, [profile?.strava?.linked]);
  const athleteName = useMemo(() => profile?.strava?.athleteName, [profile?.strava?.athleteName]);

  const connect = useCallback(() => {
    if (!STRAVA_CLIENT_ID) {
      console.error("VITE_STRAVA_CLIENT_ID is not configured");
      return;
    }

    const redirectUri = `${window.location.origin}/integrations/strava/callback`;
    const scope = "activity:write";
    const stravaAuthUrl =
      `https://www.strava.com/oauth/authorize` +
      `?client_id=${STRAVA_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&approval_prompt=auto`;

    window.location.href = stravaAuthUrl;
  }, []);

  const exchangeCode = useCallback(
    async (code: string) => {
      if (!user) throw new Error("auth_required");
      setIsConnecting(true);
      try {
        await exchangeStravaToken(code);
        // Profile will auto-update via onSnapshot in useProfile
      } finally {
        setIsConnecting(false);
      }
    },
    [user],
  );

  const disconnect = useCallback(async () => {
    if (!user) return;
    setIsDisconnecting(true);
    try {
      await disconnectStravaApi();
      // Profile will auto-update via onSnapshot in useProfile
    } finally {
      setIsDisconnecting(false);
    }
  }, [user]);

  const syncWorkout = useCallback(
    async (payload: StravaSyncPayload): Promise<StravaSyncResult> => {
      if (!user) throw new Error("auth_required");
      setIsSyncing(true);
      try {
        return await syncWorkoutToStrava(payload);
      } finally {
        setIsSyncing(false);
      }
    },
    [user],
  );

  return {
    isLinked,
    athleteName,
    isConnecting,
    isSyncing,
    isDisconnecting,
    connect,
    disconnect,
    syncWorkout,
    exchangeCode,
  };
};
