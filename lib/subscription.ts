import { collection, getDocs, limit, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type SubscriptionTier = "free" | "premium";

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd?: Date;
}

const ACTIVE_STATUSES = ["trialing", "active"];

const parseCurrentPeriodEnd = (value: unknown): Date | undefined => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === "number") {
    return new Date(value * 1000);
  }

  if (typeof value === "string") {
    const dateValue = new Date(value);
    if (!Number.isNaN(dateValue.getTime())) {
      return dateValue;
    }
  }

  return undefined;
};

export const getSubscriptionInfo = async (userId: string): Promise<SubscriptionInfo> => {
  const subscriptionsRef = collection(db, "customers", userId, "subscriptions");

  const activeSnapshot = await getDocs(
    query(subscriptionsRef, where("status", "in", ACTIVE_STATUSES), limit(1))
  );

  if (!activeSnapshot.empty) {
    const activeData = activeSnapshot.docs[0].data();
    const status = typeof activeData.status === "string" ? activeData.status : "active";

    return {
      hasActiveSubscription: true,
      tier: "premium",
      status,
      currentPeriodEnd: parseCurrentPeriodEnd(activeData.current_period_end),
    };
  }

  const anySubscriptionSnapshot = await getDocs(query(subscriptionsRef, limit(1)));
  if (!anySubscriptionSnapshot.empty) {
    const subscriptionData = anySubscriptionSnapshot.docs[0].data();
    const status = typeof subscriptionData.status === "string" ? subscriptionData.status : "inactive";

    return {
      hasActiveSubscription: false,
      tier: "free",
      status,
      currentPeriodEnd: parseCurrentPeriodEnd(subscriptionData.current_period_end),
    };
  }

  return {
    hasActiveSubscription: false,
    tier: "free",
    status: "inactive",
  };
};

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const info = await getSubscriptionInfo(userId);
  return info.hasActiveSubscription;
};