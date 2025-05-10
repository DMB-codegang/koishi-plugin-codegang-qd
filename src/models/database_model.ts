import { Context } from 'koishi'
import { Codegang_qd } from '../types'

declare module 'koishi' {
    interface Tables { codegang_qd: Codegang_qd }
}

/**
 * 注册数据库模型
 * @param ctx Koishi 上下文
 */
export function registerDatabaseModel(ctx: Context) {
    ctx.model.extend('codegang_qd', {
        id: 'unsigned',
        userid: 'string',
        time: 'timestamp', // 今日签到时间
        monthlyRecords: 'json'// 签到记录
    }, { autoInc: true })
}