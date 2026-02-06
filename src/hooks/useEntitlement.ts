import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { appId, db } from "../config/firebase";

export type PlanType = "free" | "pro";

interface EntitlementDoc {
  plan?: PlanType;
  currentPeriodEnd?: string | null;
}

export interface UseEntitlementReturn {
  plan: PlanType | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export const useEntitlement = (user: User | null): UseEntitlementReturn => {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user || !db) {
      setPlan(null);
      setCurrentPeriodEnd(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "artifacts", appId, "users", user.uid, "billing", "entitlement");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setPlan("free");
          setCurrentPeriodEnd(null);
        } else {
          const data = snap.data() as EntitlementDoc;
          setPlan(data.plan || "free");
          setCurrentPeriodEnd(data.currentPeriodEnd ?? null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error loading entitlement:", err);
        setPlan("free");
        setCurrentPeriodEnd(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { plan, currentPeriodEnd, loading };
};
