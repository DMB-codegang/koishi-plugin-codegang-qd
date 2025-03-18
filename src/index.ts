import { } from 'koishi-plugin-mail'
import { } from 'koishi-plugin-codegang-jf'
import { } from 'koishi-plugin-puppeteer'
import { Context, h, sleep, Logger } from 'koishi'

import { time } from './timeServer'
import { Ncm } from './ncm'
import { Config } from './config'
import { getHitokoto, getfortunev2, init } from './other'

export const name = 'codegang-qd'
export const description = 'Codegang签到插件'
export const author = '小舍'
export const version = '1.1.0-Dev-1'
const lockSet = new Set<string>();
export const inject = {
  required: ['database', 'http', 'puppeteer', 'jf'],
  optional: ['mail'],
}
export * from './config'

const ncm = new Ncm();
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
  ctx.model.extend('codegang_qd', {
    id: 'unsigned',
    userid: 'string',
    time: 'timestamp', // 今日签到时间
    monthlyRecords: 'json'// 本月签到记录
  }, { autoInc: true })
  this.timeService = new time(ctx);
  ncm.init(ctx.http, cfg);
  init(ctx);

  ctx.command('test').action(async ({ session }) => {
    session.send("这是通过新版本取出的积分数据" + (await ctx.jf.get(session.userId)))
  });

  ctx.command('积分排行').alias('排行').action(async ({ session }) => {
    const topUsers = await ctx.jf.getTopUsers(10);
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
      msg += `${index + 1}. ${name}—${item.jf}\n`;
    });
    session.send(msg);
  });

  ctx.command('签到').alias('qd').action(async ({ session }) => {
    // 添加请求锁防止重复提交
    const lockKey = `qd:lock:${session.userId}`;
    if (lockSet.has(lockKey)) return;
    lockSet.add(lockKey);
    try {
      let usertype = cfg.isdev ? 1 : await this.timeService.checkTime(session.userId);
      let upjf: number;
      const fortune = await getfortunev2(session.userId);

      let mail = ''
      switch (usertype) {
        case 0: {
          upjf = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum) + cfg.firstplusnum;
          break;
        }
        case 1: {
          upjf = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum);
          break;
        }
        default: {
          session.send(`今天已经签到过啦，上次的签到时间是${usertype.toLocaleString()}\n${fortune}${mail}`);
          return;
        }
      }
      let img = h('img', { src: 'https://t.alcy.cc/pc/' });
      let hitokoto = await getHitokoto(ctx.http);
      ctx.jf.add(session.userId, upjf, name);
      this.timeService.updateTime(session.userId);
      session.send((cfg.isdev ? `【测试模式${version}】` : '') + `签到成功，你获得了${upjf}积分` + mail + ((usertype == 0) ? '\n这是你首次签到哦' : '') + `\n${hitokoto}\n${fortune}\n${img}`);
    } finally {
      lockSet.delete(lockKey);
    }
  });

  ctx.command('积分商城').alias('积分商店').action(async ({ session }) => {
    sleep(cfg.delay);
    session.send(cfg.menu);
  });

  ctx.command('兑换 <thing> [arg1]').action(async ({ session }, thing, arg1) => {
    if (thing == null) return "请在“兑换 ”后面输入要兑换的商品，注意空格"
    switch (true) {
      case thing == "1" || thing == "一言": {
        const price = 2;
        let jf = await ctx.jf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        ctx.jf.reduce(session.userId, price);
        session.send(await getHitokoto(ctx.http));
        break;
      }
      case thing == "2" || thing == "二次元": {
        const price = 15;
        let jf = await ctx.jf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        ctx.jf.reduce(session.userId, price);
        session.send('<img src="https://t.alcy.cc/pc/"/>');
        break;
      }
      case thing == "3" || thing == "涩图": {
        const price = 25;
        let jf = await ctx.jf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        try {
          let url = await ctx.http.get('https://api.lolicon.app/setu/v2');
          await ctx.jf.reduce(session.userId, price);
          session.send(`<img src="${url.data[0].urls.original}"/>`);
        } catch (error) {
          console.error('Error fetching image:', error);
          session.send("获取图片失败，请稍后再试");
        }
        break;
      }
      case thing == "4" || thing == "网易云": {
        const price = 10;
        let messageid: Array<string>;
        let jf = await ctx.jf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        let keywords = arg1;
        if (!keywords) {
          let hotSearch = await ncm.getHotSearch();
          sleep(cfg.delay);
          messageid = await session.send(`请在60秒内发送要搜索的内容\n当前热搜：\n` + hotSearch.map((item, index) => `${item.first} `).join(''));
          keywords = await session.prompt(60000)
          if (!keywords || keywords == 'exit') {
            session.send('已退出');
            break;
          }
          await session.bot.deleteMessage(session.channelId, messageid[0]);
        }
        let search = await ncm.search(keywords);
        let msg = '';
        let choose;
        let offset = 0
        while (true) {
          const musicnum = 30;
          msg = '';
          for (let i = 0; i < 5; i++) {
            // if (search[offset + i].from == "【codegang曲库】") {
            // msg += `${offset + i + 1}. ${search[offset + i].name}——${search[offset + i].art}\n<img src="${search[offset + i].img}"/>\n`;
            // } else {
            msg += `${offset + i + 1}. ${search[offset + i].name}——${search[offset + i].ar[0].name}\n${search[offset + i].al.name}<img src="${search[offset + i].al.picUrl}?param=200y200"/>\n`;
            // }
          }
          msg += '请输入你要兑换的歌曲序号\n up,next翻页 exit退出';
          messageid = await session.send(msg);
          choose = await session.prompt(60000);
          if (choose == 'up') {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            if (offset != 0) {
              offset -= 5;
            }
          } else if (choose == 'next') {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            if (offset + 5 < musicnum) {
              offset += 5;
            }
          } else if (choose == 'exit') {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            sleep(cfg.delay);
            return '已退出';
          } else if (!choose) {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            return '响应已超时，已自动退出';
          } else {
            break;
          }
        }
        await session.bot.deleteMessage(session.channelId, messageid[0]);
        switch (true) {
          case choose == 'exit': {
            session.send('已退出');
            break;
          }
          case Number(choose) >= 1 && Number(choose) <= 30: {
            let song = search[Number(choose) - 1];
            let music;
            if (song.from == '【codegang曲库】') {
              session.send(`<audio src="${song.file}"/>`);
              if (song.mv != null) {
                session.send(`<video src="${song.mv}"/>`);
              }
            } else {
              music = await ncm.getmusic(song.id, cfg.level);
              session.send(`<audio src="${music.url}"/>`);
              if (song.mv != 0) {
                let mv = await ncm.getmv(song.mv);
                session.send(`<video src="${mv.url}"/>`);
              } else {
                if (cfg.level == 'standard' || cfg.level == 'higher' || cfg.level == 'exhigh') {
                  session.send(`<file title="${song.name}.mp3" src="${music.url}" poster="${song.al.picUrl}"/>`);
                } else {
                  session.send(`<file title="${song.name}.flac" src="${music.url}" poster="${song.al.picUrl}"/>`);
                }
              }
            }
            ctx.jf.reduce(session.userId, price);
            break;
          }
          default: {
            session.send('请输入不合法，已自动退出');
            break;
          }
        }
        break;
      }
      default: {
        session.send("没有这个商品哦");
        break;
      }
    }
  });
}

