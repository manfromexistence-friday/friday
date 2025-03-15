import { 
  collection as firestoreCollection,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  increment,
  Timestamp,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Message } from '@/types/chat'

export type ChatVisibility = 'public' | 'private' | 'unlisted'

interface ChatData {
  title: string
  sessionId: string
  creatorUid: string
  visibility: ChatVisibility
  messages: Message[]
  reactions: {
    likes: { [userId: string]: boolean }
    dislikes: { [userId: string]: boolean }
  }
  participants: string[]
  views: number
  uniqueViewers: string[] // Array of user IDs who viewed the chat
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const chatService = {
  async createChat(title: string, creatorUid: string, visibility: ChatVisibility = 'private') {
    try {
      const chatsRef = firestoreCollection(db, 'chats')
      const chatRef = doc(chatsRef)
      const sessionId = chatRef.id

      await setDoc(chatRef, {
        title,
        sessionId,
        creatorUid,
        visibility,
        messages: [],
        reactions: {
          likes: {},
          dislikes: {}
        },
        participants: [creatorUid],
        views: 0,
        uniqueViewers: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as unknown as ChatData)

      return sessionId
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  },

  async addMessage(chatId: string, message: Message, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const now = new Date()
      
      await updateDoc(chatRef, {
        messages: arrayUnion({
          ...message,
          userId, // Track who sent the message
          timestamp: now.toISOString()
        }),
        participants: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  },

  async updateReaction(chatId: string, messageIndex: number, userId: string, reactionType: 'like' | 'dislike') {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      if (!chatDoc.exists()) return

      const data = chatDoc.data() as ChatData
      const reactionPath = `reactions.${reactionType}s.${userId}`

      // Toggle the reaction
      if (data.reactions[`${reactionType}s`][userId]) {
        await updateDoc(chatRef, {
          [reactionPath]: arrayRemove()
        })
      } else {
        await updateDoc(chatRef, {
          [reactionPath]: true
        })
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
      throw error
    }
  },

  async getChatHistory(chatId: string) {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      if (!chatDoc.exists()) {
        return null
      }
      return chatDoc.data() as ChatData
    } catch (error) {
      console.error('Error getting chat history:', error)
      throw error
    }
  },

  async updateChatVisibility(chatId: string, visibility: ChatVisibility, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) throw new Error('Chat not found')
      
      const data = chatDoc.data() as ChatData
      if (data.creatorUid !== userId) throw new Error('Unauthorized')

      await updateDoc(chatRef, { visibility })
    } catch (error) {
      console.error('Error updating chat visibility:', error)
      throw error
    }
  },

  // Add new method to track views
  async incrementViews(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)

      if (!chatDoc.exists()) return

      const data = chatDoc.data() as ChatData
      const hasViewed = data.uniqueViewers.includes(userId)

      if (!hasViewed) {
        await updateDoc(chatRef, {
          views: increment(1),
          uniqueViewers: arrayUnion(userId)
        })
      }
    } catch (error) {
      console.error('Error incrementing views:', error)
      throw error
    }
  },

  // Add method to get view statistics
  async getViewStats(chatId: string) {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      if (!chatDoc.exists()) {
        return null
      }
      const data = chatDoc.data() as ChatData
      return {
        totalViews: data.views,
        uniqueViewers: data.uniqueViewers.length
      }
    } catch (error) {
      console.error('Error getting view stats:', error)
      throw error
    }
  }
}