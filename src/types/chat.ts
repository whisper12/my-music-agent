export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  audio?: string
  code?: CodeBlock[]
}

export interface CodeBlock {
  language: string
  code: string
  filename?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
