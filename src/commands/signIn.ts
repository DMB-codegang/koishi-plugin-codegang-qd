import { Context, h } from 'koishi'
import { Config } from '../config'
import { Api } from '../utils/api'
import { Check } from '../utils/check'
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
        
        const maxRetries = 3;
        let retryCount = 0;
        
        try {
            while (retryCount <= maxRetries) {
                try {
                    let message = '';
                    // 检查用户当前的状态
                    const usertype: UserType = cfg.isdev ? 'notToday' : await time.checkTime(session.userId);

                    // 今日已签到
                    if (usertype == 'already') {
                        // 构建今日已签到信息
                        message = h('quote', { id: session.messageId }) + await Api.buildQDmessage('already', session.userId, session.username, usertype);
                        await session.send(message);
                        return;
                    }

                    // 进行人机验证
                    if (cfg.captchaType != 'none' && Math.random() < cfg.captchaProbability) {
                        const captcha = await Check.check(ctx, cfg, session);
                        if (!captcha) {
                            await session.send('签到失败: 人机验证失败');
                            return;
                        }
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
                            await session.send("签到失败: 意料之外的usertype");
                            return;
                        }
                    }

                    // 添加积分
                    const transaction = ctx.points.generateTransactionId()
                    const res = await ctx.points.add(session.userId, transaction, uppoints, name);
                    await time.updateTime(session.userId); // 更新签到时间

                    // 构建签到成功的文本
                    message = h('quote', { id: session.messageId }) + (cfg.isdev ? '【测试模式】' : '') + await Api.buildQDmessage('success', session.userId, session.username, usertype, uppoints);

                    await session.send(message);
                    
                    // 成功执行，跳出重试循环
                    return;
                    
                } catch (error) {
                    retryCount++;
                    
                    if (retryCount > maxRetries) {
                        // 超过最大重试次数，发送错误信息并退出
                        await session.send(`签到失败: 重试${maxRetries}次后仍然失败，请稍后再试。错误信息: ${error.message || error}`);
                        return;
                    } else {
                        // 还有重试机会，记录日志并继续
                        ctx.logger.warn(`签到重试 ${retryCount}/${maxRetries}: ${error.message || error}`);
                        // 可选：添加延迟避免频繁重试
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            }
        } finally {
            // 确保锁总是被释放
            lockSet.delete(lockKey);
        }
    });
}