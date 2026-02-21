import Image from "next/image";
import Link from "next/link";
import { FiLogOut, FiSettings, FiHelpCircle, FiHome, FiBook, FiSearch, FiEdit2 } from "react-icons/fi";
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
          <FiHome /> For You
        </Link>
        <Link className="side-nav__link" href="/my-library">
          <FiBook /> My Library
        </Link>
        <span className="side-nav__link side-nav__link--disabled">
          <FiEdit2 /> Highlights
        </span>
        <span className="side-nav__link side-nav__link--disabled">
          <FiSearch /> Search
        </span>
      </nav>
      <div className="side-nav__bottom-links">
        <Link className="side-nav__link side-nav__settings" href="/settings">
          <FiSettings /> Settings
        </Link>
        <span className="side-nav__link side-nav__link--disabled side-nav__help">
          <FiHelpCircle /> Help & Support
        </span>
        <button type="button" className="side-nav__link side-nav__logout" onClick={onAuthClick}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}
