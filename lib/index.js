var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  author: () => author,
  description: () => description,
  inject: () => inject,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);

// src/utils/timeServer.ts
var database_name = "codegang_qd";
var time = class _time {
  static {
    __name(this, "time");
  }
  static ctx;
  static timezone;
  static Init(ctx, timezone) {
    _time.ctx = ctx;
    _time.timezone = timezone;
  }
  // 获取当前时区的时间
  static getCurrentTime() {
    const date = /* @__PURE__ */ new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 6e4;
    return new Date(utc + 36e5 * _time.timezone);
  }
  static async updateTime(userid) {
    const currentTime = _time.getCurrentTime();
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    const day = currentTime.getDate();
    const userRecords = await _time.ctx.database.get(database_name, { userid });
    const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
    if (userRecords.length === 0) {
      const monthlyRecords = {};
      monthlyRecords[yearMonth] = [day];
      await this.ctx.database.create(database_name, { userid, time: currentTime, monthlyRecords });
    } else {
      let monthlyRecords = userRecords[0].monthlyRecords || {};
      if (!monthlyRecords[yearMonth]) {
        monthlyRecords[yearMonth] = [];
      }
      if (!monthlyRecords[yearMonth].includes(day)) {
        monthlyRecords[yearMonth].push(day);
        monthlyRecords[yearMonth].sort((a, b) => a - b);
      }
      await this.ctx.database.set(database_name, { userid }, { time: currentTime, monthlyRecords });
    }
    return true;
  }
  static async checkTime(userid) {
    const userRecords = await this.ctx.database.get(database_name, { userid });
    if (!userRecords[0]?.time) return "newUser";
    const lastTime = new Date(userRecords[0].time);
    const currentTime = _time.getCurrentTime();
    const isSameDay = lastTime.getFullYear() === currentTime.getFullYear() && lastTime.getMonth() === currentTime.getMonth() && lastTime.getDate() === currentTime.getDate();
    return isSameDay ? "already" : "notToday";
  }
  static async getLastTime(userid) {
    const userRecords = await _time.ctx.database.get(database_name, { userid });
    if (!userRecords[0]?.time) return 0;
    const lastTime = new Date(userRecords[0].time);
    return lastTime;
  }
  // 获取用户连续签到天数
  static async getConsecutiveDays(userid) {
    const userRecords = await _time.ctx.database.get(database_name, { userid });
    if (!userRecords[0]?.monthlyRecords) return 0;
    const today = _time.getCurrentTime();
    let consecutiveDays = 0;
    let checkDate = new Date(today);
    while (true) {
      const year = checkDate.getFullYear();
      const month = checkDate.getMonth() + 1;
      const day = checkDate.getDate();
      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
      const monthRecord = userRecords[0].monthlyRecords[yearMonth] || [];
      if (!monthRecord.includes(day)) {
        break;
      }
      consecutiveDays++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (consecutiveDays > 9999) break;
    }
    return consecutiveDays;
  }
};

// src/utils/api.ts
var import_koishi = require("koishi");
var jsonpath = __toESM(require("jsonpath"));
var Api = class _Api {
  static {
    __name(this, "Api");
  }
  static ctx;
  static cfg;
  static Init(ctx, cfg) {
    _Api.ctx = ctx;
    _Api.cfg = cfg;
  }
  static async buildQDmessage(type, userid, username, usertype, upPoints, errorMessage) {
    let message = "";
    switch (type) {
      case "success": {
        if (!upPoints) throw new Error("Invalid parameters");
        message = this.cfg.style_text;
        break;
      }
      case "already": {
        message = this.cfg.style_already_text;
        break;
      }
      case "failed": {
        if (!errorMessage) throw new Error("Invalid parameters");
        message = this.cfg.style_failed_text;
        message = message.replace(/\{error\}/g, "获取运势失败");
        break;
      }
    }
    const consecutiveDays = await time.getConsecutiveDays(userid);
    message = message.replace(/\{user\}/g, username);
    if (upPoints) message = message.replace(/\{points\}/g, upPoints.toString() || "");
    message = message.replace(/\{fortune\}/g, await this.getFortune(userid));
    message = message.replace(/\{consecutive_days\}/g, consecutiveDays.toString());
    message = message.replace(/\{time\}/g, (/* @__PURE__ */ new Date()).toLocaleString());
    message = message.replace(/\{last_time\}/g, (await time.getLastTime(userid)).toLocaleString().toString());
    message = message.replace(/\{totalpoints\}/g, (await this.ctx.points.get(userid)).toString());
    const keys = message.match(/{([^}]+)}/g);
    if (keys) {
      for (const key of keys) {
        try {
          const keyName = key.replace(/{|}/g, "");
          const api = this.cfg.style_apiList.find((api2) => api2.key === keyName);
          if (!api || key == "{AT}") continue;
          if (api.url.startsWith("http")) {
            if (api.jsonPath == "" || api.jsonPath == void 0 || api.jsonPath == null) {
              if (api.type === "image") {
                message = message.replace(key, (0, import_koishi.h)("img", { src: api.url }).toString());
              } else {
                const response = await this.ctx.http.get(api.url);
                message = message.replace(key, response);
              }
            } else {
              const response = await this.ctx.http.get(api.url);
              const data = typeof response === "string" ? JSON.parse(response) : response;
              const value = jsonpath.query(data, api.jsonPath)[0];
              if (api.type === "image") {
                message = message.replace(key, (0, import_koishi.h)("img", { src: value }).toString());
              } else {
                message = message.replace(key, value);
              }
            }
          }
        } catch (error) {
          this.ctx.logger("codegang-qd").error(error);
          message = message.replace(key, "获取失败");
        }
      }
    }
    message = message.replace("{AT}", (0, import_koishi.h)("at", { id: userid }).toString());
    return message;
  }
  static async getFortune(userid) {
    if (!userid) throw new Error("Invalid parameters");
    if (!this.ctx.puppeteer) return "";
    userid = (Number(userid) + Number(`${(/* @__PURE__ */ new Date()).getFullYear()}${(/* @__PURE__ */ new Date()).getMonth() + 1}${(/* @__PURE__ */ new Date()).getDate()}`)).toString();
    this.ctx.puppeteer.config.args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-features=HttpsFirstBalancedModeAutoEnable"];
    let page;
    try {
      page = await this.ctx.puppeteer.browser.newPage();
      await page.goto(`http://qq.link114.cn/${userid}`);
      const res = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll("#main .listpage_content dl"));
        return items.map((dl) => {
          const label = dl.querySelector("dt").textContent.trim().replace("：", "");
          const value = dl.querySelector("dd").textContent.trim();
          return { label, value };
        });
      });
      return `今日运势：${res[0].value}${res[1].value}
${res[2].value}
${res[3].value}`;
    } catch (error) {
      this.ctx.logger("codegang-qd").error(error);
      return `获取运势失败: ${error}`;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
};

// src/commands/signIn.ts
var import_koishi3 = require("koishi");

// src/utils/check.ts
var import_koishi2 = require("koishi");
var Check = class {
  static {
    __name(this, "Check");
  }
  static async check(ctx, cfg, Session2) {
    switch (cfg.captchaType) {
      case "none": {
        return true;
      }
      case "科目1": {
        return await this.km1(ctx, Session2);
      }
    }
  }
  static async km1(ctx, session) {
    try {
      const captcha = await ctx.http.get("https://api.52vmy.cn/api/query/jiakao");
      if (captcha.code === 200) {
        let message = "你触发了人机验证，请听题：\n" + captcha.data[0].question;
        if (captcha.data[0].pic) message += (0, import_koishi2.h)("img", { src: captcha.data[0].pic }).toString();
        if (captcha.data[0].option1) {
          message += "\n" + captcha.data[0].option1;
          message += "\n" + captcha.data[0].option2;
          message += "\n" + captcha.data[0].option3;
          message += "\n" + captcha.data[0].option4;
        }
        await session.send(message);
        let userAnswer = await session.prompt(6e4);
        if (userAnswer == null || userAnswer == void 0) {
          return false;
        }
        if (captcha.data[0].answer == "错" || captcha.data[0].answer == "对") {
          if (userAnswer.includes("x") || userAnswer.includes("×") || userAnswer.includes("✗") || userAnswer.includes("❌") || userAnswer.includes("错") || userAnswer.includes("不对") || userAnswer.includes("不正确") || userAnswer.includes("不是") || userAnswer.includes("错误") || userAnswer.includes("假") || userAnswer.includes("否") || userAnswer.includes("不") || userAnswer.includes("没有") || userAnswer.includes("不行") || userAnswer.includes("不可以") || userAnswer.includes("不对的") || userAnswer.includes("不正确的") || userAnswer.includes("错的") || userAnswer.includes("假的") || userAnswer.toLowerCase().includes("no") || userAnswer.toLowerCase().includes("false") || userAnswer.toLowerCase().includes("wrong") || userAnswer.toLowerCase().includes("incorrect") || userAnswer.toLowerCase().includes("n") || userAnswer.toLowerCase().includes("f") || userAnswer.includes("0")) {
            userAnswer = "错";
          } else {
            userAnswer = "对";
          }
          if (userAnswer == captcha.data[0].answer) {
            session.send("回答正确!算你运气好，看看解析：\n\n" + captcha.data[0].explain);
            return true;
          } else {
            session.send("大笨蛋答案错误，还要加把劲呢\n\n" + captcha.data[0].explain);
            return false;
          }
        } else {
          userAnswer = userAnswer.toUpperCase();
          if (userAnswer == captcha.data[0].answer) {
            session.send("回答正确!算你运气好，看看解析：\n\n" + captcha.data[0].explain);
            return true;
          } else {
            session.send("大笨蛋答案错误，还要加把劲呢\n\n正确答案：" + captcha.data[0].answer + "\n" + captcha.data[0].explain);
            return false;
          }
        }
      }
    } catch (error) {
      return true;
    }
  }
};

// src/commands/signIn.ts
var lockSet = /* @__PURE__ */ new Set();
function registerSignInCommand(ctx, cfg) {
  ctx.command("签到").alias("qd").action(async ({ session }) => {
    const lockKey = `qd:lock:${session.userId}`;
    if (lockSet.has(lockKey)) return;
    lockSet.add(lockKey);
    try {
      let message = "";
      const usertype = cfg.isdev ? "notToday" : await time.checkTime(session.userId);
      if (usertype == "already") {
        message = (0, import_koishi3.h)("quote", { id: session.messageId }) + await Api.buildQDmessage("already", session.userId, session.username, usertype);
        await session.send(message);
        return;
      }
      if (cfg.captchaType != "none" && Math.random() < cfg.captchaProbability) {
        const captcha = await Check.check(ctx, cfg, session);
        if (!captcha) {
          await session.send("签到失败: 人机验证失败");
          lockSet.delete(lockKey);
          return;
        }
      }
      let uppoints;
      switch (usertype) {
        case "newUser": {
          uppoints = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum) + cfg.firstplusnum;
          break;
        }
        case "notToday": {
          uppoints = Math.floor(Math.random() * (cfg.maxplusnum - cfg.minplusnum + 1) + cfg.minplusnum);
          break;
        }
        default: {
          session.send("签到失败: 意料之外的usertype");
          return;
        }
      }
      const transaction = ctx.points.generateTransactionId();
      const res = await ctx.points.add(session.userId, transaction, uppoints, name);
      await time.updateTime(session.userId);
      message = (0, import_koishi3.h)("quote", { id: session.messageId }) + (cfg.isdev ? "【测试模式】" : "") + await Api.buildQDmessage("success", session.userId, session.username, usertype, uppoints);
      await session.send(message);
    } finally {
      lockSet.delete(lockKey);
    }
  });
}
__name(registerSignInCommand, "registerSignInCommand");

// src/commands/index.ts
function registerCommands(ctx, cfg) {
  registerSignInCommand(ctx, cfg);
  ctx.command("test").action(async ({ session }) => {
    session.send((await time.getConsecutiveDays(session.userId)).toString());
    return;
  });
}
__name(registerCommands, "registerCommands");

// src/services/init.ts
function InitPlugin(ctx, cfg) {
  time.Init(ctx, cfg.timezone);
  Api.Init(ctx, cfg);
  ctx.model.extend("codegang_qd", {
    id: "unsigned",
    userid: "string",
    time: "timestamp",
    // 今日签到时间
    monthlyRecords: "json"
    // 本月签到记录
  }, { autoInc: true });
  registerCommands(ctx, cfg);
  ctx.on("exit", async () => {
  });
}
__name(InitPlugin, "InitPlugin");

// src/config/index.ts
var import_koishi4 = require("koishi");
var Config = import_koishi4.Schema.intersect([
  import_koishi4.Schema.object({
    minplusnum: import_koishi4.Schema.number().default(1).description("每次签到的最小加分数量"),
    maxplusnum: import_koishi4.Schema.number().default(10).description("每次签到最大加分数量"),
    firstplusnum: import_koishi4.Schema.number().default(20).description("首次签到的额外加分数量"),
    captchaType: import_koishi4.Schema.union(["none", "科目1"]).default("none").description("验证码类型"),
    captchaProbability: import_koishi4.Schema.number().min(0).max(1).default(0.5).step(0.1).description("人机验证触发概率"),
    timezone: import_koishi4.Schema.union([
      import_koishi4.Schema.const(1).description("东一区（+1）"),
      import_koishi4.Schema.const(2).description("东二区（+2）"),
      import_koishi4.Schema.const(3).description("东三区（+3）"),
      import_koishi4.Schema.const(4).description("东四区（+4）"),
      import_koishi4.Schema.const(5).description("东五区（+5）"),
      import_koishi4.Schema.const(6).description("东六区（+6）"),
      import_koishi4.Schema.const(7).description("东七区（+7）"),
      import_koishi4.Schema.const(8).description("东八区（+8）"),
      import_koishi4.Schema.const(9).description("东九区（+9）"),
      import_koishi4.Schema.const(10).description("东十区（+10）"),
      import_koishi4.Schema.const(11).description("东十一区（+11）"),
      import_koishi4.Schema.const(12).description("东十二区（+12）"),
      import_koishi4.Schema.const(-1).description("西一区（-1）"),
      import_koishi4.Schema.const(-2).description("西二区（-2）"),
      import_koishi4.Schema.const(-3).description("西三区（-3）"),
      import_koishi4.Schema.const(-4).description("西四区（-4）"),
      import_koishi4.Schema.const(-5).description("西五区（-5）"),
      import_koishi4.Schema.const(-6).description("西六区（-6）"),
      import_koishi4.Schema.const(-7).description("西七区（-7）"),
      import_koishi4.Schema.const(-8).description("西八区（-8）"),
      import_koishi4.Schema.const(-9).description("西九区（-9）"),
      import_koishi4.Schema.const(-10).description("西十区（-10）"),
      import_koishi4.Schema.const(-11).description("西十一区（-11）"),
      import_koishi4.Schema.const(-12).description("西十二区（-12）"),
      import_koishi4.Schema.const(0).description("UTC协调世界时（+0）")
    ]).default(8).description("时区")
  }).description("基础配置"),
  import_koishi4.Schema.object({
    style_text: import_koishi4.Schema.string().default("签到成功，你获得了{points}积分\n今天是你连续签到的第{consecutive_days}天哦").description("签到成功的文本").role("textarea", { rows: [4, 3] }),
    style_already_text: import_koishi4.Schema.string().default("你今天已经签到过了哦").description("已签到的文本").role("textarea", { rows: [4, 3] }),
    style_failed_text: import_koishi4.Schema.string().default("签到出现异常，请联系管理员：{error}").description("签到失败的文本").role("textarea", { rows: [4, 3] }).experimental(),
    style_welcome_text: import_koishi4.Schema.string().default("这是你首次签到哦").description("新用户签到欢迎语").role("textarea", { rows: [4, 3] })
  }).description("签到样式"),
  import_koishi4.Schema.object({
    style_apiList: import_koishi4.Schema.array(import_koishi4.Schema.object({
      key: import_koishi4.Schema.string().description("绑定值"),
      type: import_koishi4.Schema.union(["text", "image"]).description("绑定值的类型"),
      url: import_koishi4.Schema.string().description("URL/text，当文本开头不是http将会作为普通文本嵌入"),
      jsonPath: import_koishi4.Schema.string().description("API的响应数据路径")
    })).role("table").description("可自定义的API列表")
  }),
  import_koishi4.Schema.object({
    isdev: import_koishi4.Schema.boolean().default(false).description("是否为测试模式\n！警告：测试模式下不会使用积分系统").experimental()
  }).description("开发者配置")
]);

// src/index.ts
var name = "codegang-qd";
var description = "一个高度可自定义化的签到插件";
var author = "小舍";
var inject = ["database", "http", "puppeteer", "points"];
var usage = `
# 签到插件
## 介绍

## 签到自定义文本变量一览
- \`{AT}\`为艾特用户  
- \`{username}\`为用户昵称  
- \`{points}\`为用户获得的积分  
- \`{fortune}\`为用户运势  
- \`{consecutive_days}\`为用户连续签到天数
- \`{time}\`为用户签到时间  
- \`{totalpoints}\`为用户总积分  
- \`{<key>}\`其他绑定值  
`;
async function apply(ctx, cfg) {
  InitPlugin(ctx, cfg);
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  author,
  description,
  inject,
  name,
  usage
});
