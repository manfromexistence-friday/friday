import { 
  collection as firestoreCollection,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Message } from '@/types/chat'

export const chatService = {
  async createChat() {
    try {
      // Create a new chat document with a unique ID
      const chatsRef = firestoreCollection(db, 'chats')
      const chatRef = doc(chatsRef)
      await setDoc(chatRef, {
        messages: [],
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
      const chatRef = doc(db, 'chats', chatId)
      
      // Use current timestamp for the message
      const now = new Date()
      
      await updateDoc(chatRef, {
        messages: arrayUnion({
          ...message,
          timestamp: now.toISOString() // Use ISO string for consistent timestamp format
        }),
        updatedAt: serverTimestamp() // This is fine as it's not in arrayUnion
      })
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  },

  async getChatHistory(chatId: string) {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      if (!chatDoc.exists()) {
        return []
      }
      return chatDoc.data().messages || []
    } catch (error) {
      console.error('Error getting chat history:', error)
      throw error
    }
  }
}
