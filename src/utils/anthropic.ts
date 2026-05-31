export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface AIResponse {
  text: string
  toolCalls?: ToolCall[]
}

export async function sendMessageToAI(messages: ChatMessage[]): Promise<AIResponse> {
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]

    return {
      text: content?.type === 'text' ? content.text : 'Received unexpected response format from AI.',
      toolCalls: data.tool_calls
    }
  } catch (error) {
    console.error('Error calling AI API:', error)
    return {
      text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    }
  }
}
