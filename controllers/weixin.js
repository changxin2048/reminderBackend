const crypto = require('crypto');
const xml2js = require('xml2js');
const axios = require('axios');
const AIController = require('./ai');

// TODO: 需要在配置文件中设置微信 Token
// 请在 config/config.js 中添加 WECHAT_TOKEN 配置项
const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'aaa';

// TODO: 需要在环境变量中设置微信公众号的AppID和AppSecret
// 请在 .env 文件中添加 WECHAT_APPID 和 WECHAT_APPSECRET 配置项
const WECHAT_APPID = process.env.WECHAT_APPID || 'wxb064bf2a88950651';
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET || '4fbf1607f1f786ecb4ae56cd1cdad3fe';

// TODO: 测试阶段需要设置一个真实的用户openid
// 可以通过微信公众号后台或者用户关注时获取
const TEST_OPENID = process.env.TEST_OPENID || 'superx2048';

/*
 * 微信控制器类
 */
class WeixinController {
  
  
  /**
   * 验证微信服务器签名
   * 按照微信官方文档要求：将token、timestamp、nonce三个参数进行字典序排序，拼接后sha1加密
   * 注意：URL验证场景只需要token、timestamp、nonce三个参数，不包含encrypt_msg
   * @param {string} signature 微信加密签名
   * @param {string} timestamp 时间戳
   * @param {string} nonce 随机数
   * @returns {boolean} 验证结果
   */
  static checkSignature(signature, timestamp, nonce) {
    try {
      // 使用预定义的WECHAT_TOKEN常量
      const token = WECHAT_TOKEN;
      
      // 将token、timestamp、nonce三个参数进行字典序排序（对应PHP的sort($tmpArr, SORT_STRING)）
      const tmpArr = [timestamp, nonce,token];
      tmpArr.sort(); // JavaScript的sort()默认按字典序排序
      
      // 将三个参数字符串拼接成一个字符串（对应PHP的implode($tmpArr)）
      const tmpStr = tmpArr.join('');
      
      // 进行sha1加密（对应PHP的sha1($tmpStr)）
      const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
      
      // 输出调试信息
      console.log('=== 签名校验调试信息 ===');
      console.log('原始参数: token=' + token + ', timestamp=' + timestamp + ', nonce=' + nonce);
      console.log('排序后数组:', tmpArr);
      console.log('拼接字符串:', tmpStr);
      console.log('计算的hash:', hash);
      console.log('微信signature:', signature);
      console.log('校验结果:', hash === signature);
      console.log('========================');
      
      // 与signature对比
      return hash === signature;
    } catch (error) {
      console.error('签名校验过程出错:', error);
      return false;
    }
  }

  /**
   * 接收微信消息处理方法
   * POST /weixin/msg
   * 用于接收微信发送的消息并回复用户内容
   */
  static async receiveMessage(req, res) {
    try {
      // 获取原始XML数据
      let xmlData = '';
      
      // 如果req.body是字符串，直接使用；否则从req获取原始数据
      if (typeof req.body === 'string') {
        xmlData = req.body;
      } else {
        // 处理原始请求数据
        xmlData = req.rawBody || JSON.stringify(req.body);
      }
      
      console.log('=== 接收到微信消息 ===');
      console.log('时间:', new Date().toISOString());
      console.log('原始XML数据:', xmlData);
      console.log('========================');
      
      // 解析XML数据
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlData);
      
      const xml = result.xml;
      const fromUserName = xml.FromUserName;
      const toUserName = xml.ToUserName;
      const msgType = xml.MsgType;
      const content = xml.Content;
      const createTime = xml.CreateTime;
      
      console.log('=== 解析后的消息内容 ===');
      console.log('发送方:', fromUserName);
      console.log('接收方:', toUserName);
      console.log('消息类型:', msgType);
      console.log('消息内容:', content);
      console.log('========================');
      
      // 只处理文本消息
      if (msgType === 'text' && content) {
        // 创建AI控制器实例
        const aiController = new AIController();
        
        // 使用AI生成回复内容
        const aiReply = await aiController.generateResponse(content);
        
        // 构造回复XML消息（将FromUserName和ToUserName互换）
        const replyTime = Math.floor(Date.now() / 1000);
        const replyXml = `<xml>
<ToUserName><![CDATA[${fromUserName}]]></ToUserName>
<FromUserName><![CDATA[${toUserName}]]></FromUserName>
<CreateTime>${replyTime}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${aiReply}]]></Content>
</xml>`;
        
        console.log('=== 回复消息 ===');
        console.log('用户消息:', content);
        console.log('AI回复:', aiReply);
        console.log('回复XML:', replyXml);
        console.log('================');
        
        // 设置正确的Content-Type并返回XML
        res.set('Content-Type', 'application/xml');
        res.send(replyXml);
      } else {
        // 非文本消息或无内容，返回success
        console.log('非文本消息或无内容，返回success');
        res.send('success');
      }
      
    } catch (error) {
      console.error('处理微信消息失败:', error);
      // 发生错误时返回success，避免微信服务器重试
      res.send('success');
    }
  }

  /**
   * 微信消息验证处理方法
   * GET /weixin/msg
   * 用于微信服务器验证URL有效性
   */
  static verifyMessage(req, res) {
    try {
      // 获取微信验证参数
      const { signature, timestamp, nonce, echostr } = req.query;
      
      // 输出验证请求日志
      console.log('=== 微信URL验证请求 ===');
      console.log('时间:', new Date().toISOString());
      console.log('signature:', signature);
      console.log('timestamp:', timestamp);
      console.log('nonce:', nonce);
      console.log('echostr:', echostr);
      console.log('=====================');
      
      // 检查必要参数
      if (!signature || !timestamp || !nonce || !echostr) {
        console.log('微信验证失败: 缺少必要参数');
        return res.status(400).send('error');
      }
      
      // 进行签名验证
      const isValid = WeixinController.checkSignature(signature, timestamp, nonce);
      
      if (isValid) {
        console.log('微信验证成功: 签名校验通过');
        // 验证成功，原样返回echostr
        res.send(echostr);
      } else {
        console.log('微信验证失败: 签名校验不通过');
        res.status(403).send('error');
      }
      
    } catch (error) {
      console.error('微信URL验证失败:', error);
      res.status(500).send('error');
    }
  }

  /**
   * 获取微信access_token
   * @returns {Promise<string>} access_token
   */
  static async getAccessToken() {
    try {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;
      
      console.log('=== 获取access_token ===');
      console.log('请求URL:', url);
      
      const response = await axios.get(url);
      const data = response.data;
      
      console.log('响应数据:', data);
      console.log('========================');
      
      if (data.access_token) {
        return data.access_token;
      } else {
        throw new Error(`获取access_token失败: ${data.errmsg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取access_token失败:', error);
      throw error;
    }
  }

  /**
   * 发送客服消息
   * @param {string} openid 用户openid
   * @param {string} content 消息内容
   * @returns {Promise<boolean>} 发送结果
   */
  static async sendCustomMessage(openid, content) {
    try {
      // 获取access_token
      const accessToken = await WeixinController.getAccessToken();
      
      // 构造消息数据
      const messageData = {
        touser: openid,
        msgtype: 'text',
        text: {
          content: content
        }
      };
      
      // 发送消息
      const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
      
      console.log('=== 发送客服消息 ===');
      console.log('请求URL:', url);
      console.log('消息数据:', JSON.stringify(messageData, null, 2));
      
      const response = await axios.post(url, messageData);
      const result = response.data;
      
      console.log('响应结果:', result);
      console.log('===================');
      
      if (result.errcode === 0) {
        console.log('客服消息发送成功');
        return true;
      } else {
        console.error(`客服消息发送失败: ${result.errmsg}`);
        return false;
      }
    } catch (error) {
      console.error('发送客服消息异常:', error);
      return false;
    }
  }

  /**
   * 测试发送消息接口
   * GET /weixin/sendmsg
   * 发送固定测试消息给测试用户
   */
  static async sendTestMessage(req, res) {
    try {
      console.log('=== 测试发送消息 ===');
      console.log('时间:', new Date().toISOString());
      
      // 检查配置
      if (WECHAT_APPID === 'your_appid_here' || WECHAT_APPSECRET === 'your_appsecret_here') {
        console.log('错误: 请先配置WECHAT_APPID和WECHAT_APPSECRET');
        return res.status(500).json({
          success: false,
          message: '请先配置微信公众号的AppID和AppSecret'
        });
      }
      
      if (TEST_OPENID === 'test_openid_here') {
        console.log('错误: 请先配置TEST_OPENID');
        return res.status(500).json({
          success: false,
          message: '请先配置测试用户的OpenID'
        });
      }
      
      // 发送测试消息
      const testMessage = '这是一条来自公众号消息';
      const success = await WeixinController.sendCustomMessage(TEST_OPENID, testMessage);
      
      if (success) {
        console.log('测试消息发送成功');
        res.json({
          success: true,
          message: '测试消息发送成功',
          data: {
            openid: TEST_OPENID,
            content: testMessage
          }
        });
      } else {
        console.log('测试消息发送失败');
        res.status(500).json({
          success: false,
          message: '测试消息发送失败'
        });
      }
      
      console.log('==================');
      
    } catch (error) {
      console.error('测试发送消息异常:', error);
      res.status(500).json({
        success: false,
        message: '发送消息时发生异常',
        error: error.message
      });
    }
  }
}

module.exports = WeixinController;