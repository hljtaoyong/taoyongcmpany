/**
 * 调试工具 - 用于诊断网站功能问题
 */

// 在浏览器控制台运行此脚本

export function debugCheck() {
  console.log('=== 网站功能诊断 ===\n')

  // 1. 检查路由
  console.log('1. 当前路由:')
  console.log('   路径:', window.location.pathname)
  console.log('   Hash:', window.location.hash)

  // 2. 检查人生计时器
  console.log('\n2. 人生计时器检查:')
  const lifeCounter = document.querySelector('[class*="fixed bottom-0"]')
  console.log('   元素存在:', !!lifeCounter)
  if (lifeCounter) {
    console.log('   宽度:', lifeCounter.offsetWidth)
    console.log('   高度:', lifeCounter.offsetHeight)
    console.log('   Z-Index:', window.getComputedStyle(lifeCounter).zIndex)
  }

  // 3. 检查 AI 助手
  console.log('\n3. AI 助手检查:')
  const aiButton = document.querySelector('[class*="Sparkles"]') || document.querySelector('[class*="AI"]')
  console.log('   按钮存在:', !!aiButton)

  // 4. 检查侧边栏
  console.log('\n4. 侧边栏检查:')
  const sidebar = document.querySelector('[class*="sidebar"]') || document.querySelector('aside')
  console.log('   侧边栏存在:', !!sidebar)

  // 5. 检查 Supabase 连接
  console.log('\n5. Supabase 检查:')
  console.log('   环境变量 URL:', !!import.meta.env?.VITE_SUPABASE_URL)
  console.log('   环境变量 KEY:', !!import.meta.env?.VITE_SUPABASE_ANON_KEY)

  // 6. 检查页面元素
  console.log('\n6. 页面元素检查:')
  const mainContent = document.querySelector('main')
  console.log('   Main 元素存在:', !!mainContent)
  if (mainContent) {
    console.log('   Main 类名:', mainContent.className)
  }

  // 7. 检查 React 组件
  console.log('\n7. React 组件检查:')
  console.log('   React DevTools:', !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

  console.log('\n=== 诊断完成 ===')
}

// 导出到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  window.debugCheck = debugCheck
  console.log('✅ 调试工具已加载')
  console.log('📝 在控制台输入 debugCheck() 运行诊断')
}
