# supabase_migrations/
> L2 | 父级: ../CLAUDE.md

成员清单
create_todos_table.sql: todos 表结构定义,RLS 策略,测试数据 (6条)
create_alarms_table.sql: alarms 表结构定义,循环闹钟,RLS 策略,触发器
create_notes_table.sql: notes 表结构定义,置顶功能,RLS 策略
create_posts_table.sql: posts 表结构定义,博客文章,分类标签,RLS 策略,全文搜索索引
add_calendar_sync.sql: Google Calendar 同步字段添加,同步状态跟踪
create_profiles_table.sql: profiles 表扩展,微信身份桥接 (openid/unionid),订阅设置

法则: 成员完整·一行一文件·父级链接·技术词前置

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
