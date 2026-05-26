# Todolist-App (Daily Planner)

다양한 일상 관리 기능을 하나로 통합한 올인원 생산성 애플리케이션입니다.

## 1. 요약 (Summary)
**Todolist-App**은 할 일 목록(Todo List), 루틴 관리(Routine Manager), 다이어리(Diary), 독서 기록(Reading Log) 기능을 제공하는 통합 라이프 매니징 애플리케이션입니다. React와 Firebase를 기반으로 실시간 데이터 동기화를 지원하며, Capacitor를 통해 웹뿐만 아니라 모바일(Android, iOS) 환경에서도 최적화된 사용자 경험을 제공합니다.

## 2. 배경 (Background)
단순한 메모나 할 일 관리 도구만으로는 복잡한 현대인의 일상을 체계적으로 관리하기 어렵다는 문제점에서 출발했습니다. 루틴화된 습관, 매일의 감정 기록, 지식 습득을 위한 독서 기록 등을 별도의 앱이 아닌 하나의 플랫폼에서 유기적으로 관리함으로써, 사용자가 자신의 삶의 패턴을 더 깊이 이해하고 개선할 수 있도록 설계되었습니다.

## 3. 의미 (Meaning)
이 프로젝트는 **'파편화된 일상의 통합'**에 큰 의미를 둡니다.
- **데이터 통합:** Firebase를 통한 실시간 동기화로 기기 간 경계 없이 정보를 관리합니다.
- **습관 형성:** 루틴 관리 기능을 통해 단순한 할 일을 넘어 지속 가능한 습관 형성을 돕습니다.
- **자기 성찰:** 다이어리와 독서 기록을 통해 내면의 성장과 지식의 축적을 시각화합니다.
- **크로스 플랫폼:** Capacitor를 활용하여 단일 코드베이스로 웹과 네이티브 앱 환경을 모두 아우르는 확장성을 가집니다.

## 4. 스킬 (Skills)

### Frontend
- **React 19 & TypeScript:** 안정적이고 선언적인 UI 컴포넌트 개발
- **Vite:** 빠르고 효율적인 빌드 및 개발 환경 구축
- **Tailwind CSS:** 유연하고 반응형인 스타일링
- **Framer Motion:** 부드러운 인터랙션 및 애니메이션 구현
- **Lucide React:** 직관적인 아이콘 시스템

### Backend & Infrastructure
- **Firebase (Firestore & Auth):** 실시간 데이터베이스 및 안전한 사용자 인증
- **Node.js & Express:** AI 피드백 처리를 위한 로컬 서버 구축
- **Ollama (Qwen2.5):** 로컬 LLM을 활용한 일기 내용 분석 및 피드백 생성
- **Capacitor:** 웹 기술을 네이티브 앱(Android/iOS)으로 변환 및 하드웨어 연동 준비

### DevOps & Tools
- **Concurrently:** 클라이언트(Vite)와 AI 서버(Node.js) 동시 실행 관리
- **ESLint & TypeScript Check:** 코드 품질 및 타입 안정성 유지

## 5. Setup & Usage

### 필수 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn
- Firebase 프로젝트 (설정 파일 필요)
- [Ollama](https://ollama.com/) (AI 피드백 기능을 사용하려는 경우)
  - `qwen2.5:7b` 모델 설치 필요: `ollama run qwen2.5:7b`

### 설치 및 로컬 실행
1. 저장소를 클론합니다.
   ```bash
   git clone <repository-url>
   cd Todolist-App
   ```

2. 의존성 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. Firebase 설정 파일을 구성합니다.
   - `firebase-applet-config.json` 파일을 루트 또는 지정된 경로에 배치합니다.

4. 클라이언트와 AI 서버를 동시에 실행합니다.
   ```bash
   npm run dev:all
   ```
   - 클라이언트: `http://localhost:3000`
   - AI 서버: `http://localhost:3001`

   *참고: AI 서버만 별도로 실행하려면 `npm run server`를 사용하세요.*

### 모바일 빌드 (Capacitor)
1. 프로젝트를 빌드합니다.
   ```bash
   npm run build
   ```

2. 네이티브 플랫폼에 동기화합니다.
   ```bash
   npx cap sync
   ```

3. 각 플랫폼 개발 도구(Android Studio, Xcode)를 통해 실행합니다.
   ```bash
   npx cap open android
   npx cap open ios
   ```
