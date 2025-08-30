import { GoogleGenAI, Type } from "@google/genai";

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

// Lean Canvas JSON 스키마 정의
const leanCanvasSchema = {
  type: Type.OBJECT,
  properties: {
    problem: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "해결하려는 고객의 상위 1~3개 문제와 기존 대안의 한계"
    },
    customer_segments: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "핵심 타겟 고객과 그들의 인구통계학적/심리적 특징"
    },
    unique_value_proposition: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "고객이 우리 제품을 써야만 하는 명확하고 매력적인 메시지"
    },
    solution: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "각 문제를 해결할 핵심 기능 3가지"
    },
    channels: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "고객에게 도달할 방법들"
    },
    revenue_streams: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "수익을 창출하는 방법들"
    },
    cost_structure: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "서버비, 마케팅비, 인건비 등 고정/변동 비용"
    },
    key_metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "비즈니스 성과를 판단할 핵심 지표들"
    },
    unfair_advantage: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "경쟁사가 쉽게 따라할 수 없는 우리만의 강점"
    }
  },
  propertyOrdering: [
    "problem",
    "customer_segments", 
    "unique_value_proposition",
    "solution",
    "channels",
    "revenue_streams",
    "cost_structure",
    "key_metrics",
    "unfair_advantage"
  ],
  required: [
    "problem",
    "customer_segments",
    "unique_value_proposition", 
    "solution",
    "channels",
    "revenue_streams",
    "cost_structure",
    "key_metrics",
    "unfair_advantage"
  ]
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
    const { customer, problem, solution } = req.body;

    // 입력값 검증
    if (!customer || !problem || !solution) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customer', 'problem', 'solution']
      });
    }

    console.log('🎯 Lean Canvas 생성 요청:', { 
      customer: customer.substring(0, 50) + '...',
      problem: problem.substring(0, 50) + '...',
      solution: solution.substring(0, 50) + '...'
    });

    // Gemini AI 초기화
    const gemini = initializeGemini();
    if (!gemini) {
      return res.status(500).json({
        error: 'Gemini API key not configured'
      });
    }

    // Lean Canvas 생성을 위한 프롬프트
    const prompt = `You are an expert startup consultant and accelerator mentor, specializing in creating Lean Canvases from early-stage ideas. Your task is to take a user's initial idea and expand it into a full, detailed Lean Canvas.

Here is the user's input:
- Target Customer: "${customer}"
- Customer's Problem: "${problem}"
- Proposed Solution: "${solution}"

Based ONLY on the information provided above and your general business knowledge, complete all 9 sections of the Lean Canvas.

For the 'problem', 'customer_segments', and 'solution' sections, primarily use the user's input but refine it into 2-3 clear, professional bullet points.
For all other sections, infer and generate logical and creative business hypotheses. Each section should contain 2-3 concise bullet points.

Your output MUST BE a single, valid JSON object.
Do not include any text, explanation, or markdown formatting before or after the JSON object.
The JSON object must have exactly these 9 keys: "problem", "solution", "key_metrics", "customer_segments", "unfair_advantage", "channels", "unique_value_proposition", "cost_structure", "revenue_streams".
The value for each key must be an array of strings.

Make sure each bullet point is:
- Specific and actionable
- Written in Korean
- Professional and business-focused
- Realistic and achievable

Focus on creating a coherent business model where all sections support each other logically.`;

    // Gemini API 호출 (구조화된 JSON 출력)
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: leanCanvasSchema,
        thinkingConfig: {
          thinkingBudget: 0, // 속도 향상을 위해 thinking 비활성화
        }
      }
    });

    console.log('✅ Lean Canvas 생성 완료');

    // JSON 파싱 및 검증
    let leanCanvas;
    try {
      leanCanvas = JSON.parse(response.text);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      return res.status(500).json({
        error: 'Failed to parse Lean Canvas response',
        message: 'Invalid JSON format from AI'
      });
    }

    // 필수 키 검증
    const requiredKeys = [
      'problem', 'customer_segments', 'unique_value_proposition',
      'solution', 'channels', 'revenue_streams', 'cost_structure',
      'key_metrics', 'unfair_advantage'
    ];

    const missingKeys = requiredKeys.filter(key => !leanCanvas[key]);
    if (missingKeys.length > 0) {
      return res.status(500).json({
        error: 'Incomplete Lean Canvas',
        missingKeys
      });
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      data: {
        leanCanvas,
        input: {
          customer,
          problem,
          solution
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lean Canvas 생성 오류:', error);
    
    res.status(500).json({
      error: 'Lean Canvas generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
