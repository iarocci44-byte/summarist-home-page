export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__copyright">
          © {currentYear} Summarist. All rights reserved.
        </p>
        <p className="footer__creator">
          <a 
            href="http://christopheriarocci.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer__link"
          >
            Created by Christopher Iarocci
          </a>
        </p>
      </div>
    </footer>
  );
}
