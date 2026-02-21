"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthModal } from "./AppShell";
import { Book, getRecommendedBooks } from "../lib/booksApi";

type ForYouContentProps = {
  initialRecommended: Book[];
  initialSuggested: Book[];
};

export default function ForYouContent({ initialRecommended, initialSuggested }: ForYouContentProps) {
  const { isSignedIn, handleAuthClick } = useAuthModal();
  const [recommendedBooks] = useState<Book[]>(initialRecommended);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>(initialSuggested);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(10);

  // Randomly select a book from all available books
  const selectedBook = useMemo(() => {
    const allBooks = [...initialRecommended, ...initialSuggested];
    
    if (allBooks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allBooks.length);
    return allBooks[randomIndex];
  }, [initialRecommended, initialSuggested]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const moreBooks = await getRecommendedBooks(offset, 10);
      if (moreBooks.length > 0) {
        setSuggestedBooks(prevBooks => [...prevBooks, ...moreBooks]);
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
          </div>
          {error ? <div className="for-you__state">{error}</div> : null}
          <>
            {/* Selected For You Section */}
            {selectedBook && (
              <div className="for-you__section">
                <h2 className="for-you__section-title">Selected For You</h2>
                <div className="selected-book">
                  <Link href={`/book/${selectedBook.id}`} className="selected-book__link">
                    <div className="selected-book__content">
                      {selectedBook.subTitle && (
                        <>
                          <div className="selected-book__subtitle-left">
                            {selectedBook.subTitle}
                          </div>
                          <div className="selected-book__divider"></div>
                        </>
                      )}
                      {selectedBook.imageLink || selectedBook.imageLInk ? (
                        <img 
                          className="selected-book__image" 
                          src={selectedBook.imageLink ?? selectedBook.imageLInk} 
                          alt={selectedBook.title} 
                        />
                      ) : (
                        <div className="selected-book__image" aria-hidden="true" />
                      )}
                      <div className="selected-book__info">
                        <h3 className="selected-book__title">{selectedBook.title}</h3>
                        <p className="selected-book__author">{selectedBook.author}</p>
                        <div className="selected-book__meta">
                          <span>Rating: {selectedBook.averageRating ?? "N/A"}</span>
                          {selectedBook.audioDuration && (
                            <span> • Duration: {Math.floor(selectedBook.audioDuration / 60)} min</span>
                          )}
                        </div>
                        <div className="selected-book__play-btn">
                          <div className="selected-book__play-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <span>Listen Now</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Recommended Section */}
            <div className="for-you__section">
              <h2 className="for-you__section-title">Recommended For You</h2>
              <div className="for-you__grid">
                {recommendedBooks.map((book) => {
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
            </div>

            {/* Suggested Section */}
            <div className="for-you__section">
              <h2 className="for-you__section-title">Suggested Books</h2>
              <div className="for-you__grid">
                {suggestedBooks.slice(0, 5).map((book) => {
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
            </div>
          </>
        </div>
      </div>
    </section>
  );
}
