# 🔧 Gmail 설정 문제 해결 가이드

## ❌ 현재 오류
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

## 🔍 문제 진단 및 해결

### 1. Gmail 계정 확인
- **계정**: teampylot@gmail.com
- **상태**: 인증 실패

### 2. 해결 단계 (순서대로 진행)

#### Step 1: 2단계 인증 확인
```bash
# Google 계정 설정 확인
https://myaccount.google.com/security
```
- [ ] 2단계 인증이 **활성화**되어 있는지 확인
- [ ] SMS, 인증 앱, 또는 보안 키가 설정되어 있는지 확인

#### Step 2: 앱 비밀번호 재생성
```bash
# 기존 앱 비밀번호 삭제 후 새로 생성
https://myaccount.google.com/apppasswords
```

1. **기존 앱 비밀번호 삭제**:
   - Google 계정 > 보안 > 앱 비밀번호
   - 기존 "Pylot" 또는 "Mail" 관련 비밀번호 삭제

2. **새 앱 비밀번호 생성**:
   - "앱 비밀번호 생성" 클릭
   - 앱: "Mail" 선택
   - 기기: "기타(맞춤 이름)" 선택
   - 이름: "Pylot Server" 입력
   - **16자리 비밀번호 복사** (예: `abcd efgh ijkl mnop`)

#### Step 3: 환경변수 재설정
```bash
# .env 파일 수정
nano .env
```

`.env` 파일 내용:
```env
# Gmail 설정 (공백 제거 필수!)
GMAIL_USER=teampylot@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# 서버 설정
NODE_ENV=production
PORT=3001
```

⚠️ **주의사항**:
- 16자리 비밀번호에서 **공백 제거** 필수
- 따옴표 사용하지 않기
- 특수문자 그대로 입력

#### Step 4: 테스트 실행
```bash
# Gmail 연결 테스트
node test-gmail.js

# 성공 시 서버 실행
npm run server
```

### 3. 대안 해결 방법

#### 방법 1: OAuth2 사용 (복잡하지만 안전)
```javascript
// OAuth2 설정 (추후 구현 가능)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'teampylot@gmail.com',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    refreshToken: 'your-refresh-token'
  }
});
```

#### 방법 2: 다른 이메일 서비스 사용
```javascript
// SendGrid 사용
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Mailgun 사용
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
```

#### 방법 3: 임시로 테스트 계정 사용
```bash
# Gmail 설정 제거하고 테스트 계정 사용
unset GMAIL_USER
unset GMAIL_APP_PASSWORD
npm run server
```

### 4. 보안 검토 사항

#### Gmail 보안 설정 확인
1. **보안 수준이 낮은 앱의 액세스**: 비활성화 상태 확인 (정상)
2. **2단계 인증**: 활성화 필수
3. **최근 보안 활동**: 의심스러운 로그인 시도 확인

#### 방화벽/네트워크 확인
```bash
# SMTP 포트 연결 테스트
telnet smtp.gmail.com 587
# 또는
nc -zv smtp.gmail.com 587
```

### 5. 자주 발생하는 문제들

#### 문제 1: "Less secure app access"
- **해결**: 더 이상 지원되지 않음. 앱 비밀번호 사용 필수

#### 문제 2: "Please log in via your web browser"
- **해결**: CAPTCHA 인증 필요. 브라우저에서 Gmail 로그인 후 재시도

#### 문제 3: "Too many login attempts"
- **해결**: 15분 대기 후 재시도

#### 문제 4: 환경변수 인식 안됨
```bash
# 환경변수 확인
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD

# .env 파일 로드 확인
node -e "require('dotenv').config(); console.log(process.env.GMAIL_USER);"
```

### 6. 최종 확인 체크리스트

- [ ] Gmail 계정 2단계 인증 활성화
- [ ] 기존 앱 비밀번호 삭제
- [ ] 새 앱 비밀번호 생성 (16자리)
- [ ] .env 파일에 공백 없이 정확히 입력
- [ ] `node test-gmail.js` 성공
- [ ] 자기 자신에게 테스트 이메일 수신 확인

---

## 🚨 긴급 대안

Gmail이 계속 실패하면 **테스트 계정**으로 우선 진행:

```bash
# Gmail 설정 임시 제거
mv .env .env.backup
npm run server
```

이렇게 하면 Ethereal Email 테스트 계정으로 자동 전환되어 이메일 미리보기가 가능합니다.

---

**문의**: 추가 도움이 필요하면 언제든 말씀해주세요!
