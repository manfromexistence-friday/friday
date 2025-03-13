import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Message } from '@/types/chat'

export const chatService = {
  async createChat() {
    try {
      // Create a chat without requiring authentication
      const chatRef = await addDoc(collection(db, 'chats'), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return chatRef.id
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  },

  async addMessage(chatId: string, message: Message) {
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  },

  async getChatHistory(chatId: string) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      const q = query(messagesRef, orderBy('timestamp', 'asc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Message, 'id'>
        return {
          id: doc.id,
          ...data
        }
      })
    } catch (error) {
      console.error('Error getting chat history:', error)
      throw error
    }
  }
}