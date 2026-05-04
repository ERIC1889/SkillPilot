const asyncHandler = require('../middlewares/asyncHandler');
const aiService = require('../services/ai.service');
const ApiError = require('../utils/ApiError');

const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw ApiError.badRequest('메시지를 입력해 주세요');
  }
  if (message.length > 500) {
    throw ApiError.badRequest('메시지가 너무 깁니다 (500자 이내)');
  }

  try {
    const { reply } = await aiService.chatTurn({
      history: Array.isArray(history) ? history : [],
      message: message.trim(),
    });

    res.json({
      success: true,
      data: { reply: reply || '잠깐만요, 한 번 더 말해 주실래요?' },
    });
  } catch (err) {
    // OpenAI 호출 실패 시 — 프론트에서 mock fallback 으로 처리할 수 있도록 503 으로 명시
    console.warn('[assistant] chat failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'AI 응답을 받지 못했습니다',
    });
  }
});

module.exports = { chat };
