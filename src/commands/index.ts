import { Context } from 'koishi'
import { Config } from '../config'
import { registerSignInCommand } from './signIn'

import { time } from '../utils/timeServer'

/**
 * 注册所有命令
 * @param ctx Koishi上下文
 * @param cfg 插件配置
 */
export function registerCommands(ctx: Context, cfg: Config) {
  // 注册签到命令
  registerSignInCommand(ctx, cfg)

  ctx.command('test').action(async ({ session }) => {
    session.send((await time.getConsecutiveDays(session.userId)).toString())
    return
  })
}