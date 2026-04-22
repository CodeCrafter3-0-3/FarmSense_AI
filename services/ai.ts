// AI Service — NVIDIA API Integration for FarmSense AI
// Uses z-ai/glm4.7 model via NVIDIA Integrate API

const BACKEND_URL = 'https://farm-sense-ai.onrender.com/api';
const API_AUTH_TOKEN = 'farmsense_secret_token_2026';

// ─────────────────────────────────────────────
// Chat Query — Text-based AI farming assistant
// ─────────────────────────────────────────────
export async function sendChatQuery(
  message: string,
  language: string = 'English',
  sensorContext?: { soilMoisture?: number; temperature?: number; humidity?: number }
): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': API_AUTH_TOKEN,
      },
      body: JSON.stringify({
        message,
        sensorData: sensorContext,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend AI Error:', response.status, errorText);
      return 'AI service is temporarily unavailable. Please try again later.';
    }

    const result = await response.json();
    
    if (result.success && result.data.response) {
      const responses = result.data.response;
      // Select response based on language
      if (language === 'Hindi') return responses.hindi;
      if (language === 'Punjabi') return responses.punjabi;
      return responses.english;
    }

    return 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('AI Chat Error:', error);
    return 'Connection error. Please check your internet and try again.';
  }
}

// ─────────────────────────────────────────────
// Image Analysis — Disease detection using VISION model
// Uses multimodal format so the AI can actually SEE the image
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Image Analysis — Disease detection using VISION model
// ─────────────────────────────────────────────
export async function analyzeImage(
  imageBase64: string,
  language: string = 'English',
  userId: string = 'user_001'
): Promise<{
  diseaseName: string;
  confidence: number;
  recommendation: string;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/ai/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': API_AUTH_TOKEN,
      },
      body: JSON.stringify({
        userId,
        imageBase64,
        language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Backend analysis failed');
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    }

    throw new Error(result.error || 'Invalid response from backend');
  } catch (error: any) {
    console.error('Image Analysis Error:', error);
    return {
      diseaseName: 'Analysis Failed',
      confidence: 0,
      recommendation: error.message || 'Could not connect to AI server. Please check your internet and try again.',
    };
  }
}

// ─────────────────────────────────────────────
// Quick AI recommendations based on sensor data
// ─────────────────────────────────────────────
export async function getSmartRecommendation(
  soilMoisture: number,
  temperature: number,
  humidity: number,
  weatherCondition: string
): Promise<string> {
  const message = `Based on these conditions:
- Soil Moisture: ${soilMoisture}%
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Weather: ${weatherCondition}

Give me 2-3 brief actionable farming tips for today. Keep it under 100 words.`;

  return sendChatQuery(message, 'English', { soilMoisture, temperature, humidity });
}

// ─────────────────────────────────────────────
// Dedicated Text Translation using Google Translate API (Free)
// ─────────────────────────────────────────────
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const langCodeMap: Record<string, string> = {
    'Hindi': 'hi',
    'Punjabi': 'pa',
    'English': 'en'
  };

  const targetCode = langCodeMap[targetLanguage];
  
  if (!targetCode || targetLanguage === 'English') {
    // If English or unknown, just use AI to ensure proper English structure
    return sendChatQuery(`Refine this text into proper English: "${text}"`, 'English');
  }

  try {
    // Using the free tier Google Translate API (gtx client)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Parse Google Translate response format: [[["नमस्ते","Hello",null,null,1]],null,"en",null,null,null,1,[],[["en"],...]
    if (data && Array.isArray(data[0])) {
      const translatedText = data[0].map((item: any) => item[0]).join('');
      return translatedText;
    }
    
    // Fallback if API fails to parse
    return sendChatQuery(`Translate the following text to ${targetLanguage}. Only return the translated text:\n\n"${text}"`, targetLanguage);
    
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback to AI
    return sendChatQuery(`Translate the following text to ${targetLanguage}. Only return the translated text:\n\n"${text}"`, targetLanguage);
  }
}
