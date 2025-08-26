# 🚀 Pylot 완전 배포 가이드

## 📋 목차
1. [AWS EC2 배포](#aws-ec2-배포)
2. [Vercel + Railway 배포](#vercel--railway-배포)
3. [Heroku 배포](#heroku-배포)
4. [Netlify + Railway 배포](#netlify--railway-배포)
5. [Docker 컨테이너 배포](#docker-컨테이너-배포)
6. [도메인 연결 및 SSL 설정](#도메인-연결-및-ssl-설정)

---

## 🔧 사전 준비사항

### 1. Gmail App Password 설정
```bash
# 1. Gmail 2단계 인증 활성화
# 2. Google 계정 > 보안 > 앱 비밀번호 생성
# 3. 16자리 비밀번호 복사 (예: abcd efgh ijkl mnop)
```

### 2. 프로젝트 빌드 테스트
```bash
npm install
npm run build
npm run server  # 로컬에서 테스트
```

---

## 🏗️ AWS EC2 배포 (가장 추천)

### 1. EC2 인스턴스 생성
```bash
# AWS Console에서 EC2 인스턴스 생성
# - Ubuntu 22.04 LTS 선택
# - t3.micro (프리티어) 또는 t3.small
# - 보안 그룹: HTTP(80), HTTPS(443), SSH(22), Custom(3001) 포트 열기
```

### 2. 서버 접속 및 환경 설정
```bash
# SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리자)
sudo npm install -g pm2

# Git 설치
sudo apt install git -y

# Nginx 설치 (리버스 프록시)
sudo apt install nginx -y
```

### 3. 프로젝트 배포
```bash
# 프로젝트 클론
git clone https://github.com/your-username/pylot.git
cd pylot

# 의존성 설치
npm install

# 환경 변수 설정
nano .env
```

`.env` 파일 내용:
```env
NODE_ENV=production
PORT=3001
GMAIL_USER=teampylot@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_password
```

```bash
# 프로젝트 빌드
npm run build

# PM2로 서버 실행
pm2 start server.js --name "pylot"
pm2 startup
pm2 save
```

### 4. Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/pylot
```

Nginx 설정 파일:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # React 정적 파일
    location / {
        root /home/ubuntu/pylot/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 요청 프록시
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx 설정 활성화
sudo ln -s /etc/nginx/sites-available/pylot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. 방화벽 설정
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🌐 Vercel + Railway 배포

### 1. 프론트엔드 (Vercel)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 vercel.json 생성
```

`vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-railway-app.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

```bash
# 배포
vercel --prod
```

### 2. 백엔드 (Railway)
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 생성
railway init

# 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set GMAIL_USER=teampylot@gmail.com
railway variables set GMAIL_APP_PASSWORD=your_password

# 배포
railway up
```

---

## 🔴 Heroku 배포

### 1. Heroku 설정
```bash
# Heroku CLI 설치
# https://devcenter.heroku.com/articles/heroku-cli

# 로그인
heroku login

# 앱 생성
heroku create pylot-app

# 환경 변수 설정
heroku config:set NODE_ENV=production
heroku config:set GMAIL_USER=teampylot@gmail.com
heroku config:set GMAIL_APP_PASSWORD=your_password
```

### 2. package.json 수정
```json
{
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 3. Procfile 생성
```
web: node server.js
```

### 4. 배포
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 🎯 Netlify + Railway 배포

### 1. 프론트엔드 (Netlify)
```bash
# netlify.toml 생성
```

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-railway-app.railway.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```bash
# Git 저장소에 푸시 후 Netlify에서 연결
```

---

## 🐳 Docker 컨테이너 배포

### 1. Dockerfile 생성
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["dumb-init", "node", "server.js"]
```

### 2. .dockerignore 생성
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
```

### 3. Docker 빌드 및 실행
```bash
# 이미지 빌드
docker build -t pylot-app .

# 컨테이너 실행
docker run -d \
  --name pylot \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e GMAIL_USER=teampylot@gmail.com \
  -e GMAIL_APP_PASSWORD=your_password \
  pylot-app
```

### 4. Docker Compose
`docker-compose.yml`:
```yaml
version: '3.8'
services:
  pylot:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GMAIL_USER=teampylot@gmail.com
      - GMAIL_APP_PASSWORD=your_password
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - pylot
    restart: unless-stopped
```

---

## 🌍 도메인 연결 및 SSL 설정

### 1. 도메인 DNS 설정
```
# A 레코드 설정
@ -> EC2 IP 주소
www -> EC2 IP 주소

# 또는 CNAME (Vercel/Netlify)
@ -> your-app.vercel.app
www -> your-app.vercel.app
```

### 2. Cloudflare 설정 (추천)
```bash
# 1. Cloudflare에 도메인 추가
# 2. DNS 레코드 설정
# 3. SSL/TLS > Full (strict) 선택
# 4. Speed > Optimization 설정
```

---

## 🔧 모니터링 및 로그 설정

### 1. PM2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs pylot

# 메모리/CPU 사용량
pm2 show pylot
```

### 2. Nginx 로그
```bash
# 접근 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 3. 애플리케이션 로그
```bash
# PM2 로그 로테이션
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🚨 트러블슈팅

### 1. 이메일 발송 실패
```bash
# Gmail 설정 확인
- 2단계 인증 활성화 여부
- App Password 정확성
- 환경 변수 설정 확인
```

### 2. 빌드 실패
```bash
# 메모리 부족 시
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 3. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :3001
sudo kill -9 PID
```

---

## 📊 성능 최적화

### 1. Nginx Gzip 압축
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. PM2 클러스터 모드
```bash
pm2 start server.js --name pylot -i max
```

### 3. Redis 캐싱 (선택사항)
```bash
# Redis 설치
sudo apt install redis-server -y

# Node.js에서 Redis 사용
npm install redis
```

---

## 🎉 배포 완료 체크리스트

- [ ] 서버 정상 실행 확인
- [ ] 이메일 발송 테스트
- [ ] SSL 인증서 설정
- [ ] 도메인 연결 확인
- [ ] 모니터링 설정
- [ ] 백업 시스템 구축
- [ ] 보안 설정 완료

**축하합니다! 🎊 Pylot이 성공적으로 배포되었습니다!**

---

## 💡 추가 팁

1. **정기 백업**: 데이터베이스와 파일 시스템 정기 백업
2. **모니터링**: Uptime Robot, Pingdom 등으로 서비스 모니터링
3. **CDN**: Cloudflare, AWS CloudFront로 성능 향상
4. **보안**: 정기적인 보안 업데이트와 취약점 점검

문의사항: teampylot@gmail.com
