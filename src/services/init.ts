import { Context } from 'koishi'
import { Config } from '../config'
import { time } from '../utils/timeServer'
import { Api } from '../utils/api'
import { registerCommands } from '../commands'

export function InitPlugin(ctx: Context, cfg: Config) {
    const logger = ctx.logger('cg签到')
    time.Init(ctx, cfg.timezone) // 初始化时间服务
    Api.Init(ctx, cfg) // 初始化API服务
    ctx.model.extend('codegang_qd', {
        id: 'unsigned',
        userid: 'string',
        time: 'timestamp', // 今日签到时间
        monthlyRecords: 'json'// 本月签到记录
    }, { autoInc: true })
    registerCommands(ctx, cfg)
    logger.info('插件初始化完成')
}