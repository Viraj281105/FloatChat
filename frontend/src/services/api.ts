const API_BASE_URL = 'http://localhost:8000';

export interface ChatResponse {
  success: boolean;
  response: any;
  source_agent: string;
  session_id: string;
  processing_time: number;
  timestamp: string;
  debug_info?: Record<string, unknown>;
  error_details?: string;
}

export const sendChat = async (
  query: string, 
  sessionId: string, 
  includeDebug: boolean = false
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        session_id: sessionId,
        include_debug: includeDebug,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const getSystemHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};