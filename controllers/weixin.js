const crypto = require('crypto');
const xml2js = require('xml2js');

// TODO: 需要在配置文件中设置微信 Token
// 请在 config/config.js 中添加 WECHAT_TOKEN 配置项
const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'aaa';

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
        // 构造回复XML消息（将FromUserName和ToUserName互换）
        const replyTime = Math.floor(Date.now() / 1000);
        const replyXml = `<xml>
<ToUserName><![CDATA[${fromUserName}]]></ToUserName>
<FromUserName><![CDATA[${toUserName}]]></FromUserName>
<CreateTime>${replyTime}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
        
        console.log('=== 回复消息 ===');
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
}

module.exports = WeixinController;