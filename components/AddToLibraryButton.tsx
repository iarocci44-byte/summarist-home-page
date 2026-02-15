"use client";

import { useState } from "react";
import { useAuthModal } from "./AppShell";
import { auth } from "../lib/firebase";
import { addToLibrary } from "../lib/booksApi";

type AddToLibraryButtonProps = {
  bookId: string;
};

export default function AddToLibraryButton({ bookId }: AddToLibraryButtonProps) {
  const { isSignedIn, handleAuthClick } = useAuthModal();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToLibrary = async () => {
    if (!isSignedIn) {
      handleAuthClick();
      return;
    }

    if (!auth.currentUser) {
      setError("Please sign in to add books to your library");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addToLibrary(auth.currentUser.uid, bookId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    } catch (err) {
      setError("Failed to add book. Please try again.");
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="add-to-library" style={{ marginTop: "1.5rem", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className="btn add-to-library-btn"
          onClick={handleAddToLibrary}
          disabled={isAdding || isAdded}
        >
          {isAdding ? "Adding..." : isAdded ? "✓ Added!" : "📚 Add to My Library"}
        </button>
      </div>
      {error && <p className="add-to-library__error" style={{ textAlign: "center", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
