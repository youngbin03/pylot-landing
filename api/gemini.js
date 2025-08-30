import { GoogleGenAI } from "@google/genai";

// Gemini AI 클라이언트 초기화
let ai = null;

const initializeGemini = () => {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return ai;
};

// Vercel 서버리스 함수 핸들러
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = "gemini-2.5-pro", config = {} } = req.body;

    // 입력값 검증
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    console.log('🤖 Gemini API 요청:', { model, prompt: prompt.substring(0, 100) + '...' });

    // Gemini AI 초기화
    const gemini = initializeGemini();
    if (!gemini) {
      return res.status(500).json({
        error: 'Gemini API key not configured'
      });
    }

    // 기본 설정 (Thinking 비활성화로 속도 향상)
    const defaultConfig = {
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0, // Thinking 비활성화로 속도 향상
      },
      ...config
    };

    // Gemini API 호출
    const response = await gemini.models.generateContent({
      model,
      contents: prompt,
      config: defaultConfig
    });

    console.log('✅ Gemini API 응답 완료');

    // 성공 응답
    res.status(200).json({
      success: true,
      data: {
        text: response.text,
        model,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Gemini API 오류:', error);
    
    res.status(500).json({
      error: 'Gemini API request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// 스트리밍 응답을 위한 별도 함수 (필요시 사용)
export async function generateStreamResponse(prompt, model = "gemini-2.5-pro", config = {}) {
  const gemini = initializeGemini();
  if (!gemini) {
    throw new Error('Gemini API key not configured');
  }

  const defaultConfig = {
    temperature: 0.7,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    ...config
  };

  const response = await gemini.models.generateContentStream({
    model,
    contents: prompt,
    config: defaultConfig
  });

  return response;
}
