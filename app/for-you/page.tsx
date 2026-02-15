"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthModal } from "../../components/AppShell";
import { Book, getRecommendedBooks } from "../../lib/booksApi";

export default function ForYouPage() {
  const { isSignedIn, handleAuthClick } = useAuthModal();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getRecommendedBooks(0, 10)
      .then((data) => {
        if (isMounted) {
          setBooks(data);
          setOffset(10);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load recommendations right now.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const moreBooks = await getRecommendedBooks(offset, 10);
      if (moreBooks.length > 0) {
        setBooks(prevBooks => [...prevBooks, ...moreBooks]);
        setOffset(prevOffset => prevOffset + 10);
      }
    } catch (err) {
      setError("Unable to load more books.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!isSignedIn) {
    return (
      <section className="for-you">
        <div className="row">
          <div className="for-you__state">
            <h1 className="for-you__title">Your recommendations await</h1>
            <p className="for-you__subtitle">
              Sign in to see your personalized picks.
            </p>
            <button className="btn" type="button" onClick={handleAuthClick}>
              Login
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="for-you">
      <div className="for-you__content">
        <div className="row">
          <div className="for-you__header">
            <h1 className="for-you__title">For You</h1>
            <p className="for-you__subtitle">
              Curated summaries picked to match your interests.
            </p>
          </div>
        {loading ? (
          <div className="for-you__grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="book-card book-card--skeleton">
                <div className="book-card__image skeleton-box" />
                <div className="book-card__title skeleton-text skeleton-text--title" />
                <div className="book-card__author skeleton-text skeleton-text--author" />
                <div className="book-card__subtitle skeleton-text skeleton-text--subtitle" />
                <div className="book-card__meta skeleton-text skeleton-text--meta" />
              </div>
            ))}
          </div>
        ) : null}
        {error ? <div className="for-you__state">{error}</div> : null}
        {!loading && !error ? (
          <div className="for-you__grid">
            {books.map((book) => {
              const imageSrc = book.imageLink ?? book.imageLInk;
              return (
                <Link href={`/book/${book.id}`} key={book.id} className="book-card-link">
                  <article className="book-card">
                    {book.subscriptionRequired ? (
                      <span className="book-card__badge book-card__badge--premium">Premium</span>
                    ) : null}
                    {imageSrc ? (
                      <img className="book-card__image" src={imageSrc} alt={book.title} />
                    ) : (
                      <div className="book-card__image" aria-hidden="true" />
                    )}
                    <div className="book-card__title">{book.title}</div>
                    <div className="book-card__author">{book.author}</div>
                    {book.subTitle ? (
                      <div className="book-card__subtitle">{book.subTitle}</div>
                    ) : null}
                    <div className="book-card__meta">
                      <span>Rating: {book.averageRating ?? "N/A"}</span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : null}
        {!loading && !error && books.length > 0 && (
          <div className="for-you__load-more">
            <button
              className="btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "More Books"}
            </button>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
