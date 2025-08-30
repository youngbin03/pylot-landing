import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Railway 풀스택: 프론트엔드와 백엔드를 함께 서빙
app.use(express.static('dist')); // Vite build output

// 이메일 transporter 초기화
let transporter = null;

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

const initializeTransporter = async () => {
  if (process.env.GMAIL_APP_PASSWORD) {
    // Gmail 설정이 있는 경우 (우선순위)
    console.log('🔐 Gmail 계정으로 이메일 서비스 초기화');
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail 서비스 직접 사용
        auth: {
          user: process.env.GMAIL_USER || 'teampylot@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') // 공백 제거
        },
        pool: true, // 연결 풀 사용
        maxConnections: 1,
        rateDelta: 20000, // 20초 간격
        rateLimit: 5, // 20초당 5개 이메일
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000, // 60초 타임아웃
        greetingTimeout: 30000, // 30초 그리팅 타임아웃
        socketTimeout: 60000 // 60초 소켓 타임아웃
      });
      
      // 연결 테스트
      await transporter.verify();
      console.log('✅ Gmail SMTP 연결 확인 완료');
      return transporter;
    } catch (error) {
      console.error('❌ Gmail 인증 실패:', error.message);
      console.error('📧 Gmail 설정을 확인해주세요:');
      console.error('   - GMAIL_USER:', process.env.GMAIL_USER);
      console.error('   - GMAIL_APP_PASSWORD 길이:', process.env.GMAIL_APP_PASSWORD?.length);
      throw new Error('Gmail 인증에 실패했습니다. 앱 비밀번호를 확인해주세요.');
    }
  }
  
  // Gmail 환경변수가 없는 경우
  console.error('❌ Gmail 환경변수가 설정되지 않았습니다');
  throw new Error('GMAIL_APP_PASSWORD 환경변수가 필요합니다');
};

// 이메일 템플릿 함수
const createWelcomeEmail = (userData) => {
  const { email, gender, age, occupation } = userData;
  
  const genderText = gender === 'male' ? '남성' : gender === 'female' ? '여성' : '';
  const occupationLabels = {
    student: '학생',
    office_worker: '사무직',
    service: '서비스업',
    manufacturing: '제조업',
    education: '교육',
    healthcare: '의료/보건',
    it: 'IT/기술',
    finance: '금융',
    marketing: '마케팅/광고',
    freelancer: '프리랜서',
    housewife: '주부',
    other: '기타'
  };
  
      return {
      subject: 'Pylot 파일럿 등록을 축하합니다!',
      html: `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="format-detection" content="telephone=no">
          <meta name="x-apple-disable-message-reformatting">
          <title>Pylot 파일럿 환영</title>
          <style>
            @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css');
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              line-height: 1.6; 
              color: white;
              background: #000000;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              margin: 0;
              padding: 0;
              width: 100% !important;
              min-width: 100%;
              height: 100% !important;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #000000;
              border-radius: 0;
              width: 100% !important;
              min-height: 100vh;
            }
            table {
              border-spacing: 0;
              border-collapse: collapse;
              width: 100% !important;
            }
            .banner-img {
              width: 100%;
              height: auto;
              display: block;
              max-height: 200px;
              object-fit: cover;
            }
            .banner::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: linear-gradient(transparent, #000000);
            }
            .content { 
              padding: 40px 30px;
              background: #000000;
            }
            .title { 
              font-size: 32px; 
              font-weight: 700; 
              color: white;
              margin-bottom: 16px;
              letter-spacing: -0.02em;
            }
            .subtitle { 
              font-size: 18px; 
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 40px;
              font-weight: 400;
            }
            .section { 
              margin-bottom: 40px;
            }
            .section-title { 
              font-size: 20px; 
              font-weight: 600;
              color: white;
              margin-bottom: 16px;
              letter-spacing: -0.01em;
            }
            .section-content { 
              font-size: 16px; 
              color: rgba(255, 255, 255, 0.8);
              line-height: 1.7;
              text-align: left;
            }
            .reward-box { 
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              backdrop-filter: blur(10px);
            }
            .reward-amount {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 8px;
            }
            .reward-desc {
              font-size: 16px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.5;
              text-align: left;
            }
            .user-info {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              padding: 32px;
              margin: 32px 0 16px 0;
              backdrop-filter: blur(10px);
            }
            .user-info-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              font-size: 16px;
              min-height: 56px;
            }
            .user-info-item:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .user-info-item:first-child {
              padding-top: 0;
            }
            .user-info-label {
              color: rgba(255, 255, 255, 0.8);
              font-weight: 500;
              font-size: 15px;
              min-width: 80px;
              letter-spacing: -0.01em;
            }
            .user-info-value {
              color: white;
              font-weight: 600;
              font-size: 16px;
              text-align: right;
              flex: 1;
              margin-left: 24px;
            }
            .process-list {
              list-style: none;
              padding: 0;
            }
            .process-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 24px;
              padding: 0;
              width: 100%;
              box-sizing: border-box;
            }
            .process-number {
              width: 32px;
              height: 32px;
              background: white;
              color: #000000;
              border-radius: 50%;
              font-size: 14px;
              font-weight: 700;
              margin-right: 16px;
              flex-shrink: 0;
              line-height: 32px;
              text-align: center;
              display: inline-block;
              vertical-align: top;
            }
            .process-content {
              flex: 1;
              min-width: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .process-title {
              font-size: 16px;
              font-weight: 600;
              color: white;
              margin-bottom: 6px;
              line-height: 1.4;
              text-align: left;
            }
            .process-desc {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.6;
              text-align: left;
              margin: 0;
              padding: 0;
            }
                              .cta-section {
                    text-align: center;
                    margin: 50px 0 10px 0;
                    padding: 40px 0 10px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                  }
            .cta-text {
              font-size: 16px;
              color: rgba(255, 255, 255, 0.7) !important;
              margin-bottom: 24px;
              line-height: 1.6;
              text-align: left;
              padding-bottom: 8px;
            }
            .cta-button {
              display: inline-block;
              background: white;
              color: #000000 !important;
              padding: 16px 32px;
              text-decoration: none !important;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
            }
            .cta-button:visited {
              color: #000000 !important;
            }
            .cta-button:hover {
              color: #000000 !important;
              background: rgba(255, 255, 255, 0.9);
            }
            .footer {
              text-align: center;
              padding: 30px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              background: #000000;
            }
            .footer p {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.5);
              margin: 4px 0;
            }
                              .footer a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                  }
                  .user-info-simple {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin: 32px 0;
                    backdrop-filter: blur(10px);
                    font-size: 16px;
                    color: white;
                    text-align: center;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                  }
                  .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 0;
                  }
                  .section-header .section-title {
                    margin-bottom: 0;
                  }
                  .info-badge {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    text-transform: lowercase;
                    backdrop-filter: blur(5px);
                  }
            @media (max-width: 600px) {
              .content { 
                padding: 24px 16px; 
                width: 100% !important;
                box-sizing: border-box;
              }
              .title { 
                font-size: 24px; 
                line-height: 1.3;
                margin-bottom: 12px;
              }
              .subtitle { 
                font-size: 14px; 
                line-height: 1.5;
                margin-bottom: 32px;
              }
              .banner { height: 160px; }
              .user-info {
                padding: 24px 16px;
                margin: 24px 0;
              }
              .process-item {
                margin-bottom: 20px;
                padding-right: 8px;
              }
              .process-number {
                width: 28px;
                height: 28px;
                line-height: 28px;
                font-size: 13px;
                margin-right: 12px;
              }
              .process-title {
                font-size: 14px;
                margin-bottom: 4px;
              }
              .process-desc {
                font-size: 12px;
                line-height: 1.5;
              }
              .reward-box {
                padding: 20px 16px;
                margin: 20px 0;
              }
              .reward-amount {
                font-size: 18px;
              }
              .cta-section {
                padding: 32px 0 10px 0;
                margin: 40px 0 10px 0;
              }
              .section-content {
                font-size: 14px;
                line-height: 1.6;
              }
              .section-title {
                font-size: 18px;
                margin-bottom: 12px;
              }
              .cta-text {
                font-size: 14px;
                line-height: 1.6;
              }
              .user-info-simple {
                font-size: 14px;
                padding: 16px 20px;
              }
              .reward-desc {
                font-size: 13px;
                line-height: 1.5;
              }
            }
          </style>
        </head>
        <body>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding: 0;">
                <div class="container">
                  <img src="cid:pylotBanner" class="banner-img" alt="Pylot Banner" />
            
            <div class="content">
              <h1 class="title">파일럿 등록을 축하합니다</h1>
              <p class="subtitle">데이터 기반 제품 테스트의 새로운 경험이 시작됩니다</p>
              
              <!-- 중요한 정보를 먼저 배치 -->
              <div class="reward-box">
                <div class="reward-amount">3,900원 ~ 15,000원</div>
                <div class="reward-desc">
                  한 번의 테스트 참여로 받을 수 있는 리워드입니다.<br>
                  테스트 완료와 동시에 보상이 지급되어, 여러분의 소중한 시간에 대한 합리적인 대가를 받으세요.
                </div>
              </div>
              
              <div class="section">
                <p class="section-content">
                  Pylot 파일럿으로 등록해주셔서 진심으로 감사합니다.<br>
                  혁신적인 제품과 서비스의 첫 번째 사용자가 되어주세요.
                </p>
              </div>
              
                              <div class="section">
                  <div class="section-header">
                    <h2 class="section-title">등록 정보</h2>
                  </div>
                  <div class="user-info-simple">
                    ${genderText} · ${age}세 · ${occupationLabels[occupation] || occupation}
                  </div>
                </div>
              
              <div class="section">
                <h2 class="section-title">파일럿 활동 프로세스</h2>
                <ol class="process-list">
                  <li class="process-item">
                    <div class="process-number">1</div>
                    <div class="process-content">
                      <div class="process-title">테스트 매칭</div>
                      <div class="process-desc">귀하의 프로필에 최적화된 테스트 기회를 이메일로 알려드립니다</div>
                    </div>
                  </li>
                  <li class="process-item">
                    <div class="process-number">2</div>
                    <div class="process-content">
                      <div class="process-title">참여 신청</div>
                      <div class="process-desc">관심 있는 테스트에 간편하게 참여 신청하세요</div>
                    </div>
                  </li>
                  <li class="process-item">
                    <div class="process-number">3</div>
                    <div class="process-content">
                      <div class="process-title">테스트 수행</div>
                      <div class="process-desc">평균 15분 내외의 직관적이고 재미있는 테스트를 진행합니다</div>
                    </div>
                  </li>
                  <li class="process-item">
                    <div class="process-number">4</div>
                    <div class="process-content">
                      <div class="process-title">즉시 보상</div>
                      <div class="process-desc">테스트 완료 즉시 약속된 리워드를 받으세요</div>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div class="cta-section">
                <p class="cta-text">
                  궁금한 점이 있으시거나 도움이 필요하시면 언제든 문의해주세요.
                  Pylot과 함께 혁신의 최전선에서 활동해주셔서 감사합니다.
                </p>
                <a href="https://www.testpylot.com" class="cta-button">Pylot 홈페이지 방문하기</a>
              </div>
            </div>
            
            <div class="footer">
              <p>이 이메일은 Pylot 파일럿 등록 확인을 위해 자동으로 발송되었습니다.</p>
              <p>© 2025 Pylot. All rights reserved.</p>
              <p>문의: <a href="mailto:teampylot@gmail.com">teampylot@gmail.com</a></p>
                </div>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: [{
        filename: 'baner.webp',
        path: path.join(__dirname, 'public/icons/baner.webp'),
        cid: 'pylotBanner'
      }]
    };
};

// Lean Canvas API 엔드포인트
app.post('/api/lean-canvas', async (req, res) => {
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

    // Lean Canvas JSON 스키마 정의
    const leanCanvasSchema = {
      type: Type.OBJECT,
      properties: {
        problem: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "해결하려는 고객의 상위 1~3개 문제와 기존 대안의 한계"
        },
        customer_segments: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "핵심 타겟 고객과 그들의 인구통계학적/심리적 특징"
        },
        unique_value_proposition: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "고객이 우리 제품을 써야만 하는 명확하고 매력적인 메시지"
        },
        solution: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "각 문제를 해결할 핵심 기능 3가지"
        },
        channels: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "고객에게 도달할 방법들"
        },
        revenue_streams: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "수익을 창출하는 방법들"
        },
        cost_structure: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "서버비, 마케팅비, 인건비 등 고정/변동 비용"
        },
        key_metrics: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "비즈니스 성과를 판단할 핵심 지표들"
        },
        unfair_advantage: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "경쟁사가 쉽게 따라할 수 없는 우리만의 강점"
        }
      },
      propertyOrdering: [
        "problem", "customer_segments", "unique_value_proposition",
        "solution", "channels", "revenue_streams", "cost_structure",
        "key_metrics", "unfair_advantage"
      ],
      required: [
        "problem", "customer_segments", "unique_value_proposition", 
        "solution", "channels", "revenue_streams", "cost_structure",
        "key_metrics", "unfair_advantage"
      ]
    };

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
        input: { customer, problem, solution },
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
});

// 파일럿 등록 API 엔드포인트
app.post('/api/pilot-registration', async (req, res) => {
  try {
    const { email, gender, age, occupation } = req.body;
    
    // 입력 데이터 검증
    if (!email || !gender || !age || !occupation) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }
    
    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 주소를 입력해주세요.'
      });
    }
    
    // 환영 이메일 생성
    const emailContent = createWelcomeEmail({ email, gender, age, occupation });
    
    // 이메일 발송
    if (!transporter) {
      transporter = await initializeTransporter();
    }
    const currentTransporter = await Promise.resolve(transporter);
    
    const mailOptions = {
      from: {
        name: 'Pylot Team',
        address: process.env.GMAIL_USER || 'teampylot@gmail.com'
      },
      to: email,
      ...emailContent
    };
    
    const info = await currentTransporter.sendMail(mailOptions);
    
    // 테스트 계정 사용 시 미리보기 URL 로깅
    if (!process.env.GMAIL_APP_PASSWORD) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('✉️  사용자 환영 이메일 미리보기:', previewUrl);
      }
    } else {
      console.log('✅ Gmail로 환영 이메일 발송 완료:', email);
    }
    
    // 관리자에게도 알림 이메일 발송
    const adminMailOptions = {
      from: {
        name: 'Pylot System',
        address: process.env.GMAIL_USER || 'teampylot@gmail.com'
      },
      to: process.env.GMAIL_USER || 'teampylot@gmail.com',
      subject: '새로운 파일럿 등록 알림',
      html: `
        <h2>새로운 파일럿이 등록되었습니다</h2>
        <ul>
          <li><strong>이메일:</strong> ${email}</li>
          <li><strong>성별:</strong> ${gender === 'male' ? '남성' : '여성'}</li>
          <li><strong>나이:</strong> ${age}세</li>
          <li><strong>직업군:</strong> ${occupation}</li>
          <li><strong>등록 시간:</strong> ${new Date().toLocaleString('ko-KR')}</li>
        </ul>
      `
    };
    
    const adminInfo = await currentTransporter.sendMail(adminMailOptions);
    
    // 테스트 계정 사용 시 관리자 이메일 미리보기 URL도 로깅
    if (!process.env.GMAIL_APP_PASSWORD) {
      const adminPreviewUrl = nodemailer.getTestMessageUrl(adminInfo);
      if (adminPreviewUrl) {
        console.log('📋 관리자 알림 이메일 미리보기:', adminPreviewUrl);
      }
    } else {
      console.log('✅ Gmail로 관리자 알림 이메일 발송 완료');
    }
    
    // 성공 응답
    res.json({
      success: true,
      message: '파일럿 등록이 완료되었습니다. 환영 이메일을 확인해주세요.'
    });
    
  } catch (error) {
    console.error('파일럿 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API 서버 전용 - 프론트엔드는 Vercel에서 별도 배포됨
app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'API 엔드포인트를 찾을 수 없습니다',
    message: '프론트엔드는 Vercel에서 별도 배포됩니다'
  });
});

// Risk Analysis API 엔드포인트
app.post('/api/risk-analysis', async (req, res) => {
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

    // 리스크 분석 JSON 스키마 정의
    const riskAnalysisSchema = {
      type: Type.OBJECT,
      properties: {
        market_risk: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "시장 리스크 제목" },
            assumption: { type: Type.STRING, description: "사용자가 가정하고 있는 내용" },
            uncertainty: { type: Type.STRING, description: "실제 불확실한 부분" },
            impact: { type: Type.STRING, description: "비즈니스에 미칠 영향" },
            validation_method: { type: Type.STRING, description: "검증 방법 제안" },
            risk_level: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "리스크 수준" }
          },
          required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
        },
        product_risk: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "제품 리스크 제목" },
            assumption: { type: Type.STRING, description: "사용자가 가정하고 있는 내용" },
            uncertainty: { type: Type.STRING, description: "실제 불확실한 부분" },
            impact: { type: Type.STRING, description: "비즈니스에 미칠 영향" },
            validation_method: { type: Type.STRING, description: "검증 방법 제안" },
            risk_level: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "리스크 수준" }
          },
          required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
        },
        competitive_risk: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "경쟁 리스크 제목" },
            assumption: { type: Type.STRING, description: "사용자가 가정하고 있는 내용" },
            uncertainty: { type: Type.STRING, description: "실제 불확실한 부분" },
            impact: { type: Type.STRING, description: "비즈니스에 미칠 영향" },
            validation_method: { type: Type.STRING, description: "검증 방법 제안" },
            risk_level: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "리스크 수준" }
          },
          required: ["title", "assumption", "uncertainty", "impact", "validation_method", "risk_level"]
        }
      },
      propertyOrdering: ["market_risk", "product_risk", "competitive_risk"],
      required: ["market_risk", "product_risk", "competitive_risk"]
    };

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
      model: "gemini-2.5-pro", // Pro 모델 사용 (더 깊은 분석을 위해)
      contents: prompt,
      config: {
        temperature: 0.8, // 창의적 분석을 위해 높은 temperature
        responseMimeType: "application/json",
        responseSchema: riskAnalysisSchema
        // gemini-2.5-pro는 thinking 모드를 비활성화할 수 없음
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
        input: { customer, problem, solution },
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
});

app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📧 이메일 서비스: ${process.env.GMAIL_APP_PASSWORD ? 'Gmail 설정됨' : '테스트 모드'}`);
  
  // 서버 시작 시 transporter 초기화
  try {
    transporter = await initializeTransporter();
    console.log('✅ 이메일 서비스 초기화 완료');
  } catch (error) {
    console.error('❌ 이메일 서비스 초기화 실패:', error.message);
  }
});
