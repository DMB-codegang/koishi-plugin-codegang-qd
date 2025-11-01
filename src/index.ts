import { } from 'koishi-plugin-mail'
import { } from 'koishi-plugin-pointmint'
import { Context } from 'koishi'

import { InitPlugin } from './services/init'

import { Config, checkConfig } from './config'

export const name = 'codegang-qd'
export const description = '一个高度可自定义化的签到插件'
export const author = '小舍'
export const inject = ['database', 'http', 'points']
export const usage = 
`
## 签到自定义文本变量一览
- \`{AT}\`为艾特用户  
- \`{username}\`为用户昵称  
- \`{points}\`为用户获得的积分  
- \`{fortune}\`为用户运势  
- \`{consecutive_days}\`为用户连续签到天数
- \`{time}\`为用户签到时间  
- \`{totalpoints}\`为用户总积分  
- \`{<key>}\`其他绑定值  
---
## 关于蓄值衰减奖励算法

该算法是为了应对积分总量线性增长导致通货膨胀的问题设计的**缓解**方案  
算法通过限制积分数量多的用户签到获得的积分数量，来控制积分总量的增长速度  
您可以查看[*这里*](https://www.desmos.com/calculator/qoykayz55d)使用动画了解该算法的特性  

`


export * from './config'

export async function apply(ctx: Context, cfg: Config) {
  if (!checkConfig(cfg)) {
    ctx.logger.error('签到插件配置错误')
    console.log(cfg)
  }
  InitPlugin(ctx, cfg)
}