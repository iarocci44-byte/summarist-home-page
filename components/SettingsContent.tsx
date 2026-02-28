"use client";

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
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

  const handleManageSubscription = () => {
    alert("This feature not implemented yet");
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
                          aria-disabled="true"
                        >
                          Manage my subscription
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
