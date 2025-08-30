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

// 리스크 분석 JSON 스키마 정의
const riskAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    market_risk: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "시장 리스크 제목"
        },
        assumption: {
          type: Type.STRING,
          description: "사용자가 가정하고 있는 내용"
        },
        uncertainty: {
          type: Type.STRING,
          description: "실제 불확실한 부분"
        },
        impact: {
          type: Type.STRING,
          description: "비즈니스에 미칠 영향"
        },
        validation_method: {
          type: Type.STRING,
          description: "검증 방법 제안"
        },
        risk_level: {
          type: Type.STRING,
          enum: ["HIGH", "MEDIUM", "LOW"],
          description: "리스크 수준"
        }
      },
      required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
    },
    product_risk: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "제품 리스크 제목"
        },
        assumption: {
          type: Type.STRING,
          description: "사용자가 가정하고 있는 내용"
        },
        uncertainty: {
          type: Type.STRING,
          description: "실제 불확실한 부분"
        },
        impact: {
          type: Type.STRING,
          description: "비즈니스에 미칠 영향"
        },
        validation_method: {
          type: Type.STRING,
          description: "검증 방법 제안"
        },
        risk_level: {
          type: Type.STRING,
          enum: ["HIGH", "MEDIUM", "LOW"],
          description: "리스크 수준"
        }
      },
      required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
    },
    competitive_risk: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "경쟁 리스크 제목"
        },
        assumption: {
          type: Type.STRING,
          description: "사용자가 가정하고 있는 내용"
        },
        uncertainty: {
          type: Type.STRING,
          description: "실제 불확실한 부분"
        },
        impact: {
          type: Type.STRING,
          description: "비즈니스에 미칠 영향"
        },
        validation_method: {
          type: Type.STRING,
          description: "검증 방법 제안"
        },
        risk_level: {
          type: Type.STRING,
          enum: ["HIGH", "MEDIUM", "LOW"],
          description: "리스크 수준"
        }
      },
      required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
    }
  },
  propertyOrdering: [
    "market_risk",
    "product_risk", 
    "competitive_risk"
  ],
  required: [
    "market_risk",
    "product_risk",
    "competitive_risk"
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

    console.log('🎯 리스크 분석 요청:', { 
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

    // Assumption Mapping 기반 리스크 분석 프롬프트
    const prompt = `You are a senior startup advisor and risk analyst specializing in Assumption Mapping methodology. Your task is to identify the 3 most critical risks that could make this business idea fail, focusing on assumptions the entrepreneur might not have questioned.

Business Idea Analysis:
- Target Customer: "${customer}"
- Problem: "${problem}"  
- Solution: "${solution}"

Using Assumption Mapping principles, identify assumptions across these dimensions:
1. DESIRABILITY: Do customers actually want this?
2. FEASIBILITY: Can we build and deliver this?
3. VIABILITY: Can this be a sustainable business?

For each of the 3 risk categories below, identify the MOST CRITICAL assumption that is:
- HIGH IMPORTANCE: Critical to business success
- HIGH UNCERTAINTY: Not yet validated or proven
- OFTEN OVERLOOKED: Something entrepreneurs commonly miss

Provide exactly 3 risks in this order:

1. MARKET RISK (Desirability Focus)
- Focus on customer demand, market size, willingness to pay, behavioral assumptions
- What if customers don't actually want this solution?
- What if the market is smaller than assumed?

2. PRODUCT RISK (Feasibility Focus)  
- Focus on technical execution, user experience, operational challenges
- What if we can't build what customers need?
- What if the solution doesn't actually solve the problem?

3. COMPETITIVE RISK (Viability Focus)
- Focus on competitive landscape, differentiation, market positioning
- What if competitors respond faster than expected?
- What if our competitive advantage isn't sustainable?

For each risk, provide:
- title: Concise risk name (Korean)
- assumption: What the entrepreneur is assuming (Korean)
- uncertainty: What's actually uncertain/unproven (Korean)
- impact: Potential business impact if assumption is wrong (Korean)
- validation_method: Specific way to test this assumption (Korean)
- risk_level: HIGH, MEDIUM, or LOW

Focus on assumptions that are:
✅ Critical to success but unvalidated
✅ Commonly overlooked by entrepreneurs  
✅ Testable through specific methods
✅ Based on the specific business context provided

Make insights sharp, actionable, and eye-opening. Challenge assumptions the entrepreneur likely hasn't questioned yet.`;

    // Gemini API 호출 (구조화된 JSON 출력)
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash", // Flash 모델 사용 (속도 최적화)
      contents: prompt,
      config: {
        temperature: 0.8, // 창의적 분석을 위해 높은 temperature
        responseMimeType: "application/json",
        responseSchema: riskAnalysisSchema,
        thinkingConfig: {
          thinkingBudget: 0, // 속도 향상을 위해 thinking 비활성화
        }
      }
    });

    console.log('✅ 리스크 분석 완료');

    // JSON 파싱 및 검증
    let riskAnalysis;
    try {
      riskAnalysis = JSON.parse(response.text);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      return res.status(500).json({
        error: 'Failed to parse risk analysis response',
        message: 'Invalid JSON format from AI'
      });
    }

    // 필수 키 검증
    const requiredKeys = ['market_risk', 'product_risk', 'competitive_risk'];
    const missingKeys = requiredKeys.filter(key => !riskAnalysis[key]);
    if (missingKeys.length > 0) {
      return res.status(500).json({
        error: 'Incomplete risk analysis',
        missingKeys
      });
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      data: {
        riskAnalysis,
        input: {
          customer,
          problem,
          solution
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 리스크 분석 오류:', error);
    
    res.status(500).json({
      error: 'Risk analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
