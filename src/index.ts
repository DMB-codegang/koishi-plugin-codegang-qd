import { } from 'koishi-plugin-mail'
import { } from 'koishi-plugin-pointmint'
import { Context } from 'koishi'

import { InitPlugin } from './services/init'
import { Config } from './config'

export const name = 'codegang-qd'
export const description = '一个高度可自定义化的签到插件'
export const author = '小舍'
export const inject = ['database', 'http', 'points']
export const usage = 
`
# 签到插件
## 介绍

## 签到自定义文本变量一览
- \`{AT}\`为艾特用户  
- \`{username}\`为用户昵称  
- \`{points}\`为用户获得的积分  
- \`{fortune}\`为用户运势  
- \`{consecutive_days}\`为用户连续签到天数
- \`{time}\`为用户签到时间  
- \`{totalpoints}\`为用户总积分  
- \`{<key>}\`其他绑定值  
`

export * from './config'

export async function apply(ctx: Context, cfg: Config) {
  InitPlugin(ctx, cfg)
}