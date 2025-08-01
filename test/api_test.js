 // 简单的API测试脚本
const BASE_URL = 'http://localhost:3001';

// 测试用户注册
async function testRegister() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456',
        username: 'testuser'
      })
    });
    
    const data = await response.json();
    console.log('注册测试结果:', data);
    return data.data?.token;
  } catch (error) {
    console.error('注册测试失败:', error.message);
  }
}

// 测试用户登录
async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });
    
    const data = await response.json();
    console.log('登录测试结果:', data);
    return data.data?.token;
  } catch (error) {
    console.error('登录测试失败:', error.message);
  }
}

// 测试获取用户信息
async function testProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('获取用户信息测试结果:', data);
  } catch (error) {
    console.error('获取用户信息测试失败:', error.message);
  }
}

// 测试创建付款订单
async function testCreatePayment(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planType: 'premium',
        paymentMethod: 'alipay'
      })
    });
    
    const data = await response.json();
    console.log('创建付款订单测试结果:', data);
    return data.data?.orderId;
  } catch (error) {
    console.error('创建付款订单测试失败:', error.message);
  }
}

// 测试健康检查
async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('健康检查测试结果:', data);
  } catch (error) {
    console.error('健康检查测试失败:', error.message);
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始API测试...\n');
  
  // 健康检查
  console.log('1. 测试健康检查');
  await testHealth();
  console.log('');
  
  // 注册测试
  console.log('2. 测试用户注册');
  const registerToken = await testRegister();
  console.log('');
  
  // 登录测试
  console.log('3. 测试用户登录');
  const loginToken = await testLogin();
  console.log('');
  
  const token = loginToken || registerToken;
  
  if (token) {
    // 获取用户信息
    console.log('4. 测试获取用户信息');
    await testProfile(token);
    console.log('');
    
    // 创建付款订单
    console.log('5. 测试创建付款订单');
    await testCreatePayment(token);
    console.log('');
  }
  
  console.log('API测试完成');
}

// 如果直接运行此文件
if (require.main === module) {
  runTests();
}

module.exports = {
  testRegister,
  testLogin,
  testProfile,
  testCreatePayment,
  testHealth,
  runTests
};