"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { hasActiveSubscription } from "../lib/subscription";

type PremiumAccessButtonsProps = {
  bookId: string;
  subscriptionRequired?: boolean;
};

export default function PremiumAccessButtons({
  bookId,
  subscriptionRequired,
}: PremiumAccessButtonsProps) {
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(
    subscriptionRequired ? null : true
  );

  useEffect(() => {
    let isMounted = true;

    if (!subscriptionRequired) {
      setHasPremiumAccess(true);
      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      if (!user) {
        setHasPremiumAccess(false);
        return;
      }

      setHasPremiumAccess(null);

      try {
        const hasAccess = await hasActiveSubscription(user.uid);
        if (isMounted) {
          setHasPremiumAccess(hasAccess);
        }
      } catch (error) {
        if (isMounted) {
          setHasPremiumAccess(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscriptionRequired]);

  const isChecking = subscriptionRequired && hasPremiumAccess === null;
  const targetPath =
    !subscriptionRequired || hasPremiumAccess
      ? `/player/${bookId}`
      : "/choose-plan";

  const handleCheckingClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isChecking) {
      event.preventDefault();
    }
  };

  return (
    <>
      <Link
        href={isChecking ? "#" : `${targetPath}?mode=read`}
        className="btn book-detail__action-btn"
        onClick={handleCheckingClick}
        aria-disabled={isChecking}
      >
        {isChecking ? "Checking access..." : "📖 Read"}
      </Link>
      <Link
        href={isChecking ? "#" : `${targetPath}?mode=listen`}
        className="btn book-detail__action-btn"
        onClick={handleCheckingClick}
        aria-disabled={isChecking}
      >
        {isChecking ? "Checking access..." : "🎧 Listen"}
      </Link>
    </>
  );
}