import { GoogleGenAI } from "@google/genai";

const testGemini = async () => {
  try {
    console.log('🤖 Gemini API 테스트 시작...');
    
    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다');
    }
    
    console.log('🔑 API 키 확인 완료');

    // Gemini AI 클라이언트 초기화
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    console.log('🚀 Gemini 2.5 Pro 모델로 텍스트 생성 테스트...');

    // 기본 텍스트 생성 테스트 (Flash 모델로 먼저 테스트)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "안녕하세요! Pylot 서비스에 대해 간단히 소개해주세요. Pylot은 AI 기반 제품 테스팅 플랫폼입니다.",
      config: {
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0,
        }
      }
    });

    console.log('✅ 응답 수신 완료!');
    console.log('📝 생성된 텍스트:');
    console.log('=' .repeat(50));
    console.log(response.text);
    console.log('=' .repeat(50));

    // Gemini 2.5 Flash 모델 테스트 (더 빠른 응답)
    console.log('\n🚀 Gemini 2.5 Flash 모델로 빠른 응답 테스트...');
    
    const flashResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "AI가 어떻게 작동하는지 간단히 설명해주세요.",
      config: {
        temperature: 0.5,
        thinkingConfig: {
          thinkingBudget: 0, // Flash에서는 thinking 비활성화 가능
        }
      }
    });

    console.log('✅ Flash 모델 응답 완료!');
    console.log('📝 Flash 생성 텍스트:');
    console.log('=' .repeat(50));
    console.log(flashResponse.text);
    console.log('=' .repeat(50));

    // 스트리밍 테스트
    console.log('\n🌊 스트리밍 응답 테스트...');
    
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: "Pylot의 주요 기능 3가지를 나열해주세요.",
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        }
      }
    });

    console.log('📡 스트리밍 응답:');
    console.log('=' .repeat(50));
    
    for await (const chunk of streamResponse) {
      process.stdout.write(chunk.text);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 모든 테스트가 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('❌ Gemini API 테스트 실패:', error.message);
    console.error('🔍 오류 상세:', error);
  }
};

// 테스트 실행
testGemini();
