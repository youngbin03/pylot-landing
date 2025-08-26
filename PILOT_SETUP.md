# Pylot 파일럿 등록 시스템 설정 가이드

## 🚀 완성된 기능

### 1. 프론트엔드 (React)
- ✅ 파일럿 등록 모달 UI
- ✅ 사용자 정보 입력 폼 (이메일, 성별, 나이, 직업군)
- ✅ 보상 정보 표시 (3,900원~15,000원)
- ✅ 성공/실패 상태 표시
- ✅ "지금 파일럿 되기" 버튼 연결

### 2. 백엔드 (Node.js/Express)
- ✅ API 엔드포인트: `/api/pilot-registration`
- ✅ 입력 데이터 검증
- ✅ 이메일 자동 발송 시스템
- ✅ 관리자 알림 이메일
- ✅ 에러 처리 및 로깅

### 3. 이메일 시스템 (Nodemailer)
- ✅ Gmail SMTP 연동
- ✅ HTML 이메일 템플릿
- ✅ 환영 메시지 자동 발송
- ✅ 관리자 알림 기능

## ⚙️ 설정 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# Gmail 설정
GMAIL_USER=teampylot@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# 서버 설정
PORT=3001

# 환경
NODE_ENV=development
```

### 3. Gmail App Password 설정
1. Gmail 계정에 2단계 인증 활성화
2. Google 계정 설정 > 보안 > 앱 비밀번호 생성
3. 생성된 16자리 비밀번호를 `GMAIL_APP_PASSWORD`에 입력

### 4. 서버 실행
```bash
# 개발 모드 (프론트엔드 + 백엔드 분리)
npm run dev  # 터미널 1: 프론트엔드 (포트 3000)
npm run server  # 터미널 2: 백엔드 (포트 3001)

# 또는 프로덕션 모드
npm start  # 빌드 후 통합 서버 실행
```

## 📧 이메일 템플릿

### 사용자 환영 이메일
- 🎉 축하 메시지
- 💰 보상 정보 (3,900원~15,000원)
- 📋 등록 정보 확인
- 📱 다음 단계 안내
- 🎯 테스트 유형 소개

### 관리자 알림 이메일
- 👤 새 파일럿 정보
- 📊 등록 통계
- ⏰ 등록 시간

## 🔧 API 엔드포인트

### POST `/api/pilot-registration`
파일럿 등록 및 환영 이메일 발송

**요청 데이터:**
```json
{
  "email": "user@example.com",
  "gender": "male|female",
  "age": "20-29",
  "occupation": "it"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "파일럿 등록이 완료되었습니다. 환영 이메일을 확인해주세요."
}
```

### GET `/api/health`
서버 상태 확인

## 🎨 UI/UX 특징

- **모바일 최적화**: 반응형 디자인
- **다크 테마**: 검은 배경 + 흰색 텍스트
- **글래시 효과**: 반투명 배경과 블러 효과
- **실시간 피드백**: 로딩 상태 및 성공/실패 메시지
- **접근성**: 포커스 아웃라인 제거 및 키보드 네비게이션

## 🛠️ 트러블슈팅

### 1. 이메일 발송 실패
- Gmail App Password 확인
- 2단계 인증 활성화 여부 확인
- 환경 변수 설정 확인

### 2. API 호출 실패
- 백엔드 서버 실행 상태 확인
- 포트 충돌 확인 (3001번 포트)
- CORS 설정 확인

### 3. 모달이 열리지 않음
- React 상태 관리 확인
- 버튼 onClick 이벤트 확인
- 콘솔 에러 메시지 확인

## 📊 향후 개선 사항

1. **데이터베이스 연동**: 파일럿 정보 저장
2. **이메일 큐 시스템**: 대량 발송 최적화
3. **관리자 대시보드**: 파일럿 관리 UI
4. **A/B 테스트**: 등록 전환율 개선
5. **소셜 로그인**: 간편 회원가입

## 🚀 배포 가이드

### Vercel 배포
```bash
npm run build
# Vercel에 dist 폴더 업로드
```

### Heroku 배포
```bash
# package.json의 start 스크립트 사용
git push heroku main
```

---

**문의사항**: teampylot@gmail.com
**개발 완료일**: 2025년 1월
