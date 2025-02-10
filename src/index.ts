import { } from 'koishi-plugin-mail'
import { Context, h, sleep, Logger } from 'koishi'

import { jf } from './jf'
import { Ncm } from './ncm'
import { Config } from './config'
import { getHitokoto, getfortune } from './other'

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
const log = new Logger("@codegang/codegang-qd");

declare module 'koishi' {
  interface Tables { codegang_jf: codegang_jf }
}

export interface codegang_jf {
  id: number
  userid: string
  username: string
  jf: number
  time: Date
}

export async function apply(ctx: Context, cfg: Config) {
  ctx.model.extend('codegang_jf', {
    id: 'unsigned',
    userid: 'string',
    username: 'string',
    jf: 'integer',
    time: 'timestamp'
  }, { autoInc: true })
  dajf.init(ctx.database, cfg);
  ncm.init(ctx.http, cfg);
  //初始化数据库和class

  ctx.command('积分排行').alias('排行').action(async ({ session }) => {
    const topUsers = await dajf.getTopUsers(10);
    console.log(topUsers);
    let msg = '积分排行榜\n';
    topUsers.forEach((item, index) => {
      //name如果是一个字就不打码，两个字就保留最后一个字，三个字及以上将name中间60%的内容打码，如果是空就取固定值<未知>
      let name = item.username;
      if(name == null){
        name = '<未知>'
      }
      else if (name.length == 1) {
        name = name;
      } else if (name.length == 2) {
        name = name[0] + '*';
      } else {
        name = name.slice(0, Math.floor(name.length / 5)) + '***' + name.slice(Math.floor(name.length / 5) * 4);
      }
      msg += `${index + 1}. ${item.userid}—${item.jf}\n`;
    });
    session.send(msg);
  });

  ctx.command('我的积分').alias('查询积分').alias('积分查询').alias('积分').alias('jf').action(async ({ session }) => {
    sleep(cfg.delay);
    session.send(`你的积分是${await dajf.get(session.userId)}`);
  })

  ctx.command('签到').alias('qd').action(async ({ session }) => {
    if (cfg.isdev) { return '开发版无法签到'; }
    //判断数据库的username是否存在且一致
    let user = await ctx.database.get('codegang_jf', { userid: session.userId });
    if (user.length == 0) {
      await ctx.database.create('codegang_jf', { userid: session.userId, username: session.username, jf: 0});
    } else {
      if (user[0].username != session.username) {
        await ctx.database.set('codegang_jf', { userid: session.userId }, { username: session.username });
      }
    }

    let usertype = await dajf.chacktime(session.userId);
    let upjf: number;
    
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
        session.send(`今天已经签到过啦，上次的签到时间是${usertype.toLocaleString()}\n${await getfortune(ctx.http, session.userId)}${mail}`);
        return;
      }
    }
    dajf.add(session.userId, upjf);
    dajf.updatetime(session.userId);
    let img = h('img', { src: 'https://t.alcy.cc/pc/' });
    let fortune = await getfortune(ctx.http, session.userId);
    let hitokoto = await getHitokoto(ctx.http);
    session.send(`签到成功，你获得了${upjf}积分` + mail + ((usertype == 0) ? '\n这是你首次签到哦' : '') + `\n${hitokoto}\n${fortune}\n${img}`);
  });

  ctx.command('积分商城').alias('积分商店').action(async ({ session }) => {
    sleep(cfg.delay);
    session.send(cfg.menu);
  });

  ctx.command('兑换 <thing> [arg1]').action(async ({ session }, thing, arg1) => {
    switch (true) {
      case thing == null: {
        sleep(cfg.delay);
        session.send("请输入要兑换的商品");
        break;
      }
      case thing == "1" || thing == "一言": {
        const price = 2;
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        dajf.reduce(session.userId, price);
        session.send(await getHitokoto(ctx.http));
        break;
      }
      case thing == "2" || thing == "二次元": {
        const price = 15;
        let jf = await dajf.get(session.userId);
        if (jf < price) {
          sleep(cfg.delay);
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
          sleep(cfg.delay);
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

