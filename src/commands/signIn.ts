import { Context, h } from 'koishi'
import { Config } from '../config'
import { Api } from '../utils/api'
import { time } from '../utils/timeServer'
import { name } from '../index'
import { UserType } from '../types'

// 用于防止重复提交的锁集合
const lockSet = new Set<string>()

/**
 * 注册签到命令
 */
export function registerSignInCommand(ctx: Context, cfg: Config) {
    ctx.command('签到').alias('qd').action(async ({ session }) => {
        // 添加请求锁防止重复提交
        const lockKey = `qd:lock:${session.userId}`;
        if (lockSet.has(lockKey)) return;
        lockSet.add(lockKey);
        try {
            // 检查用户是否已经签到或插件目前是否在开发模式
            const usertype: UserType = cfg.isdev ? 'notToday' : await time.checkTime(session.userId);
            if (usertype == 'already') {
                // 构建已签到信息
                const message = h('quote', { id: session.messageId }) + await Api.buildQDmessage('already', session.userId, session.username, usertype);
                await session.send(message);
                return;
            }

            // 区分用户是否是新用户，确定需要加多少积分
            let uppoints: number;
            switch (usertype) {
                case 'newUser': {
                    uppoints = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum) + cfg.firstplusnum;
                    break;
                }
                case 'notToday': {
                    uppoints = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum);
                    break;
                }
                default: {
                    session.send("签到失败: 意料之外的usertype");
                    return;
                }
            }

            // 添加积分
            const transaction = ctx.points.generateTransactionId()
            const res = await ctx.points.add(session.userId, transaction, uppoints, name);
            await time.updateTime(session.userId); // 更新签到时间
            // 构建签到成功的文本
            const message = h('quote', { id: session.messageId }) + (cfg.isdev ? '【测试模式】' : '') + await Api.buildQDmessage('success', session.userId, session.username, usertype, uppoints);

            await session.send(message);

        } finally {
            lockSet.delete(lockKey);
        }
    });
}