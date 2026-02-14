import Link from "next/link";
import { getBook } from "../../../lib/booksApi";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let book;
  try {
    book = await getBook(id);
  } catch (error) {
    return (
      <section className="book-detail">
        <div className="row">
          <div className="book-detail__state">Unable to load book details right now.</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="book-detail">
        <div className="row">
          <div className="book-detail__state">Book not found</div>
          <Link href="/for-you" className="btn">
            Back to For You
          </Link>
        </div>
      </section>
    );
  }

  const imageSrc = book.imageLink ?? book.imageLInk;

  return (
    <section className="book-detail">
      <div className="row">
        <Link href="/for-you" className="book-detail__back-btn">
          ← Back
        </Link>
        <div className="book-detail__container">
          <div className="book-detail__info">
            <h1 className="book-detail__title">{book.title}</h1>
            <h2 className="book-detail__author">by {book.author}</h2>
            {book.subTitle && (
              <p className="book-detail__subtitle">{book.subTitle}</p>
            )}
            <div className="book-detail__meta-info">
              <div className="book-detail__meta-row">
                {book.averageRating && (
                  <span className="book-detail__meta-value">
                    ⭐ {book.averageRating}
                    {book.totalRating && ` (${book.totalRating.toLocaleString()} ratings)`}
                  </span>
                )}
              </div>
              <div className="book-detail__meta-row">
                {book.type && (
                  <div className="book-detail__meta-item">
                    <span className="book-detail__meta-value">🎙️ {book.type}</span>
                  </div>
                )}
                {book.keyIdeas && (
                  <div className="book-detail__meta-item">
                    <span className="book-detail__meta-value">💡 {book.keyIdeas} Key Ideas</span>
                  </div>
                )}
                {book.audioDuration && (
                  <div className="book-detail__meta-item">
                    <span className="book-detail__meta-value">{Math.floor(book.audioDuration / 60)} min</span>
                  </div>
                )}
              </div>
            </div>
            <div className="book-detail__actions">
              <Link 
                href={book.subscriptionRequired ? "/choose-plan" : `/player/${id}?mode=read`} 
                className="btn book-detail__action-btn"
              >
                📖 Read
              </Link>
              <Link 
                href={book.subscriptionRequired ? "/choose-plan" : `/player/${id}?mode=listen`} 
                className="btn book-detail__action-btn"
              >
                🎧 Listen
              </Link>
            </div>
            {book.tags && book.tags.length > 0 && (
              <div className="book-detail__tags-section">
                <h3 className="book-detail__tags-title">What's it about</h3>
                <div className="book-detail__tags">
                  {book.tags.map((tag, index) => (
                    <span key={index} className="book-detail__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {book.bookDescription && (
              <div className="book-detail__section">
                <h3 className="book-detail__section-title">Description</h3>
                <p className="book-detail__text">{book.bookDescription}</p>
              </div>
            )}
          </div>
          <div className="book-detail__image-section">
            {imageSrc ? (
              <img className="book-detail__image" src={imageSrc} alt={book.title} />
            ) : (
              <div className="book-detail__image" aria-hidden="true" />
            )}
            {book.subscriptionRequired && (
              <span className="book-detail__badge">Premium</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
