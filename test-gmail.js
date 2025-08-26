const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailConnection() {
  console.log('🔍 Gmail 설정 확인 중...');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ 환경변수가 설정되지 않았습니다.');
    console.log('GMAIL_USER:', process.env.GMAIL_USER ? '설정됨' : '없음');
    console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '설정됨' : '없음');
    return;
  }
  
  console.log('📧 Gmail 계정:', process.env.GMAIL_USER);
  console.log('🔐 App Password:', process.env.GMAIL_APP_PASSWORD.substring(0, 4) + '****');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔄 SMTP 연결 테스트 중...');
    await transporter.verify();
    console.log('✅ Gmail SMTP 연결 성공!');
    
    // 테스트 이메일 발송
    console.log('📤 테스트 이메일 발송 중...');
    const mailInfo = await transporter.sendMail({
      from: {
        name: 'Pylot Test',
        address: process.env.GMAIL_USER
      },
      to: process.env.GMAIL_USER, // 자기 자신에게 발송
      subject: '🧪 Pylot Gmail 연결 테스트',
      html: `
        <h2>Gmail 연결 테스트 성공!</h2>
        <p>이 이메일이 수신되었다면 Gmail 설정이 올바르게 구성되었습니다.</p>
        <p><strong>테스트 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
        <p><strong>Message ID:</strong> 테스트 발송</p>
      `
    });
    
    console.log('✅ 테스트 이메일 발송 완료!');
    console.log('📬 Message ID:', mailInfo.messageId);
    console.log('📧 Gmail 받은편지함을 확인해보세요.');
    
  } catch (error) {
    console.error('❌ Gmail 연결 실패:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 해결 방법:');
      console.log('1. Gmail 2단계 인증이 활성화되어 있는지 확인');
      console.log('2. Google 계정 > 보안 > 앱 비밀번호에서 새 비밀번호 생성');
      console.log('3. 생성된 16자리 비밀번호를 GMAIL_APP_PASSWORD에 설정');
      console.log('4. 공백 없이 정확히 입력했는지 확인');
      console.log('\n📖 자세한 가이드: https://support.google.com/accounts/answer/185833');
    }
  }
}

testGmailConnection().catch(console.error);
