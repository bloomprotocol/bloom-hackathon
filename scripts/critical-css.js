const Beasties = require('beasties');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * 使用 Beasties 自動處理 Critical CSS
 * 
 * 這個腳本會自動：
 * 1. 提取首屏需要的 CSS 並內聯
 * 2. 處理字體預加載
 * 3. 延遲加載非關鍵 CSS
 * 
 * 注意：我們不需要手動維護 inlineCriticalCss.js，
 * 因為 Beasties 會自動識別並內聯所有關鍵樣式
 */
async function inlineCriticalCSS() {
  console.log('🚀 开始使用 Beasties 处理 Critical CSS...');
  
  const beasties = new Beasties({
    // 设置CSS文件路径
    path: path.join(process.cwd(), '.next/static/css'),
    publicPath: '/_next/static/css/',
    
    // 内联关键字体
    inlineFonts: true,
    
    // 预加载字体
    preloadFonts: true,
    
    // 预加载策略 - 使用 'media' 策略来延迟加载非关键CSS
    preload: 'media',
    
    // 压缩生成的关键CSS
    compress: true,
    
    // 减少内联样式
    reduceInlineStyles: true,
    
    // 修剪源文件中的内联规则
    pruneSource: false,
    
    // 合并内联样式表
    mergeStylesheets: true,
    
    // 日志级别
    logLevel: 'info',
    
    // 键帧处理策略
    keyframes: 'critical',
    
    // 最小外部大小 (设为 0 表示尽可能多地内联)
    minimumExternalSize: 0,
  });

  try {
    // 查找所有生成的HTML文件
    const htmlFiles = await glob('.next/server/**/*.html');
    
    if (htmlFiles.length === 0) {
      console.log('⚠️  未找到HTML文件，跳过Critical CSS处理');
      return;
    }

    console.log(`📄 找到 ${htmlFiles.length} 个HTML文件`);

    for (const htmlFile of htmlFiles) {
      try {
        console.log(`🔄 处理: ${htmlFile}`);
        
        // 读取HTML文件
        const html = fs.readFileSync(htmlFile, 'utf8');
        
        // 处理Critical CSS
        const result = await beasties.process(html);
        
        // 写回处理后的HTML
        fs.writeFileSync(htmlFile, result);
        
        console.log(`✅ 完成: ${htmlFile}`);
      } catch (fileError) {
        console.warn(`⚠️  处理文件失败 ${htmlFile}:`, fileError.message);
      }
    }

    console.log('🎉 Critical CSS 处理完成！');
  } catch (error) {
    console.error('❌ Critical CSS 处理失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  inlineCriticalCSS().catch((error) => {
    console.error('Critical CSS 处理失败:', error);
    process.exit(1);
  });
}

module.exports = { inlineCriticalCSS }; 