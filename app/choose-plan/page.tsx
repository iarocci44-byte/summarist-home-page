"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "../../components/AppShell";
import { auth } from "../../lib/firebase";
import { STRIPE_PRICES } from "../../lib/stripe";

export default function ChoosePlanPage() {
  const router = useRouter();
  const { isSignedIn } = useAuthModal();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      alert("Please sign in to subscribe");
      return;
    }

    setLoading(true);
    
    try {
      const userId = auth.currentUser?.uid || '';
      const email = auth.currentUser?.email || '';
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
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
