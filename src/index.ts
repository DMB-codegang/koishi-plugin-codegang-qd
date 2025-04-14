import { } from 'koishi-plugin-mail'
import { } from 'koishi-plugin-pointmint'
import { } from 'koishi-plugin-puppeteer'
import { Context, h, Logger } from 'koishi'

import { api } from './api'
import { time, UserType } from './timeServer'
import { Config } from './config'

export const name = 'codegang-qd'
export const description = 'Codegang签到插件'
export const author = '小舍'
export const version = '2.0.0'
const lockSet = new Set<string>();
export const inject = ['database', 'http', 'puppeteer', 'points']
export * from './config'

const log = new Logger("@codegang/codegang-qd");

declare module 'koishi' {
  interface Tables { codegang_qd: codegang_qd }
}

export interface codegang_qd {
  id: number
  userid: string
  username: string
  time: Date
  monthlyRecords: JSON
}

export async function apply(ctx: Context, cfg: Config) {
  const Api = new api(ctx, cfg);
  ctx.model.extend('codegang_qd', {
    id: 'unsigned',
    userid: 'string',
    time: 'timestamp', // 今日签到时间
    monthlyRecords: 'json'// 本月签到记录
  }, { autoInc: true })
  this.timeService = new time(ctx);

  ctx.command('test').action(async ({ session }) => {
    session.send("这是通过新版本取出的积分数据" + (await ctx.points.get(session.userId)))
  });

  ctx.command('积分排行').alias('排行').action(async ({ session }) => {
    const topUsers = await ctx.points.getTopN(10);
    let msg = '积分排行榜\n';
    topUsers.forEach((item, index) => {
      // 如果是空就取userid
      if (!item.username) {
        item.username = item.userid;
      }
      //name如果是一个字就不脱敏，两个字就保留最后一个字，三个字及以上将name中间60%的内容脱敏
      let name = item.username;
      if (name.length == 1) {
        name = name;
      } else if (name.length <= 5) {
        //将名称前面一半的字符脱敏
        name = name.slice(0, Math.floor(name.length / 2)) + '***';
      } else {
        name = name.slice(0, Math.floor(name.length / 5)) + '***' + name.slice(Math.floor(name.length / 5) * 4);
      }
      msg += `${index + 1}. ${name}—${item.points}\n`;
    });
    session.send(msg);
  });

  ctx.command('签到').alias('qd').action(async ({ session }) => {
    // 添加请求锁防止重复提交
    const lockKey = `qd:lock:${session.userId}`;
    if (lockSet.has(lockKey)) return;
    lockSet.add(lockKey);
    try {
      // 检查用户是否已经签到或插件目前是否在开发模式
      const usertype:UserType = cfg.isdev ? 'notToday' : await this.timeService.checkTime(session.userId);
      if(usertype == 'already'){
        // 构建已签到信息
        const message = h('quote', { id: session.messageId }) + await Api.buildQDmessage('already', session.userId, session.username, usertype);
        await session.send(message);
        return ;
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
      this.timeService.updateTime(session.userId); // 更新签到时间
      // 构建签到成功的文本
      const message = h('quote', { id: session.messageId }) + (cfg.isdev ? '【测试模式】':'') + await Api.buildQDmessage('success', session.userId, session.username, usertype, uppoints);
      
      await session.send(message);

    } finally {
      lockSet.delete(lockKey);
    }
  });
}

