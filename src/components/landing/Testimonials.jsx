/**
 * [INPUT]: 依赖 @/components/ui/card 的 Card, 依赖 @/components/ui/avatar 的 Avatar, 依赖 framer-motion 的 motion, 依赖 @/lib/motion 的 getMotionProps/staggerContainer/fadeInUp
 * [OUTPUT]: 导出 Testimonials Section 组件
 * [POS]: landing 层用户评价组件,支持 carousel/grid 布局
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { getMotionProps, staggerContainer, fadeInUp } from "@/lib/motion"

const DEFAULT_TESTIMONIALS = [
  {
    quote: "这个设计系统完全改变了我们的开发流程。组件质量极高，文档清晰，大大提升了团队效率。",
    author: "张明",
    role: "前端架构师",
    company: "科技创新公司",
    avatar: "张",
    rating: 5
  },
  {
    quote: "微拟物设计语言太惊艳了！渐变与阴影的运用恰到好处，用户反馈界面看起来非常专业。",
    author: "李婷",
    role: "产品设计师",
    company: "互联网工作室",
    avatar: "李",
    rating: 5
  },
  {
    quote: "从零到上线只用了两周，这在以前是不敢想象的。组件即插即用，定制也非常方便。",
    author: "王伟",
    role: "独立开发者",
    company: "自由职业",
    avatar: "王",
    rating: 5
  },
  {
    quote: "代码质量很高，架构清晰。GEB 分形文档系统让我第一次觉得读代码文档是一件愉快的事。",
    author: "刘洋",
    role: "全栈工程师",
    company: "数字营销机构",
    avatar: "刘",
    rating: 5
  },
  {
    quote: "客户对我们的新网站赞不绝口。微拟物效果让界面有了层次感，非常推荐。",
    author: "陈静",
    role: "UI 设计师",
    company: "设计咨询公司",
    avatar: "陈",
    rating: 5
  },
  {
    quote: "性能优化做得很好，Lighthouse 评分直接满分。组件按需加载，打包体积很小。",
    author: "赵强",
    role: "技术总监",
    company: "电商独角兽",
    avatar: "赵",
    rating: 5
  }
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function Testimonials({
  headline = "用户怎么说",
  testimonials = DEFAULT_TESTIMONIALS,
  layout = "grid"
}) {
  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          {...getMotionProps()}
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {headline}
          </h2>
        </motion.div>

        <motion.div
          className={`grid gap-6 ${layout === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}
          {...getMotionProps(staggerContainer)}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} {...getMotionProps(fadeInUp)}>
              <Card variant="raised" className="p-6 h-full">
                <StarRating rating={testimonial.rating} />
                <p className="mb-6 text-muted-foreground flex-grow">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} @ {testimonial.company}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
