const API_BASE_URL = 'http://localhost:8000';

export interface ChatResponse {
  success: boolean;
  response: string;
  source_agent: string;
  processing_time?: number;
  debug_info?: Record<string, unknown>;
  error_details?: string;
}

export const sendChat = async (
  query: string,
  sessionId: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, session_id: sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  } catch (error) {
    console.error('Health API failed:', error);
    return { status: 'disconnected' };
  }
};
