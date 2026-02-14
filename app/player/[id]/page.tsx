import Link from "next/link";
import { getBook } from "../../../lib/booksApi";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams.mode || "read";
  
  let book;
  try {
    book = await getBook(id);
  } catch (error) {
    return (
      <section className="player">
        <div className="row">
          <div className="player__state">Unable to load book details right now.</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="player">
        <div className="row">
          <div className="player__state">Book not found</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  const imageSrc = book.imageLink ?? book.imageLInk;

  return (
    <section className="player">
      <div className="row">
        <Link href="/for-you" className="player__back-btn">
          ← Back
        </Link>
        
        <div className="player__header">
          <h1 className="player__title">{book.title}</h1>
          <h2 className="player__author">by {book.author}</h2>
        </div>

        <div className="player__mode-toggle">
          <Link
            href={`/player/${id}?mode=read`}
            className={`player__mode-btn ${mode === "read" ? "player__mode-btn--active" : ""}`}
          >
            📖 Read
          </Link>
          <Link
            href={`/player/${id}?mode=listen`}
            className={`player__mode-btn ${mode === "listen" ? "player__mode-btn--active" : ""}`}
          >
            🎧 Listen
          </Link>
        </div>

        {mode === "read" && (
          <div className="player__content">
            {book.summary ? (
              <div className="player__book-viewer">
                <div className="player__text-content">
                  <p className="player__summary-text">{book.summary}</p>
                </div>
              </div>
            ) : (
              <p className="player__note">No book content available</p>
            )}
          </div>
        )}

        {mode === "listen" && (
          <div className="player__content">
            {book.audioLink ? (
              <div className="player__audio-viewer">
                <audio controls className="player__audio">
                  <source src={book.audioLink} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="player__note">Audio player for {book.title}</p>
              </div>
            ) : (
              <p className="player__note">No audio content available</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
