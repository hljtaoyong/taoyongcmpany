/**
 * [INPUT]: 依赖 @/components/ui/* 的所有设计系统组件
 * [OUTPUT]: 导出 DesignSystem 展示页面
 * [POS]: pages 层的设计系统文档页,展示所有组件变体
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Info } from "lucide-react"

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex h-16 items-center gap-8">
            <a href="/" className="font-bold text-lg">Tao Yong Company</a>
            <nav className="flex gap-4">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">首页</a>
              <span className="text-primary font-medium">设计系统</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/20">
        <div className="container max-w-screen-2xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4">设计系统 v1.0</Badge>
            <h1 className="mb-4 text-4xl font-bold">微拟物设计语言</h1>
            <p className="text-lg text-muted-foreground">
              所有组件融合渐变与立体阴影效果，色彩派生自 CSS 变量 + color-mix
            </p>
          </div>
        </div>
      </section>

      {/* Components Showcase */}
      <main className="container max-w-screen-2xl px-4 py-12">
        <Tabs defaultValue="buttons" className="space-y-8">
          <TabsList className="flex flex-wrap gap-2 bg-muted/50 p-2 rounded-2xl">
            <TabsTrigger value="buttons" className="rounded-xl data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">Buttons</TabsTrigger>
            <TabsTrigger value="cards" className="rounded-xl data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">Cards</TabsTrigger>
            <TabsTrigger value="inputs" className="rounded-xl data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">Inputs</TabsTrigger>
            <TabsTrigger value="badges" className="rounded-xl data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">Badges</TabsTrigger>
            <TabsTrigger value="other" className="rounded-xl data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]">Other</TabsTrigger>
          </TabsList>

          {/* Buttons */}
          <TabsContent value="buttons" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                所有按钮使用渐变背景 + 三层立体阴影结构
              </AlertDescription>
            </Alert>
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>所有变体支持微交互效果</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </CardContent>
              <CardContent className="flex flex-wrap gap-4">
                <Button variant="default" size="sm">Small</Button>
                <Button variant="default" size="default">Default</Button>
                <Button variant="default" size="lg">Large</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards */}
          <TabsContent value="cards" className="space-y-6">
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Card Variants</CardTitle>
                <CardDescription>支持凸起 / 内凹 / 平面三种效果</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <Card variant="raised" className="p-6">
                  <h3 className="font-semibold mb-2">Raised 凸起</h3>
                  <p className="text-sm text-muted-foreground">外投影 + 顶部高光</p>
                </Card>
                <Card variant="inset" className="p-6">
                  <h3 className="font-semibold mb-2">Inset 内凹</h3>
                  <p className="text-sm text-muted-foreground">内阴影效果</p>
                </Card>
                <Card variant="flat" className="p-6">
                  <h3 className="font-semibold mb-2">Flat 平面</h3>
                  <p className="text-sm text-muted-foreground">轻阴影</p>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inputs */}
          <TabsContent value="inputs" className="space-y-6">
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>内凹微拟物效果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <Input placeholder="默认输入框..." />
                <Input placeholder="禁用状态..." disabled />
                <div className="flex items-center gap-2">
                  <Switch id="terms" />
                  <Label htmlFor="terms">同意条款</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="subscribe" />
                  <Label htmlFor="subscribe">订阅更新</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-6">
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Badge Variants</CardTitle>
                <CardDescription>渐变背景 + 立体阴影</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other */}
          <TabsContent value="other" className="space-y-6">
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Other Components</CardTitle>
                <CardDescription>其他设计系统组件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Separator</p>
                  <Separator />
                </div>
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    这是一个 Alert 组件示例
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
