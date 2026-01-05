/**
 * 快速配置检查脚本
 * 使用方法: node check-setup.js
 */

const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}\n`),
}

// 检查项
const checks = {
  envFile: {
    name: '.env 文件',
    check: () => {
      const envPath = path.join(__dirname, '.env')
      if (!fs.existsSync(envPath)) {
        log.error('.env 文件不存在')
        return false
      }

      const envContent = fs.readFileSync(envPath, 'utf-8')
      const hasUrl = envContent.includes('VITE_SUPABASE_URL=')
      const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY=')

      if (!hasUrl) {
        log.error('.env 缺少 VITE_SUPABASE_URL')
        return false
      }
      if (!hasKey) {
        log.error('.env 缺少 VITE_SUPABASE_ANON_KEY')
        return false
      }

      log.success('.env 文件配置正确')
      return true
    },
  },

  dependencies: {
    name: 'NPM 依赖',
    check: () => {
      const packagePath = path.join(__dirname, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))

      const requiredDeps = [
        'react',
        'react-router-dom',
        'framer-motion',
        '@supabase/supabase-js',
        'tesseract.js',
      ]

      const missing = requiredDeps.filter(dep => !pkg.dependencies[dep])

      if (missing.length > 0) {
        log.error(`缺少依赖: ${missing.join(', ')}`)
        log.info('运行: npm install')
        return false
      }

      log.success('所有依赖已安装')
      return true
    },
  },

  migrations: {
    name: '数据库迁移文件',
    check: () => {
      const migrationsDir = path.join(__dirname, 'supabase_migrations')
      const requiredFiles = [
        'create_todos_table.sql',
        'create_alarms_table.sql',
        'create_notes_table.sql',
        'create_posts_table.sql',
        'create_profiles_table.sql',
      ]

      const missing = requiredFiles.filter(file => {
        const filePath = path.join(migrationsDir, file)
        return !fs.existsSync(filePath)
      })

      if (missing.length > 0) {
        log.warn(`缺少迁移文件: ${missing.join(', ')}`)
        log.info('这些文件需要在 Supabase SQL Editor 中手动执行')
        return false
      }

      log.success('所有迁移文件已存在')
      return true
    },
  },

  edgeFunctions: {
    name: 'Edge Functions',
    check: () => {
      const functionsDir = path.join(__dirname, 'supabase/functions')
      const requiredFunctions = [
        'ai-bridge',
        'mp-sync',
        'ai-task-breakdown',
        'ocr-bridge',
      ]

      const missing = requiredFunctions.filter(fn => {
        const fnPath = path.join(functionsDir, fn, 'index.ts')
        return !fs.existsSync(fnPath)
      })

      if (missing.length > 0) {
        log.error(`缺少 Edge Function: ${missing.join(', ')}`)
        return false
      }

      log.success('所有 Edge Functions 已创建')
      log.info('需要手动部署: supabase functions deploy')
      return true
    },
  },

  typescriptConfig: {
    name: 'TypeScript 配置',
    check: () => {
      const jsconfigPath = path.join(__dirname, 'jsconfig.json')
      if (!fs.existsSync(jsconfigPath)) {
        log.warn('jsconfig.json 不存在')
        return false
      }

      const config = JSON.parse(fs.readFileSync(jsconfigPath, 'utf-8'))
      if (!config.compilerOptions?.paths?.['@/*']) {
        log.warn('jsconfig.json 缺少路径别名配置')
        return false
      }

      log.success('TypeScript 配置正确')
      return true
    },
  },
}

// 执行检查
function runChecks() {
  log.header('╔══════════════════════════════════════╗')
  log.header('║   Tao Yong Company 配置检查工具    ║')
  log.header('╚══════════════════════════════════════╝')

  const results = []

  for (const [key, { name, check }] of Object.entries(checks)) {
    log.info(`检查: ${name}`)
    try {
      results.push(check())
    } catch (error) {
      log.error(`检查失败: ${error.message}`)
      results.push(false)
    }
  }

  // 总结
  log.header('═══════════════════════════════════════')
  const passed = results.filter(r => r).length
  const total = results.length

  if (passed === total) {
    log.success(`所有检查通过! (${passed}/${total})`)
    console.log('\n下一步:')
    console.log('1. 在 Supabase SQL Editor 中执行迁移文件')
    console.log('2. (可选) 配置 Edge Functions Secrets')
    console.log('3. (可选) 部署 Edge Functions')
  } else {
    log.warn(`部分检查未通过 (${passed}/${total})`)
    console.log('\n请根据上述提示修复问题\n')
  }

  console.log('\n详细文档: 查看 SETUP_CHECKLIST.md\n')
}

runChecks()
