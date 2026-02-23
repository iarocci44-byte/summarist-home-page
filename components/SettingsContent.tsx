"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase";
import { db } from "../lib/firebase";
import { useAuthModal } from "./AppShell";
import { getSubscriptionInfo, SubscriptionTier } from "../lib/subscription";

interface UserSubscription {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd?: Date;
}

export default function SettingsContent() {
  const { isSignedIn, handleAuthClick } = useAuthModal();
  const [userEmail, setUserEmail] = useState<string>("");
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: "free",
    status: "inactive"
  });
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSignedIn || !auth.currentUser) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Get user email
    setUserEmail(auth.currentUser.email || "");

    const loadSubscription = async () => {
      try {
        const info = await getSubscriptionInfo(auth.currentUser!.uid);
        if (!isMounted) {
          return;
        }

        setSubscription({
          tier: info.tier,
          status: info.status,
          currentPeriodEnd: info.currentPeriodEnd,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSubscription({
          tier: "free",
          status: "inactive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn]);

  const handleManageSubscription = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to manage your subscription.");
      return;
    }

    setPortalLoading(true);

    try {
      const userId = auth.currentUser.uid;
      const customerDocRef = doc(db, "customers", userId);
      const customerSnapshot = await getDoc(customerDocRef);

      if (!customerSnapshot.exists()) {
        setPortalLoading(false);
        alert(
          `No Stripe customer record found for this account at customers/${userId}. Complete checkout once to create the customer, then retry Manage Subscription.`
        );
        return;
      }

      const customerData = customerSnapshot.data();
      const possibleStripeCustomerId =
        customerData.stripeId ||
        customerData.customer_id ||
        customerData.stripeCustomerId ||
        customerData.customerId;

      if (!possibleStripeCustomerId) {
        setPortalLoading(false);
        alert(
          `Stripe customer ID is missing on customers/${userId}. The Stripe extension should store this after checkout; check extension logs and customer doc fields.`
        );
        return;
      }

      const portalSessionRef = await addDoc(
        collection(db, "customers", userId, "portal_sessions"),
        {
          return_url: `${window.location.origin}/settings`,
        }
      );

      let hasResolved = false;
      let unsubscribeSnapshot = () => {};

      const responseTimeout = window.setTimeout(async () => {
        if (hasResolved) {
          return;
        }

        try {
          const latestSnapshot = await getDoc(portalSessionRef);
          const latestData = latestSnapshot.data();

          if (latestData?.url) {
            hasResolved = true;
            unsubscribeSnapshot();
            window.location.assign(latestData.url);
            return;
          }

          if (latestData?.error) {
            hasResolved = true;
            unsubscribeSnapshot();
            setPortalLoading(false);
            const lateErrorMessage =
              typeof latestData.error === "string"
                ? latestData.error
                : latestData.error.message || "Failed to open customer portal.";
            alert(lateErrorMessage);
            return;
          }
        } catch (timeoutError) {
          hasResolved = true;
          unsubscribeSnapshot();
          setPortalLoading(false);
          const message =
            timeoutError instanceof Error
              ? timeoutError.message
              : "Customer portal session timed out while reading the session document.";
          alert(message);
          return;
        }

        hasResolved = true;
        unsubscribeSnapshot();
        setPortalLoading(false);
        alert(
          `Customer portal session timed out. Verify the Firebase Stripe extension is installed in this same Firebase project, Stripe Billing Portal is configured in Stripe, and inspect this doc for an error/url: customers/${userId}/portal_sessions/${portalSessionRef.id}`
        );
      }, 30000);

      unsubscribeSnapshot = onSnapshot(
        portalSessionRef,
        (snapshot) => {
          if (hasResolved) {
            return;
          }

          const data = snapshot.data();
          if (!data) {
            return;
          }

          if (data.error) {
            hasResolved = true;
            window.clearTimeout(responseTimeout);
            unsubscribeSnapshot();
            setPortalLoading(false);
            const message =
              typeof data.error === "string"
                ? data.error
                : data.error.message || "Failed to open customer portal.";
            alert(message);
            return;
          }

          if (data.url) {
            hasResolved = true;
            window.clearTimeout(responseTimeout);
            unsubscribeSnapshot();
            window.location.assign(data.url);
          }
        },
        (snapshotError) => {
          if (hasResolved) {
            return;
          }

          hasResolved = true;
          window.clearTimeout(responseTimeout);
          unsubscribeSnapshot();
          setPortalLoading(false);
          const message =
            snapshotError instanceof Error
              ? snapshotError.message
              : "Failed to read portal session document.";
          alert(message);
        }
      );
    } catch (error) {
      setPortalLoading(false);
      const message = error instanceof Error ? error.message : "Failed to open customer portal.";
      alert(message);
    }
  };

  if (!isSignedIn) {
    return (
      <section className="settings">
        <div className="container">
          <div className="row">
            <div className="settings__state">
              <h1 className="settings__title">Access Your Settings</h1>
              <p className="settings__subtitle">
                Sign in to view and manage your account settings.
              </p>
              <button className="btn" type="button" onClick={handleAuthClick}>
                Login
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="settings">
      <div className="settings__content">
        <div className="container">
          <div className="row">
            <h1 className="settings__title">Account Settings</h1>

            {loading ? (
              <div className="settings__loading">Loading your account information...</div>
            ) : (
              <div className="settings__sections">
                {/* Account Information */}
                <div className="settings__section">
                  <h2 className="settings__section-title">Account Information</h2>
                  <div className="settings__info-grid">
                    <div className="settings__info-item">
                      <label className="settings__label">Email Address</label>
                      <div className="settings__value">{userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Subscription Information */}
                <div className="settings__section">
                  <h2 className="settings__section-title">Subscription & Billing</h2>
                  <div className="settings__subscription">
                    <div className="settings__subscription-header">
                      <div>
                        <div className="settings__subscription-tier">
                          {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                        </div>
                        <div className="settings__subscription-status">
                          Status: <span className={`settings__status-badge settings__status-badge--${subscription.status}`}>
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                      {subscription.tier === "free" && (
                        <button className="settings__upgrade-btn" onClick={() => window.location.href = "/choose-plan"}>
                          Upgrade to Premium
                        </button>
                      )}
                    </div>

                    {subscription.tier === "free" ? (
                      <div className="settings__subscription-details">
                        <p>You are currently on the free plan with limited access to content.</p>
                        <ul className="settings__features-list">
                          <li>Access to selected free books</li>
                          <li>Limited audio summaries</li>
                          <li>Basic features only</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="settings__subscription-details">
                        <p>You have full access to all premium features.</p>
                        {subscription.currentPeriodEnd && (
                          <p className="settings__renewal">
                            Your subscription renews on: {subscription.currentPeriodEnd.toLocaleDateString()}
                          </p>
                        )}
                        <button
                          className="btn btn--secondary settings__manage-btn"
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                        >
                          {portalLoading ? "Opening..." : "Manage Subscription"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stripe Integration Note */}
                <div className="settings__section settings__section--info">
                  <h3 className="settings__info-title">💳 Payment Method</h3>
                  <p className="settings__info-text">
                    Billing is securely managed through Stripe. 
                    {subscription.tier !== "free" && " Your payment information is encrypted and secure."}
                  </p>
                  {subscription.tier === "free" && (
                    <p className="settings__info-text">
                      Upgrade to a premium plan to add payment methods and unlock all features.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
