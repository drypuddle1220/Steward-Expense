import { doc, setDoc, collection, addDoc, Timestamp, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    fetchSignInMethodsForEmail 
} from "firebase/auth";

interface Transaction {
  status: string;
  currency: string;
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Timestamp;
  description: string;
  paymentMethod: string;
}

// Service class for handling all Firestore database operations
// This class provides methods for creating, retrieving, updating, and deleting user data and transactions.
// Static methods are used to ensure that each method is callable without instantiating the class.
export class FirestoreService {
  // Creates a new user document or updates an existing one
  static async saveUserData(userId: string, userData: { //Here we add more fields to the user data, such as User age, gender, etc.
    email: string;
    firstName: string;
    lastName: string;
    last_login: number;
  }) {
    try {
      // Creates/updates a document in the 'users' collection
      // The merge option ensures existing data isn't completely overwritten
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: Timestamp.now()  // Adds a timestamp for when the document was last updated
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  // Retrieves a user's data from Firestore
  static async getUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;  // Returns null if user doesn't exist
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Adds a new transaction to a user's subcollection of transactions
  static async addTransaction(userId: string, transactionData: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: Date;  // Accepts JavaScript Date object
    description: string;
    paymentMethod: string;
    currency: string;
    status: 'completed' | 'pending';
    metadata: {
      tags: string[];
    };
  }) {
    try {
      // Creates a reference to the user's transactions subcollection
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      // Adds new document and converts JS Date to Firestore Timestamp
      await addDoc(transactionsRef, {
        ...transactionData,
        date: Timestamp.fromDate(transactionData.date)
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Retrieves all transactions for a specific user
  //We use this to display the transactions in the dashboard
  static async getTransactions(userId: string): Promise<Transaction[]> {
    // Gets reference to user's transactions subcollection
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const querySnapshot = await getDocs(transactionsRef);
    
    // Maps the documents to an array, adding the document ID to each transaction
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  }

  // Checks if a user document exists in Firestore
  //promise means that the function will return a boolean value, and it will either return true or false
  static async checkUserExists(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  // Deletes a user's document from Firestore
  //We use this when the user is deleted from the list of authenticated users, so that if the user try register again, they can do so. And it won't say the account already exists.
  static async deleteUserData(userId: string) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}
