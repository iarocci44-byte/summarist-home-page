import axios from "axios";
import { db } from "./firebase";
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

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

export const getRecommendedBooks = async (offset = 0, limit = 10) => {
  try {
    // Try to fetch both recommended and suggested books
    const [recommended, suggested] = await Promise.all([
      booksApi.get<Book[]>("/getBooks", { params: { status: "recommended" } }),
      booksApi.get<Book[]>("/getBooks", { params: { status: "suggested" } }).catch(() => ({ data: [] }))
    ]);

    // Combine and paginate books
    const allBooks = [...recommended.data, ...suggested.data];
    return allBooks.slice(offset, offset + limit);
  } catch (error) {
    // Fallback to just recommended if there's an error
    const response = await booksApi.get<Book[]>("/getBooks", {
      params: { status: "recommended" },
    });
    return response.data.slice(offset, offset + limit);
  }
};

export const getSuggestedBooks = async (limit = 5) => {
  try {
    const response = await booksApi.get<Book[]>("/getBooks", {
      params: { status: "suggested" },
    });
    return response.data.slice(0, limit);
  } catch (error) {
    console.error("Error fetching suggested books:", error);
    return [];
  }
};

export const getBook = async (id: string) => {
  const response = await booksApi.get<Book>("/getBook", {
    params: { id },
  });

  return response.data;
};

export const getUserLibrary = async (userId: string) => {
  try {
    // Query Firestore for the user's library
    const libraryRef = collection(db, "users", userId, "library");
    const librarySnapshot = await getDocs(libraryRef);
    
    // Extract bookIds from the documents
    const bookIds = librarySnapshot.docs.map(doc => doc.data().bookId || doc.id);
    
    if (bookIds.length === 0) {
      return [];
    }

    // Fetch book details for each bookId
    const bookPromises = bookIds.map(bookId => getBook(bookId));
    const books = await Promise.all(bookPromises);
    
    return books.filter(book => book !== null);
  } catch (error) {
    console.error("Error fetching user library:", error);
    throw error;
  }
};

export const addToLibrary = async (userId: string, bookId: string) => {
  try {
    // Create a document reference in the user's library subcollection
    const libraryDocRef = doc(db, "users", userId, "library", bookId);
    
    // Set the document with the bookId and timestamp
    await setDoc(libraryDocRef, {
      bookId: bookId,
      addedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding book to library:", error);
    throw error;
  }
};

export const removeFromLibrary = async (userId: string, bookId: string) => {
  try {
    // Create a document reference in the user's library subcollection
    const libraryDocRef = doc(db, "users", userId, "library", bookId);
    
    // Delete the document
    await deleteDoc(libraryDocRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error removing book from library:", error);
    throw error;
  }
};

export const markBookAsFinished = async (userId: string, bookId: string) => {
  try {
    const finishedDocRef = doc(db, "users", userId, "finishedBooks", bookId);

    await setDoc(finishedDocRef, {
      bookId,
      finishedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking book as finished:", error);
    throw error;
  }
};

export const getFinishedBooks = async (userId: string) => {
  try {
    const finishedRef = collection(db, "users", userId, "finishedBooks");
    const finishedSnapshot = await getDocs(finishedRef);

    const bookIds = finishedSnapshot.docs.map((entry) => entry.data().bookId || entry.id);

    if (bookIds.length === 0) {
      return [];
    }

    const books = await Promise.all(bookIds.map((bookId) => getBook(bookId)));
    return books.filter((book) => book !== null);
  } catch (error) {
    console.error("Error fetching finished books:", error);
    throw error;
  }
};
