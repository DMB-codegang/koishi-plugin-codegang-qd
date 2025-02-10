var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  author: () => author,
  description: () => description,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi3 = require("koishi");

// src/jf.ts
var database_name = "codegang_jf";
var jf = class {
  static {
    __name(this, "jf");
  }
  cfg;
  database;
  constructor() {
  }
  init(database, cfg) {
    this.cfg = cfg;
    this.database = database;
  }
  async get(userid) {
    let row = await this.database.get(database_name, { userid });
    if (this.cfg.isdev) {
      return 999;
    }
    if (row.length == 0) {
      return 0;
    } else {
      return row[0].jf;
    }
  }
  async set(userid, jf2) {
    let row = await this.database.get(database_name, { userid });
    if (row.length == 0) {
      await this.database.create(database_name, { userid, jf: jf2 });
    } else {
      await this.database.set(database_name, { userid }, { jf: jf2 });
    }
  }
  async add(userid, jf2) {
    let row = await this.database.get(database_name, { userid });
    if (row.length == 0) {
      await this.database.create(database_name, { userid, jf: jf2 });
    } else {
      await this.database.set(database_name, { userid }, { jf: row[0].jf + jf2 });
    }
  }
  async reduce(userid, jf2) {
    let row = await this.database.get(database_name, { userid });
    if (row.length == 0) {
      return false;
    } else {
      if (row[0].jf < jf2) {
        return false;
      } else {
        await this.database.set(database_name, { userid }, { jf: row[0].jf - jf2 });
        return true;
      }
    }
  }
  async updatetime(userid) {
    let row = await this.database.get(database_name, { userid });
    if (row.length == 0) {
      return false;
    } else {
      await this.database.set(database_name, { userid }, { time: /* @__PURE__ */ new Date() });
      return true;
    }
  }
  async chacktime(userid) {
    let row = await this.database.get(database_name, { userid });
    if (row.length == 0 || row[0].time == null) {
      return 0;
    } else {
      let lasttime = row[0].time;
      let nowtime = /* @__PURE__ */ new Date();
      if (!(lasttime == null)) {
        lasttime = new Date(lasttime);
      }
      if (lasttime.getDate() == nowtime.getDate()) {
        return lasttime;
      } else {
        return 1;
      }
    }
  }
  async getTopUsers(num) {
    let row = await this.database.get("codegang_jf", {}, {
      fields: ["userid", "username", "jf"],
      sort: { jf: "desc" },
      limit: num
    });
    return row.map((item) => {
      return { userid: item.userid, username: item.username, jf: item.jf };
    });
  }
};

// src/ncm.ts
var Ncm = class {
  static {
    __name(this, "Ncm");
  }
  http;
  cfg;
  constructor() {
  }
  init(http, cfg) {
    this.http = http;
    this.cfg = cfg;
  }
  async search(keyword) {
    try {
      let row_1 = [];
      let search_songs_num = 25;
      if (row_1.length != 0) {
        search_songs_num = search_songs_num - row_1.length;
      }
      let row_2 = await this.http.get(`${this.cfg.ncmapi}/cloudsearch?limit=${search_songs_num}&keywords=${keyword}`);
      for (let i = 0; i < row_1.length; i++) {
        if (row_1[i].from == "【codegang曲库】") {
          row_1[i].name = row_1[i].from + row_1[i].name;
        }
      }
      let row = row_1.concat(row_2.result.songs);
      return row;
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      return { error: "Failed to fetch search results" };
    }
  }
  async getmusic(id, level) {
    console.log(`${this.cfg.ncmapi}/song/url/v1?id=${id}&level=${level}&cookie=${this.cfg.cookie}`);
    let row = await this.http.get(`${this.cfg.ncmapi}/song/url?id=${id}&level=${level}&cookie=${this.cfg.cookie}`);
    return row.data[0];
  }
  async getmv(id) {
    let row = await this.http.get(`${this.cfg.ncmapi}/mv/url?id=${id}&cookie=${this.cfg.cookie}`);
    return row.data;
  }
  async getHotSearch() {
    try {
      let row = await this.http.get(`${this.cfg.ncmapi}/search/hot`);
      if (row.code != 200) {
        return { error: "Failed to fetch hot search results" };
      }
      return row.result.hots;
    } catch (error) {
      return { error: "Failed to fetch hot search results" };
    }
  }
};

// src/other.ts
var import_koishi = require("koishi");
var log = new import_koishi.Logger("@codegang/codegang-qd");
async function getHitokoto(http) {
  try {
    let row = await http.get("https://v1.hitokoto.cn");
    return row.hitokoto + "——" + row.from;
  } catch (err) {
    console.error(`一言获取失败……`);
    log.error("一言获取失败: %s", err);
    return "error";
  }
}
__name(getHitokoto, "getHitokoto");
async function getfortune(http, userid) {
  try {
    let row = await http.get(`http://qq.link114.cn/${userid}${(/* @__PURE__ */ new Date()).getFullYear()}${(/* @__PURE__ */ new Date()).getMonth() + 1}${(/* @__PURE__ */ new Date()).getDate()}`);
    if (row) {
      row = row.match(/<div class="listpage_content">([\s\S]*?)<\/div>/)[1];
      let res = { index: "", star: "", sign: "", res: "" };
      res.index = row.match(/<dt>运情总结：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
      res.star = row.match(/<dt>幸运星：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
      res.sign = row.match(/<dt>签文：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
      res.res = row.match(/<dt>解签：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
      return `今日运势：${res.index}${res.star}
${res.sign}
${res.res}`;
    } else {
      log.error("运势获取失败: %s", row);
      return `运势获取失败……${row}`;
    }
  } catch (err) {
    log.error("获取运势时遇到致命错误: %s", err);
    return "获取运势时遇到致命错误" + err;
  }
}
__name(getfortune, "getfortune");

// src/config.ts
var import_koishi2 = require("koishi");
var Config = import_koishi2.Schema.intersect([
  import_koishi2.Schema.object({
    delay: import_koishi2.Schema.number().default(1e3).description("回复延迟时间，降低风控风险"),
    minplusnum: import_koishi2.Schema.number().default(1).description("每次签到的最小加分数量"),
    maxplusnum: import_koishi2.Schema.number().default(10).description("每次签到最大加分数量"),
    firstplusnum: import_koishi2.Schema.number().default(20).description("首次签到的额外加分数量"),
    menu: import_koishi2.Schema.string().role("textarea", { rows: [6, 3] })
  }).description("基础配置"),
  import_koishi2.Schema.object({
    picApi: import_koishi2.Schema.string().default("").description("图片API地址"),
    setuApi: import_koishi2.Schema.string().default("").description("涩图API地址")
  }).description("图片配置"),
  import_koishi2.Schema.object({
    ncmapi: import_koishi2.Schema.string().default("").description("网易云音乐API地址"),
    limit: import_koishi2.Schema.number().default(5).description("网易云单页搜索结果数量"),
    level: import_koishi2.Schema.union([
      import_koishi2.Schema.const("standard").description("标准"),
      import_koishi2.Schema.const("higher").description("较高"),
      import_koishi2.Schema.const("exhigh").description("极高"),
      import_koishi2.Schema.const("lossless").description("无损"),
      import_koishi2.Schema.const("hires").description("Hi-Res"),
      import_koishi2.Schema.const("jyeffect").description("高清环绕声"),
      import_koishi2.Schema.const("sky").description("沉浸环绕声"),
      import_koishi2.Schema.const("dolby").description("杜比全景声"),
      import_koishi2.Schema.const("jymaster").description("超清母带")
    ]).description("音质等级 杜比全景声需要cookie的os=pc以保证码率正常"),
    cookie: import_koishi2.Schema.string().role("textarea", { rows: [4, 3] }).description("网易云音乐cookie")
  }).description("网易云音乐配置"),
  import_koishi2.Schema.object({
    isdev: import_koishi2.Schema.boolean().default(false).description("是否为测试模式\n！警告：测试模式下不会使用积分系统").experimental()
  }).description("开发者配置")
]);

// src/index.ts
var name = "codegang-qd";
var description = "Codegang签到插件";
var author = "小舍";
var inject = {
  required: ["database", "http"],
  optional: ["mail"]
};
var ncm = new Ncm();
var dajf = new jf();
var log2 = new import_koishi3.Logger("@codegang/codegang-qd");
async function apply(ctx, cfg) {
  ctx.model.extend("codegang_jf", {
    id: "unsigned",
    userid: "string",
    username: "string",
    jf: "integer",
    time: "timestamp"
  }, { autoInc: true });
  dajf.init(ctx.database, cfg);
  ncm.init(ctx.http, cfg);
  ctx.command("积分排行").alias("排行").action(async ({ session }) => {
    const topUsers = await dajf.getTopUsers(10);
    console.log(topUsers);
    let msg = "积分排行榜\n";
    topUsers.forEach((item, index) => {
      let name2 = item.username;
      if (name2 == null) {
        name2 = "<未知>";
      } else if (name2.length == 1) {
        name2 = name2;
      } else if (name2.length == 2) {
        name2 = name2[0] + "*";
      } else {
        name2 = name2.slice(0, Math.floor(name2.length / 5)) + "***" + name2.slice(Math.floor(name2.length / 5) * 4);
      }
      msg += `${index + 1}. ${item.userid}—${item.jf}
`;
    });
    session.send(msg);
  });
  ctx.command("我的积分").alias("查询积分").alias("积分查询").alias("积分").alias("jf").action(async ({ session }) => {
    (0, import_koishi3.sleep)(cfg.delay);
    session.send(`你的积分是${await dajf.get(session.userId)}`);
  });
  ctx.command("签到").alias("qd").action(async ({ session }) => {
    if (cfg.isdev) {
      return "开发版无法签到";
    }
    let user = await ctx.database.get("codegang_jf", { userid: session.userId });
    if (user.length == 0) {
      await ctx.database.create("codegang_jf", { userid: session.userId, username: session.username, jf: 0 });
    } else {
      if (user[0].username != session.username) {
        await ctx.database.set("codegang_jf", { userid: session.userId }, { username: session.username });
      }
    }
    let usertype = await dajf.chacktime(session.userId);
    let upjf;
    let mail = "";
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
        session.send(`今天已经签到过啦，上次的签到时间是${usertype.toLocaleString()}
${await getfortune(ctx.http, session.userId)}${mail}`);
        return;
      }
    }
    dajf.add(session.userId, upjf);
    dajf.updatetime(session.userId);
    let img = (0, import_koishi3.h)("img", { src: "https://t.alcy.cc/pc/" });
    let fortune = await getfortune(ctx.http, session.userId);
    let hitokoto = await getHitokoto(ctx.http);
    session.send(`签到成功，你获得了${upjf}积分` + mail + (usertype == 0 ? "\n这是你首次签到哦" : "") + `
${hitokoto}
${fortune}
${img}`);
  });
  ctx.command("积分商城").alias("积分商店").action(async ({ session }) => {
    (0, import_koishi3.sleep)(cfg.delay);
    session.send(cfg.menu);
  });
  ctx.command("兑换 <thing> [arg1]").action(async ({ session }, thing, arg1) => {
    switch (true) {
      case thing == null: {
        (0, import_koishi3.sleep)(cfg.delay);
        session.send("请输入要兑换的商品");
        break;
      }
      case (thing == "1" || thing == "一言"): {
        const price = 2;
        let jf2 = await dajf.get(session.userId);
        if (jf2 < price) {
          (0, import_koishi3.sleep)(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        dajf.reduce(session.userId, price);
        session.send(await getHitokoto(ctx.http));
        break;
      }
      case (thing == "2" || thing == "二次元"): {
        const price = 15;
        let jf2 = await dajf.get(session.userId);
        if (jf2 < price) {
          (0, import_koishi3.sleep)(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        dajf.reduce(session.userId, price);
        session.send('<img src="https://t.alcy.cc/pc/"/>');
        break;
      }
      case (thing == "3" || thing == "涩图"): {
        const price = 25;
        let jf2 = await dajf.get(session.userId);
        if (jf2 < price) {
          (0, import_koishi3.sleep)(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        try {
          let url = await ctx.http.get("https://api.lolicon.app/setu/v2");
          await dajf.reduce(session.userId, price);
          session.send(`<img src="${url.data[0].urls.original}"/>`);
        } catch (error) {
          console.error("Error fetching image:", error);
          session.send("获取图片失败，请稍后再试");
        }
        break;
      }
      case (thing == "4" || thing == "网易云"): {
        const price = 10;
        let messageid;
        let jf2 = await dajf.get(session.userId);
        if (jf2 < price) {
          (0, import_koishi3.sleep)(cfg.delay);
          session.send("积分不足哦");
          break;
        }
        let keywords = arg1;
        if (!keywords) {
          let hotSearch = await ncm.getHotSearch();
          (0, import_koishi3.sleep)(cfg.delay);
          messageid = await session.send(`请在60秒内发送要搜索的内容
当前热搜：
` + hotSearch.map((item, index) => `${item.first} `).join(""));
          keywords = await session.prompt(6e4);
          if (!keywords || keywords == "exit") {
            session.send("已退出");
            break;
          }
          await session.bot.deleteMessage(session.channelId, messageid[0]);
        }
        let search = await ncm.search(keywords);
        let msg = "";
        let choose;
        let offset = 0;
        while (true) {
          const musicnum = 30;
          msg = "";
          for (let i = 0; i < 5; i++) {
            msg += `${offset + i + 1}. ${search[offset + i].name}——${search[offset + i].ar[0].name}
${search[offset + i].al.name}<img src="${search[offset + i].al.picUrl}?param=200y200"/>
`;
          }
          msg += "请输入你要兑换的歌曲序号\n up,next翻页 exit退出";
          messageid = await session.send(msg);
          choose = await session.prompt(6e4);
          if (choose == "up") {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            if (offset != 0) {
              offset -= 5;
            }
          } else if (choose == "next") {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            if (offset + 5 < musicnum) {
              offset += 5;
            }
          } else if (choose == "exit") {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            (0, import_koishi3.sleep)(cfg.delay);
            return "已退出";
          } else if (!choose) {
            session.bot.deleteMessage(session.channelId, messageid[0]);
            return "响应已超时，已自动退出";
          } else {
            break;
          }
        }
        await session.bot.deleteMessage(session.channelId, messageid[0]);
        switch (true) {
          case choose == "exit": {
            session.send("已退出");
            break;
          }
          case (Number(choose) >= 1 && Number(choose) <= 30): {
            let song = search[Number(choose) - 1];
            let music;
            if (song.from == "【codegang曲库】") {
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
                if (cfg.level == "standard" || cfg.level == "higher" || cfg.level == "exhigh") {
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
            session.send("请输入不合法，已自动退出");
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
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  author,
  description,
  inject,
  name
});
