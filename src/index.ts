import { } from 'koishi-plugin-mail'
import { Context, h } from 'koishi'

import { jf } from './jf'
import { Ncm } from './ncm'
import { Config } from './config'

export const name = 'codegang-qd'
export const description = 'Codegang签到插件'
export const author = '小舍'
export const inject = {
  required: ['database', 'http'],
  optional: ['mail'],
}
export * from './config'

const ncm = new Ncm();
const dajf = new jf();

declare module 'koishi' {
  interface Tables { codegang_jf: codegang_jf, codegang_user_set: codegang_user_set }
}

export interface codegang_jf {
  id: number
  userid: string
  jf: number
  time: Date
}

export interface codegang_user_set {
  id: number
  userid: string
  set: any
}

async function getHitokoto(ctx: Context) {
  let row = await ctx.http.get('https://v1.hitokoto.cn')
  return row.hitokoto + '——' + row.from;
}

async function getfortune(ctx: Context, userid: string) {
  try {
    let row = await ctx.http.get(`https://api.fanlisky.cn/api/qr-fortune/get/${userid}`);
    if (row.code == 200) {
      return `今日运势：${row.data.fortuneSummary}${row.data.luckyStar}\n${row.data.signText}\n${row.data.unSignText}`;
    } else {
      return `运势获取失败……${row.code}\n${row.msg}`;
    }
  } catch (err) {
    console.error(`Error fetching fortune: ${err.message}`);
    return '运势获取失败……';
  }
}

export async function apply(ctx: Context, cfg: Config) {
  ctx.model.extend('codegang_jf', {
    id: 'unsigned',
    userid: 'string',
    jf: 'integer',
    time: 'timestamp'
  }, { autoInc: true })
  ctx.model.extend('codegang_user_set', {
    id: 'unsigned',
    userid: 'string',
    set: 'json'
  }, { autoInc: true })
  dajf.init(cfg, ctx.database);
  ncm.init(ctx.http, cfg);

  ctx.command('我的积分')
    .alias('查询积分')
    .alias('积分查询')
    .alias('积分')
    .alias('jf')
    .action(async ({ session }) => {
      console.log(session.userId);
      session.send(`你的积分是${await dajf.get(session.userId)}`);
    })

  ctx.command('签到').alias('qd').action(async ({ session }) => {
    if (cfg.isdev) { return '开发版无法签到'; }
    let usertype = await dajf.chacktime(session.userId);
    let upjf: number;
    let mail = (ctx.mail && ((await ctx.mail.getuserMailNum(session.userId)) != 0)) ? '\n✉️你有新的邮件哦' : '';
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
        session.send(`今天已经签到过啦，上次的签到时间是${usertype.toLocaleString()}${mail}`);
        return;
      }
    }
    dajf.add(session.userId, upjf);
    dajf.updatetime(session.userId);
    let img = h('img', { src: 'https://t.alcy.cc/pc/' });
    let fortune = await getfortune(ctx, session.userId);
    let hitokoto = await getHitokoto(ctx);
    session.send(`签到成功，你获得了${upjf}积分` + mail + ((usertype == 0) ? '\n这是你首次签到哦' : '') + `\n${hitokoto}\n${fortune}\n${img}`);
  });

  ctx.command('积分商城')
    .alias('积分商店')
    .action(async ({ session }) => {
      session.send(cfg.menu);
    });

  ctx.command('兑换 <thing> [arg1]').action(async ({ session }, thing, arg1) => {
    switch (true) {
      case thing == null: {
        session.send("请输入要兑换的商品");
        break;
      }
      case thing == "1" || thing == "一言": {
        const price = 2;
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          session.send("积分不足哦");
          break;
        }
        dajf.reduce(session.userId, price);
        session.send(await getHitokoto(ctx));
        break;
      }
      case thing == "2" || thing == "二次元": {
        const price = 15;
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          session.send("积分不足哦");
          break;
        }
        dajf.reduce(session.userId, price);
        session.send('<img src="https://t.alcy.cc/pc/"/>');
        break;
      }
      case thing == "3" || thing == "涩图": {
        const price = 25;
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          session.send("积分不足哦");
          break;
        }
        try {
          let url = await ctx.http.get('https://api.lolicon.app/setu/v2');
          await dajf.reduce(session.userId, price);
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
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          session.send("积分不足哦");
          break;
        }
        let keywords = arg1;
        if (!keywords) {
          messageid = await session.send('请在60秒内发送要搜索的内容');
          keywords = await session.prompt(60000)
          if (!keywords) {
            session.send('响应已超时')
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
              console.log(song);
              music = await ncm.getmusic(song.id, cfg.cookie);
              session.send(`<audio src="${music.url}"/>`);
              if (song.mv != 0) {
                let mv = await ncm.getmv(song.mv, cfg.cookie);
                session.send(`<video src="${mv.url}"/>`);
              } else {
                session.send(`<file title="${music.name}.flac" src="${music.url}" poster="${song.al.picUrl}"/>`);
              }
            }
            dajf.reduce(session.userId, price);
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

