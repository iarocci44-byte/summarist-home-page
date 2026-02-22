"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { Book, getBook } from "../../../lib/booksApi";
import { hasActiveSubscription } from "../../../lib/subscription";

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const mode = searchParams.get("mode") || "read";

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBook = async () => {
      try {
        const nextBook = await getBook(id);
        if (isMounted) {
          setBook(nextBook);
        }
      } catch (loadError) {
        if (isMounted) {
          setError("Unable to load book details right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    if (!book?.subscriptionRequired) {
      setHasPremiumAccess(true);
      setCheckingAccess(false);
      return () => {
        isMounted = false;
      };
    }

    setCheckingAccess(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      if (!user) {
        setHasPremiumAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        const hasAccess = await hasActiveSubscription(user.uid);
        if (isMounted) {
          setHasPremiumAccess(hasAccess);
        }
      } catch {
        if (isMounted) {
          setHasPremiumAccess(false);
        }
      } finally {
        if (isMounted) {
          setCheckingAccess(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [book]);

  if (loading) {
    return (
      <section className="player">
        <div className="row">
          <div className="player__state">Loading book...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="player">
        <div className="row">
          <div className="player__state">{error}</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="player">
        <div className="row">
          <div className="player__state">Book not found</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  if (book.subscriptionRequired && (checkingAccess || !hasPremiumAccess)) {
    return (
      <section className="player">
        <div className="row">
          <Link href="/for-you" className="player__back-btn">
            ← Back
          </Link>
          <div className="player__state">
            {checkingAccess
              ? "Checking your subscription..."
              : "This book is part of Premium. Upgrade to unlock read and listen."}
          </div>
          {!checkingAccess && (
            <Link href="/choose-plan" className="btn">
              Upgrade to Premium
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="player">
      <div className="row">
        <Link href="/for-you" className="player__back-btn">
          ← Back
        </Link>

        <div className="player__header">
          <h1 className="player__title">{book.title}</h1>
          <h2 className="player__author">by {book.author}</h2>
        </div>

        <div className="player__mode-toggle">
          <Link
            href={`/player/${id}?mode=read`}
            className={`player__mode-btn ${mode === "read" ? "player__mode-btn--active" : ""}`}
          >
            📖 Read
          </Link>
          <Link
            href={`/player/${id}?mode=listen`}
            className={`player__mode-btn ${mode === "listen" ? "player__mode-btn--active" : ""}`}
          >
            🎧 Listen
          </Link>
        </div>

        {mode === "read" && (
          <div className="player__content">
            {book.summary ? (
              <div className="player__book-viewer">
                <div className="player__text-content">
                  <p className="player__summary-text">{book.summary}</p>
                </div>
              </div>
            ) : (
              <p className="player__note">No book content available</p>
            )}
          </div>
        )}

        {mode === "listen" && (
          <div className="player__content">
            {book.audioLink ? (
              <div className="player__audio-viewer">
                <audio controls className="player__audio">
                  <source src={book.audioLink} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="player__note">Audio player for {book.title}</p>
              </div>
            ) : (
              <p className="player__note">No audio content available</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
