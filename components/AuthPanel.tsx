"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import gNormal from "../assets/GNormal.png";

type AuthPanelProps = {
  onSignedIn?: () => void;
};

export default function AuthPanel({ onSignedIn }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser && onSignedIn) {
        onSignedIn();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Wrong username and/or password");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(
        doc(db, "users", credentials.user.uid),
        {
          uid: credentials.user.uid,
          email: credentials.user.email ?? email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const credentials = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", credentials.user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        await setDoc(userDocRef, {
          uid: credentials.user.uid,
          email: credentials.user.email ?? "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, "guest@summarist.com", "guest123");
    } catch (err) {
      setError("Guest login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-panel__header">
        <div className="auth-panel__title">Account</div>
        <div className="auth-panel__status">
          {user ? `Signed in as ${user.email ?? "User"}` : "Not signed in"}
        </div>
      </div>
      <button
        className="auth-panel__button auth-panel__button--guest"
        onClick={handleGuestSignIn}
        disabled={loading}
        type="button"
      >
        Login as Guest
      </button>
      <div className="auth-panel__fields">
        <input
          className="auth-panel__input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <input
          className="auth-panel__input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="auth-panel__actions">
        <button className="btn auth-panel__button auth-panel__button--signin" onClick={handleEmailSignIn} disabled={loading}>
          Sign In
        </button>
        <button
          className="auth-panel__google"
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
        >
          <span className="auth-panel__google-image" aria-hidden="true">
            <Image src={gNormal} alt="" />
          </span>
          <span className="auth-panel__google-text">Sign in with Google</span>
        </button>
      </div>
      <div className="auth-panel__signup">
        <div className="auth-panel__signup-text">Don't have an account?</div>
        <button
          className="btn auth-panel__button auth-panel__button--signup"
          onClick={handleEmailSignUp}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
      {error ? <div className="auth-panel__error">{error}</div> : null}
    </div>
  );
}
