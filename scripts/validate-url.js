#!/usr/bin/env node

/**
 * 验证 NEXT_PUBLIC_URL 格式的脚本
 */

function validateURL() {
  const url = process.env.NEXT_PUBLIC_URL;
  
  console.log('🔍 验证 NEXT_PUBLIC_URL...\n');
  
  if (!url) {
    console.error('❌ NEXT_PUBLIC_URL 环境变量未设置');
    process.exit(1);
  }
  
  console.log('URL 内容:', `"${url}"`);
  console.log('URL 长度:', url.length, '字符');
  console.log('URL 类型:', typeof url);
  
  // 检查是否包含不可见字符
  const hasInvisibleChars = /[\x00-\x1F\x7F-\x9F]/.test(url);
  if (hasInvisibleChars) {
    console.error('❌ URL 包含不可见字符');
    console.log('URL 十六进制:', Buffer.from(url).toString('hex'));
    process.exit(1);
  }
  
  // 检查基本格式
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('❌ URL 必须以 http:// 或 https:// 开头');
    process.exit(1);
  }
  
  // 检查是否以斜杠结尾
  if (url.endsWith('/')) {
    console.warn('⚠️  URL 以斜杠结尾，建议移除');
    console.log('建议的URL:', url.slice(0, -1));
  }
  
  // 尝试解析 URL
  try {
    const parsedURL = new URL(url);
    console.log('✅ URL 解析成功');
    console.log('协议:', parsedURL.protocol);
    console.log('主机:', parsedURL.hostname);
    console.log('端口:', parsedURL.port || '默认');
    console.log('路径:', parsedURL.pathname);
    
    // 构建测试 API URL
    const testAPIURL = `${url}/api/cron/20-seconds-metrics-interval?token=test`;
    console.log('\n🧪 测试 API URL:');
    console.log(testAPIURL);
    console.log('测试 URL 长度:', testAPIURL.length);
    
    console.log('\n✅ URL 验证通过！');
    
  } catch (error) {
    console.error('❌ URL 解析失败:', error.message);
    process.exit(1);
  }
}

// 运行验证
validateURL();