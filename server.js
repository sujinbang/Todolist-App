import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS 설정 - React 앱에서 접근 가능하도록
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// AI 피드백 API 엔드포인트
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '일기 내용이 필요합니다.' });
    }

    console.log('일기 내용 분석 중...');

    // Ollama API 호출
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        prompt: `당신은 따뜻하고 공감적인 AI 일기 코치입니다. 사용자의 일기를 읽고 짧고 따뜻한 피드백을 제공하세요.

일기 내용:
${content}

위 일기를 읽고 2-3문장으로 따뜻하고 공감적인 피드백을 한국어로 작성해주세요. 격식을 차리지 말고 친근하게 말해주세요.`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API 호출 실패');
    }

    const data = await response.json();
    const reflection = data.response.trim();

    console.log('AI 피드백 생성 완료');

    res.json({ reflection });

  } catch (error) {
    console.error('AI 피드백 생성 오류:', error);
    res.status(500).json({
      error: 'AI 피드백 생성에 실패했습니다.',
      reflection: '오늘 하루도 수고 많으셨어요. 적어주신 일기를 통해 오늘의 감정과 경험들을 되돌아볼 수 있어서 좋았습니다. 내일도 좋은 하루 되세요! 💙'
    });
  }
});

// 서버 상태 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동 중입니다.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI 일기 서버가 실행되었습니다!`);
  console.log(`📡 서버 주소: http://localhost:${PORT}`);
  console.log(`🤖 Qwen2.5 모델 준비 완료\n`);
});
