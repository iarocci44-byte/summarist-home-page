import Image from "next/image";
import Link from "next/link";
import { FiLogOut, FiSettings } from "react-icons/fi";
import logo from "../assets/logo.png";

type SideNavProps = {
  isSignedIn: boolean;
  onAuthClick: () => void;
};

export default function SideNav({ isSignedIn, onAuthClick }: SideNavProps) {
  return (
    <aside className="side-nav" aria-label="Primary">
      <div className="side-nav__brand">
        <Image src={logo} alt="Summarist" className="side-nav__logo" />
      </div>
      <nav className="side-nav__links">
        <Link className="side-nav__link" href="/for-you">
          For You
        </Link>
        <Link className="side-nav__link" href="/my-library">
          My Library
        </Link>
        <span className="side-nav__link side-nav__link--disabled">
          Highlights
        </span>
        <span className="side-nav__link side-nav__link--disabled">
          Search
        </span>
      </nav>
      <Link className="side-nav__link side-nav__settings" href="/settings">
        <FiSettings /> Settings
      </Link>
      <button type="button" className="side-nav__link side-nav__logout" onClick={onAuthClick}>
        <FiLogOut /> Logout
      </button>
    </aside>
  );
}
