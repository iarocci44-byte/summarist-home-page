"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthModal } from "../../components/AppShell";
import { Book, getFinishedBooks, getUserLibrary, removeFromLibrary } from "../../lib/booksApi";
import { auth } from "../../lib/firebase";

export default function MyLibraryPage() {
  const { isSignedIn, handleAuthClick } = useAuthModal();
  const [books, setBooks] = useState<Book[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !auth.currentUser) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getUserLibrary(auth.currentUser.uid),
      getFinishedBooks(auth.currentUser.uid),
    ])
      .then((results) => {
        if (!isMounted) {
          return;
        }

        const [libraryResult, finishedResult] = results;

        if (libraryResult.status === "fulfilled") {
          setBooks(libraryResult.value);
        } else {
          setError("Unable to load your library right now.");
        }

        if (finishedResult.status === "fulfilled") {
          setFinishedBooks(finishedResult.value);
        } else {
          setFinishedBooks([]);
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

  const handleRemoveBook = async (bookId: string) => {
    if (!auth.currentUser) return;

    setRemovingBookId(bookId);
    try {
      await removeFromLibrary(auth.currentUser.uid, bookId);
      // Update local state to remove the book from the display
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } catch (err) {
      console.error("Failed to remove book:", err);
      setError("Failed to remove book. Please try again.");
    } finally {
      setRemovingBookId(null);
    }
  };

  if (!isSignedIn) {
    return (
      <section className="for-you">
        <div className="row">
          <div className="for-you__state">
            <h1 className="for-you__title">Access Your Library</h1>
            <p className="for-you__subtitle">
              Sign in to view your saved books.
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
            <h1 className="for-you__title">My Library</h1>
            <p className="for-you__subtitle">
              Your collection of saved books.
            </p>
          </div>
        {loading ? (
          <div className="for-you__grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="book-card-wrapper">
                <div className="book-card book-card--skeleton">
                  <div className="book-card__image skeleton-box" />
                  <div className="book-card__title skeleton-text skeleton-text--title" />
                  <div className="book-card__author skeleton-text skeleton-text--author" />
                  <div className="book-card__subtitle skeleton-text skeleton-text--subtitle" />
                  <div className="book-card__meta skeleton-text skeleton-text--meta" />
                </div>
                <div className="skeleton-text skeleton-text--button" style={{ height: '32px', marginTop: '4px' }} />
              </div>
            ))}
          </div>
        ) : null}
        {error ? <div className="for-you__state">{error}</div> : null}
        {!loading && !error && books.length === 0 ? (
          <div className="for-you__state">
            <p>Your library is empty. Start adding books to build your collection!</p>
          </div>
        ) : null}
        {!loading && !error && books.length > 0 ? (
          <div className="for-you__grid">
            {books.map((book) => {
              const imageSrc = book.imageLink ?? book.imageLInk;
              return (
                <div key={book.id} className="book-card-wrapper">
                  <Link href={`/book/${book.id}`} className="book-card-link">
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
                  <button
                    className="book-remove-btn"
                    onClick={() => handleRemoveBook(book.id)}
                    disabled={removingBookId === book.id}
                    type="button"
                  >
                    {removingBookId === book.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="for-you__section" style={{ marginTop: "40px" }}>
            <h2 className="for-you__section-title">Finished Books</h2>
            {finishedBooks.length === 0 ? (
              <div className="for-you__state">
                <p>Books you listen to will appear here.</p>
              </div>
            ) : (
              <div className="for-you__grid">
                {finishedBooks.map((book) => {
                  const imageSrc = book.imageLink ?? book.imageLInk;
                  return (
                    <div key={`finished-${book.id}`} className="book-card-wrapper">
                      <Link href={`/book/${book.id}`} className="book-card-link">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
