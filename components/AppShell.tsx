"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import AuthPanel from "./AuthPanel";
import SideNav from "./SideNav";
import SearchBar from "./SearchBar";

type AuthModalContextValue = {
  openLogin: () => void;
  isSignedIn: boolean;
  handleAuthClick: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue>({
  openLogin: () => {},
  isSignedIn: false,
  handleAuthClick: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(Boolean(user));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isSignedIn && pathname === "/") {
      router.push("/for-you");
      return;
    }

    if (!isSignedIn && pathname === "/for-you") {
      router.push("/");
    }
  }, [isSignedIn, pathname, router]);

  const handleAuthClick = async () => {
    if (isSignedIn) {
      await signOut(auth);
      router.push("/");
      return;
    }

    openLogin();
  };

  const contextValue = useMemo(
    () => ({ openLogin, isSignedIn, handleAuthClick }),
    [isSignedIn]
  );

  return (
    <AuthModalContext.Provider value={contextValue}>
      {isSignedIn ? (
        <SideNav isSignedIn={isSignedIn} onAuthClick={handleAuthClick} />
      ) : null}
      <div className={`page-shell${isSignedIn ? " page-shell--with-side-nav" : ""}`}>
        {isSignedIn && pathname !== "/" && <SearchBar />}
        {children}
      </div>
      {isLoginOpen ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Login"
          onClick={closeLogin}
        >
          <div className="modal__panel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal__close" onClick={closeLogin}>
              Close
            </button>
            <AuthPanel onSignedIn={closeLogin} />
          </div>
        </div>
      ) : null}
    </AuthModalContext.Provider>
  );
}
