const axios = require('axios');

// 测试微信消息处理功能
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
    const response = await axios.post('http://localhost:80/api/weixin/msg', xmlMessage, {
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

// 测试微信URL验证功能
async function testWeixinVerify() {
  try {
    console.log('\n=== 测试微信URL验证功能 ===');
    
    // 模拟微信验证参数
    const params = {
      signature: 'f21891de399b4e54a9b8f7456d3ac6154c1f2a50', // 这个需要根据实际token计算
      timestamp: '1234567890',
      nonce: 'abc123',
      echostr: 'test_echo_string'
    };
    
    console.log('验证参数:', params);
    
    // 发送GET请求到微信验证接口
    const response = await axios.get('http://localhost:80/api/weixin/msg', {
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