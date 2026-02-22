"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "../../components/AppShell";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { STRIPE_PRICES } from "../../lib/stripe";

export default function ChoosePlanPage() {
  const router = useRouter();
  const { isSignedIn } = useAuthModal();
  const [loading, setLoading] = useState(false);

  const formatCheckoutError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Failed to start checkout. Please try again.";
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      alert("Please sign in to subscribe");
      return;
    }

    if (!auth.currentUser) {
      alert("Please sign in to subscribe");
      return;
    }

    setLoading(true);
    
    try {
      const checkoutSessionRef = await addDoc(
        collection(db, "customers", auth.currentUser.uid, "checkout_sessions"),
        {
          price: priceId,
          success_url: `${window.location.origin}/for-you`,
          cancel_url: `${window.location.origin}/choose-plan`,
          metadata: {
            firebaseUID: auth.currentUser.uid,
          },
        }
      );

      const responseTimeout = window.setTimeout(() => {
        setLoading(false);
        alert("Checkout session was created but no Stripe URL was returned. Check that the Firebase Stripe extension is installed in this project and that the price ID exists in the same Stripe mode (test/live).");
      }, 15000);

      const unsubscribe = onSnapshot(checkoutSessionRef, (snapshot) => {
        const session = snapshot.data();
        if (!session) {
          return;
        }

        if (session.error) {
          const message =
            typeof session.error === "string"
              ? session.error
              : session.error.message || "Failed to start checkout session";
          window.clearTimeout(responseTimeout);
          unsubscribe();
          setLoading(false);
          alert(message);
          return;
        }

        if (session.url) {
          window.clearTimeout(responseTimeout);
          unsubscribe();
          window.location.assign(session.url);
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      const message = formatCheckoutError(error);
      alert(message);
      setLoading(false);
    }
  };

  return (
    <section className="choose-plan">
      <div className="row">
        <div className="choose-plan__header">
          <h1 className="choose-plan__title">
            Get unlimited access to many amazing books to read
          </h1>
          <p className="choose-plan__subtitle">
            Turn ordinary moments into amazing learning opportunities
          </p>
        </div>

        <div className="choose-plan__cards">
          <div className="choose-plan__card choose-plan__card--recommended">
            <div className="choose-plan__badge">Recommended</div>
            <div className="choose-plan__card-header">
              <h3 className="choose-plan__card-title">Premium Plus</h3>
              <div className="choose-plan__price">
                $99.99<span className="choose-plan__period">/year</span>
              </div>
            </div>
            <div className="choose-plan__card-body">
              <ul className="choose-plan__features">
                <li className="choose-plan__feature">
                  ✓ Unlimited book summaries
                </li>
                <li className="choose-plan__feature">
                  ✓ Unlimited audio summaries
                </li>
                <li className="choose-plan__feature">
                  ✓ Download books for offline reading
                </li>
                <li className="choose-plan__feature">
                  ✓ Access to all premium content
                </li>
              </ul>
              <button 
                className="btn choose-plan__btn choose-plan__btn--primary"
                onClick={() => handleSubscribe(STRIPE_PRICES.PREMIUM_YEARLY)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Subscribe Now'}
              </button>
            </div>
          </div>

          <div className="choose-plan__card">
            <div className="choose-plan__card-header">
              <h3 className="choose-plan__card-title">Premium</h3>
              <div className="choose-plan__price">
                $9.99<span className="choose-plan__period">/month</span>
              </div>
            </div>
            <div className="choose-plan__card-body">
              <ul className="choose-plan__features">
                <li className="choose-plan__feature">
                  ✓ Unlimited book summaries
                </li>
                <li className="choose-plan__feature">
                  ✓ Unlimited audio summaries
                </li>
                <li className="choose-plan__feature">
                  ✓ Access to all premium content
                </li>
              </ul>
              <button 
                className="btn choose-plan__btn choose-plan__btn--primary"
                onClick={() => handleSubscribe(STRIPE_PRICES.PREMIUM_MONTHLY)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>

        <div className="choose-plan__footer">
          <button 
            className="choose-plan__cancel-btn"
            onClick={() => router.push('/for-you')}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
