/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 @/components/ui/badge 的 Badge, 依赖 @/components/ui/button 的 Button, 依赖 @/components/ui/switch 的 Switch, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/staggerContainer/fadeInUp, 依赖 lucide-react 的 Check/X
 * [OUTPUT]: 导出 Pricing Section 组件
 * [POS]: landing 层定价展示组件,支持月付/年付切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_PLANS = [
  {
    name: "免费版",
    price: "0",
    period: "永久",
    description: "适合个人开发者和小型项目",
    features: [
      { text: "基础组件库", included: true },
      { text: "CSS 变量系统", included: true },
      { text: "响应式布局", included: true },
      { text: "技术文档访问", included: true },
      { text: "社区支持", included: true },
      { text: "高级组件", included: false },
      { text: "设计资源", included: false },
      { text: "优先支持", included: false }
    ],
    cta: "开始使用",
    highlighted: false
  },
  {
    name: "专业版",
    price: "19",
    period: "月",
    description: "适合快速成长的团队",
    features: [
      { text: "基础组件库", included: true },
      { text: "CSS 变量系统", included: true },
      { text: "响应式布局", included: true },
      { text: "技术文档访问", included: true },
      { text: "社区支持", included: true },
      { text: "高级组件", included: true },
      { text: "设计资源 (Figma)", included: true },
      { text: "邮件支持", included: true }
    ],
    cta: "立即升级",
    highlighted: true
  },
  {
    name: "团队版",
    price: "49",
    period: "月",
    description: "适合大型组织和多团队协作",
    features: [
      { text: "专业版所有功能", included: true },
      { text: "无限项目使用", included: true },
      { text: "自定义主题", included: true },
      { text: "组件生成器", included: true },
      { text: "设计系统咨询", included: true },
      { text: "专属客户经理", included: true },
      { text: "SLA 保证", included: true },
      { text: "现场培训", included: true }
    ],
    cta: "联系销售",
    highlighted: false
  }
]

export function Pricing({
  headline = "简单透明的定价",
  subheadline = "选择适合你的方案，随时升级",
  plans = DEFAULT_PLANS
}) {
  const [isAnnual, setIsAnnual] = useState(false)

  const getDisplayPrice = (plan) => {
    if (isAnnual && plan.price !== "0") {
      const monthly = parseInt(plan.price)
      const annual = Math.floor(monthly * 0.8)
      return { price: annual.toString(), savings: `省 ${(monthly * 12 - annual * 12).toString()}` }
    }
    return { price: plan.price, savings: null }
  }

  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-background to-muted/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {subheadline}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>月付</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>年付</span>
            {isAnnual && (
              <Badge className="ml-2">省 20%</Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start"
          {...getMotionProps(staggerContainer)}
        >
          {plans.map((plan, index) => {
            const { price, savings } = getDisplayPrice(plan)
            return (
              <motion.div
                key={index}
                className={plan.highlighted ? "relative scale-105" : ""}
                {...getMotionProps(fadeInUp)}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>最受欢迎</Badge>
                  </div>
                )}
                <Card
                  variant={plan.highlighted ? "raised" : "flat"}
                  className={plan.highlighted ? "ring-2 ring-primary" : ""}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">¥{price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                      {savings && (
                        <p className="text-sm text-green-600 mt-1">年付 {savings}</p>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground/50"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
