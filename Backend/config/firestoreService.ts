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

export class FirestoreService {
  // Create or update a user
  static async saveUserData(userId: string, userData: {
    email: string;
    firstName: string;
    lastName: string;
    last_login: number;
  }) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: Timestamp.now()
      }, { merge: true }); // merge: true will update existing documents
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  // Get user data
  static async getUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Method to add a transaction to a user's transactions sub-collection
  static async addTransaction(userId: string, transactionData: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: Date;
    description: string;
    paymentMethod: string;
    currency: string;
    status: 'completed' | 'pending';
    metadata: {
      tags: string[];
    };
  }) {
    try {
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      await addDoc(transactionsRef, {
        ...transactionData,
        date: Timestamp.fromDate(transactionData.date)
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Method to get transactions for a user
  static async getTransactions(userId: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const querySnapshot = await getDocs(transactionsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  }

  static async checkUserExists(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  static async deleteUserData(userId: string) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}