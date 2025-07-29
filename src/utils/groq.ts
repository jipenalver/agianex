import { Groq } from 'groq-sdk'

// Initialize Groq client
export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})
