const axios = require('axios');

const AI_MODEL = 'GLM-4.5-AirX'; // 智谱4.5
const apiKey = process.env.ZHIPU_API_KEY || '5ea7fd40d8ea0017861ad27b3a0bf74c.63R1gemr7ha1Uj85';
const baseURL = 'https://open.bigmodel.cn/api/paas/v4';

/**
 * AI控制器 - 处理智谱AI对话
 */
class AIController {
  constructor() {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = AI_MODEL;
  }

  /**
   * 生成AI回复
   * @param {string} userMessage - 用户输入的消息
   * @returns {Promise<string>} AI生成的回复内容
   */
  async generateResponse(userMessage) {
    try {
      console.log('=== AI对话请求 ===');
      console.log('用户消息:', userMessage);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个友善的AI助手，请用简洁、友好的方式回复用户的消息。'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiReply = response.data.choices[0].message.content;
      console.log('AI回复:', aiReply);
      console.log('==================');
      
      return aiReply;
    } catch (error) {
      console.error('AI对话错误:', error.response?.data || error.message);
      
      // 返回默认回复
      return '抱歉，我现在无法回复您的消息，请稍后再试。';
    }
  }
}

module.exports = AIController;