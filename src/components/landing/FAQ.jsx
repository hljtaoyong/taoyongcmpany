/**
 * [INPUT]: 依赖 @/components/ui/accordion 的 Accordion, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps
 * [OUTPUT]: 导出 FAQ Section 组件
 * [POS]: landing 层常见问题组件,使用 Accordion 折叠面板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { getMotionProps } from "@/lib/motion"

const DEFAULT_FAQS = [
  {
    question: "这个设计系统适合什么类型的项目？",
    answer: "适合各种类型的 Web 应用项目，包括 SaaS 产品、企业官网、电商平台、仪表盘等。基于 React + TailwindCSS 构建，可以轻松集成到现有项目中。"
  },
  {
    question: "是否支持自定义主题和品牌色彩？",
    answer: "完全支持。所有色彩通过 CSS 变量定义，只需修改 index.css 中的变量值即可实现主题定制。我们提供详细的主题定制文档和 Figma 设计资源。"
  },
  {
    question: "组件库的性能如何？",
    answer: "组件库基于 Vite 6 构建，采用 Tree-shaking 和代码分割优化。单个组件打包后仅几 KB，支持按需导入。Lighthouse 性能评分可达 95+。"
  },
  {
    question: "是否支持 TypeScript？",
    answer: "是的，完整支持 TypeScript。所有组件都有完整的类型定义，提供 IntelliSense 和编译时类型检查，让开发更安全可靠。"
  },
  {
    question: "可以用于商业项目吗？",
    answer: "可以。MIT 许可证允许商业使用。专业版和团队版提供额外的设计资源、优先支持和技术咨询服务。"
  },
  {
    question: "如何获取技术支持？",
    answer: "免费版用户可以通过社区论坛和 GitHub Issues 获取支持。专业版用户享有邮件支持，团队版用户配备专属客户经理。我们也提供付费的技术咨询服务。"
  },
  {
    question: "是否支持 SSR（服务端渲染）？",
    answer: "支持。组件库与 Next.js、Remix 等 SSR 框架完全兼容。所有客户端组件都有明确的标记，可以轻松实现服务端和客户端代码分离。"
  },
  {
    question: "未来会持续更新吗？",
    answer: "是的。我们承诺持续维护和更新，定期发布新组件和功能。关注我们的 GitHub 和博客获取最新动态。"
  }
]

export function FAQ({
  headline = "常见问题",
  subheadline = "快速了解我们的设计系统和解决方案",
  faqs = DEFAULT_FAQS
}) {
  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-muted-foreground">
              {subheadline}
            </p>
          )}
        </motion.div>

        <motion.div {...getMotionProps()}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border border-border/50 px-6 shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]"
              >
                <AccordionTrigger className="py-4 text-left hover:no-underline">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
