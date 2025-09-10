const axios = require('axios');
const WeiXinController = require('../controllers/weixin');

// 创建微信自定义菜单
async function createWeChatMenu() {
  try {
    // 读取菜单配置
    const menuConfig = require('../config/wechat_menu.json');
    
    // 使用WeiXinController获取access_token
    const accessToken = await WeiXinController.getAccessToken();
    
    if (!accessToken) {
      console.error('无法获取access_token，请检查微信配置');
      return;
    }

    const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`;
    
    const response = await axios.post(url, menuConfig);
    
    if (response.data.errcode === 0) {
      console.log('✅ 自定义菜单创建成功');
    } else if (response.data.errcode === 40164) {
      console.error('❌ 创建菜单失败: IP地址不在白名单');
      console.error('请在微信公众平台 -> 开发 -> 基本配置 -> IP白名单中添加当前服务器IP');
    } else if (response.data.errcode === 48001) {
      console.error('❌ 创建菜单失败: API未授权');
      console.error('当前公众号没有自定义菜单接口权限，请检查：');
      console.error('1. 公众号是否为服务号（订阅号需要认证才能使用自定义菜单）');
      console.error('2. 是否已通过微信认证');
      console.error('3. 是否有相关接口权限');
    } else {
      console.error('❌ 创建菜单失败:', response.data.errmsg);
    }
    
    return response.data;
  } catch (error) {
    console.error('创建菜单时发生错误:', error.message);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  createWeChatMenu();
}

module.exports = { createWeChatMenu };