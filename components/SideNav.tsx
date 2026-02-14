import Image from "next/image";
import Link from "next/link";
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
        <button type="button" className="side-nav__link" onClick={onAuthClick}>
          Logout
        </button>
        <Link className="side-nav__link" href="/for-you">
          For You
        </Link>
        <a className="side-nav__link" href="#features">
          Features
        </a>
        <a className="side-nav__link" href="#reviews">
          Reviews
        </a>
        <a className="side-nav__link" href="#numbers">
          Numbers
        </a>
      </nav>
    </aside>
  );
}
