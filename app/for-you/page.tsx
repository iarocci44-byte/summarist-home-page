import { Book, getRecommendedBooks, getSuggestedBooks } from "../../lib/booksApi";
import ForYouContent from "../../components/ForYouContent";

export default async function ForYouPage() {
  // Fetch data on the server
  let recommendedBooks: Book[] = [];
  let suggestedBooks: Book[] = [];

  try {
    [recommendedBooks, suggestedBooks] = await Promise.all([
      getRecommendedBooks(0, 5),
      getSuggestedBooks(5)
    ]);
  } catch (error) {
    console.error("Error fetching books:", error);
    // If there's an error, the arrays will remain empty
  }

  return <ForYouContent initialRecommended={recommendedBooks} initialSuggested={suggestedBooks} />;
}
