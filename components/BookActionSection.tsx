"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import PremiumAccessButtons from "./PremiumAccessButtons";
import { auth, db } from "../lib/firebase";

type BookActionSectionProps = {
  bookId: string;
  subscriptionRequired?: boolean;
};

export default function BookActionSection({
  bookId,
  subscriptionRequired,
}: BookActionSectionProps) {
  const [isInLibrary, setIsInLibrary] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsInLibrary(false);
        return;
      }

      try {
        const libraryRef = doc(db, "users", user.uid, "library", bookId);
        const libraryDoc = await getDoc(libraryRef);

        if (isMounted) {
          setIsInLibrary(libraryDoc.exists());
        }
      } catch (error) {
        if (isMounted) {
          setIsInLibrary(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [bookId]);

  return (
    <>
      <div className="book-detail__actions">
        <PremiumAccessButtons
          bookId={bookId}
          subscriptionRequired={subscriptionRequired}
        />
      </div>
      {isInLibrary && (
        <h3 className="book-detail__library-status">
          <span className="book-detail__library-icon" aria-hidden="true">📚</span>
          This book is in your library
        </h3>
      )}
    </>
  );
}