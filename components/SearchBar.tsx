"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Book, getRecommendedBooks } from "../lib/booksApi";

export default function SearchBar() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch a large number of books for search (100 books to cover pagination)
    getRecommendedBooks(0, 100)
      .then((data) => {
        if (isMounted) {
          setBooks(data);
        }
      })
      .catch(() => {
        // Silent fail - search just won't have results
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="search-bar" ref={searchContainerRef}>
        <div className="search-bar__container">
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search for books..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchModal(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowSearchModal(true);
              }
            }}
          />
          {showSearchModal && searchQuery && (
            <div className="search-modal">
              {(() => {
                const filteredBooks = books.filter((book) =>
                  book.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                if (filteredBooks.length === 0) {
                  return <div className="search-modal__message">No books found</div>;
                }
                
                return (
                  <div className="search-modal__results">
                    {filteredBooks.map((book) => {
                      const imageSrc = book.imageLink ?? book.imageLInk;
                      return (
                        <Link
                          href={`/book/${book.id}`}
                          key={book.id}
                          className="search-modal__result"
                          onClick={() => {
                            setShowSearchModal(false);
                            setSearchQuery("");
                          }}
                        >
                          {imageSrc && (
                            <img
                              className="search-modal__result-image"
                              src={imageSrc}
                              alt={book.title}
                            />
                          )}
                          <div className="search-modal__result-info">
                            <div className="search-modal__result-title">{book.title}</div>
                            <div className="search-modal__result-author">{book.author}</div>
                          </div>
                          {book.subscriptionRequired && (
                            <span className="search-modal__result-badge">Premium</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      <div className="search-bar__separator" />
    </>
  );
}
