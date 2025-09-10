const axios = require('axios');
const crypto = require('crypto');

// 测试微信消息处理功能
// 请先设置环境变量 WECHAT_TOKEN，确保与服务器配置一致
// 运行测试前：
// 1. 启动服务器: npm start
// 2. 设置环境变量: export WECHAT_TOKEN=your_token_here
// 3. 确保token与服务器端配置相同
async function testWeixinMessage() {
  try {
    console.log('=== 测试微信消息处理功能 ===');
    
    // 模拟微信发送的XML消息
    const xmlMessage = `<xml>
<ToUserName><![CDATA[gh_123456789]]></ToUserName>
<FromUserName><![CDATA[oUser123456]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[你好，这是一条测试消息]]></Content>
<MsgId>1234567890123456</MsgId>
</xml>`;
    
    console.log('发送的XML消息:');
    console.log(xmlMessage);
    console.log('\n');
    
    // 发送POST请求到微信消息接口
    const response = await axios.post('http://localhost:3000/api/weixin/msg', xmlMessage, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应内容:');
    console.log(response.data);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 计算微信签名（与服务器端保持一致）
function calculateSignature(token, timestamp, nonce) {
  // 注意：服务器端使用的是 [timestamp, nonce, token] 的顺序
  const tmpArr = [timestamp, nonce, token];
  tmpArr.sort(); // 字典序排序
  const tmpStr = tmpArr.join('');
  return crypto.createHash('sha1').update(tmpStr).digest('hex');
}

// 测试微信URL验证功能
async function testWeixinVerify() {
  try {
    console.log('\n=== 测试微信URL验证功能 ===');
    
    // 获取当前使用的token
    const token = process.env.WECHAT_TOKEN || 'aaa';
    const timestamp = '1234567890';
    const nonce = 'abc123';
    const echostr = 'test_echo_string';
    
    // 计算正确的签名
    const signature = calculateSignature(token, timestamp, nonce);
    
    const params = {
      signature: signature,
      timestamp: timestamp,
      nonce: nonce,
      echostr: echostr
    };
    
    console.log('使用token:', token);
    console.log('时间戳:', timestamp);
    console.log('随机数:', nonce);
    console.log('计算得到的签名:', signature);
    console.log('验证参数:', params);
    console.log('提示: 如果验证失败，请确保 WECHAT_TOKEN 环境变量已正确设置');
    
    // 发送GET请求到微信验证接口
    const response = await axios.get('http://localhost:3000/api/weixin/msg', {
      params: params
    });
    
    console.log('验证响应状态:', response.status);
    console.log('验证响应内容:', response.data);
    
  } catch (error) {
    console.error('验证测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
async function runTests() {
  await testWeixinMessage();
  await testWeixinVerify();
}

runTests();