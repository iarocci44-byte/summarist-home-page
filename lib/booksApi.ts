import axios from "axios";

export type Book = {
  id: string;
  subscriptionRequired: boolean;
  imageLink?: string;
  imageLInk?: string;
  title: string;
  author: string;
  subTitle?: string;
  averageRating?: number;
  totalRating?: number;
  summary?: string;
  bookDescription?: string;
  type?: string;
  audioLink?: string;
  tags?: string[];
  keyIdeas?: number;
  audioDuration?: number;
};

export const booksApi = axios.create({
  baseURL: "https://us-central1-summaristt.cloudfunctions.net",
});

export const getRecommendedBooks = async () => {
  try {
    // Try to fetch both recommended and suggested books
    const [recommended, suggested] = await Promise.all([
      booksApi.get<Book[]>("/getBooks", { params: { status: "recommended" } }),
      booksApi.get<Book[]>("/getBooks", { params: { status: "suggested" } }).catch(() => ({ data: [] }))
    ]);

    // Combine and limit to 10 books
    const allBooks = [...recommended.data, ...suggested.data];
    return allBooks.slice(0, 10);
  } catch (error) {
    // Fallback to just recommended if there's an error
    const response = await booksApi.get<Book[]>("/getBooks", {
      params: { status: "recommended" },
    });
    return response.data;
  }
};

export const getBook = async (id: string) => {
  const response = await booksApi.get<Book>("/getBook", {
    params: { id },
  });

  return response.data;
};
