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
  version: () => version
});
module.exports = __toCommonJS(src_exports);
var import_koishi3 = require("koishi");

// src/api.ts
var import_koishi = require("koishi");
var jsonpath = __toESM(require("jsonpath"));

// src/timeServer.ts
var database_name = "codegang_qd";
var time = class {
  static {
    __name(this, "time");
  }
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  async updateTime(userid) {
    const userRecords = await this.ctx.database.get(database_name, { userid });
    if (userRecords.length === 0) {
      this.ctx.database.create(database_name, { userid, time: /* @__PURE__ */ new Date() });
    } else {
      this.ctx.database.set(database_name, { userid }, { time: /* @__PURE__ */ new Date() });
    }
    return true;
  }
  async checkTime(userid) {
    const userRecords = await this.ctx.database.get(database_name, { userid });
    if (!userRecords[0]?.time) return "newUser";
    const lastTime = new Date(userRecords[0].time);
    const nowTime = /* @__PURE__ */ new Date();
    const isSameDay = lastTime.getUTCFullYear() === nowTime.getUTCFullYear() && lastTime.getUTCMonth() === nowTime.getUTCMonth() && lastTime.getUTCDate() === nowTime.getUTCDate();
    return isSameDay ? "already" : "notToday";
  }
  async getLastTime(userid) {
    const userRecords = await this.ctx.database.get(database_name, { userid });
    if (!userRecords[0]?.time) 0;
    const lastTime = new Date(userRecords[0].time);
    return lastTime;
  }
};

// src/api.ts
var api = class {
  static {
    __name(this, "api");
  }
  ctx;
  cfg;
  timeService;
  constructor(ctx, cfg) {
    this.ctx = ctx;
    this.cfg = cfg;
    this.timeService = new time(ctx);
  }
  async buildQDmessage(type, userid, username, usertype, upPoints, errorMessage) {
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
    message = message.replace(/\{user\}/g, username);
    if (upPoints) message = message.replace(/\{points\}/g, upPoints.toString() || "");
    message = message.replace(/\{fortune\}/g, await this.getFortune(userid));
    message = message.replace(/\{time\}/g, (/* @__PURE__ */ new Date()).toLocaleString());
    message = message.replace(/\{last_time\}/g, (await this.timeService.getLastTime(userid)).toLocaleString().toString());
    message = message.replace(/\{totalpoints\}/g, (await this.ctx.points.get(userid)).toString());
    const keys = message.match(/{([^}]+)}/g);
    if (keys) {
      for (const key of keys) {
        const keyName = key.replace(/{|}/g, "");
        const api2 = this.cfg.style_apiList.find((api3) => api3.key === keyName);
        if (!api2 || key == "{AT}") continue;
        if (api2.url.startsWith("http")) {
          if (api2.jsonPath == "" || api2.jsonPath == void 0 || api2.jsonPath == null) {
            if (api2.type === "image") {
              message = message.replace(key, (0, import_koishi.h)("img", { src: api2.url }).toString());
            } else {
              const response = await this.ctx.http.get(api2.url);
              message = message.replace(key, response);
            }
          } else {
            const response = await this.ctx.http.get(api2.url);
            const data = typeof response === "string" ? JSON.parse(response) : response;
            const value = jsonpath.query(data, api2.jsonPath)[0];
            if (api2.type === "image") {
              message = message.replace(key, (0, import_koishi.h)("img", { src: value }).toString());
            } else {
              message = message.replace(key, value);
            }
          }
        }
      }
    }
    message = message.replace("{AT}", (0, import_koishi.h)("at", { id: userid }).toString());
    return message;
  }
  async getFortune(userid) {
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

// src/config.ts
var import_koishi2 = require("koishi");
var Config = import_koishi2.Schema.intersect([
  import_koishi2.Schema.object({
    minplusnum: import_koishi2.Schema.number().default(1).description("每次签到的最小加分数量"),
    maxplusnum: import_koishi2.Schema.number().default(10).description("每次签到最大加分数量"),
    firstplusnum: import_koishi2.Schema.number().default(20).description("首次签到的额外加分数量")
  }).description("基础配置"),
  import_koishi2.Schema.object({
    style_text: import_koishi2.Schema.string().description("签到成功的文本\n`{user}`为用户昵称\n`{points}`为用户积分\n`{fortune}`为用户运势\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分").role("textarea", { rows: [4, 3] }),
    style_already_text: import_koishi2.Schema.string().description("已签到的文本\n`{user}`为用户昵称\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分").role("textarea", { rows: [4, 3] }),
    style_failed_text: import_koishi2.Schema.string().description("签到失败的文本\n`{user}`为用户昵称\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分").role("textarea", { rows: [4, 3] }).experimental(),
    style_welcome_text: import_koishi2.Schema.string().default("这是你首次签到哦").description("新用户签到欢迎语\n`{user}`为用户昵称\n`{time}`为用户签到时间").role("textarea", { rows: [4, 3] })
  }),
  import_koishi2.Schema.object({
    style_apiList: import_koishi2.Schema.array(import_koishi2.Schema.object({
      key: import_koishi2.Schema.string().description("绑定值"),
      type: import_koishi2.Schema.union(["text", "image"]).description("绑定值的类型"),
      url: import_koishi2.Schema.string().description("URL/text，当文本开头不是http将会作为普通文本嵌入"),
      jsonPath: import_koishi2.Schema.string().description("API的响应数据路径")
    })).role("table")
  }).description("签到样式"),
  import_koishi2.Schema.object({
    isdev: import_koishi2.Schema.boolean().default(false).description("是否为测试模式\n！警告：测试模式下不会使用积分系统").experimental()
  }).description("开发者配置")
]);

// src/index.ts
var name = "codegang-qd";
var description = "Codegang签到插件";
var author = "小舍";
var version = "2.0.0";
var lockSet = /* @__PURE__ */ new Set();
var inject = ["database", "http", "puppeteer", "points"];
var log = new import_koishi3.Logger("@codegang/codegang-qd");
async function apply(ctx, cfg) {
  const Api = new api(ctx, cfg);
  ctx.model.extend("codegang_qd", {
    id: "unsigned",
    userid: "string",
    time: "timestamp",
    // 今日签到时间
    monthlyRecords: "json"
    // 本月签到记录
  }, { autoInc: true });
  this.timeService = new time(ctx);
  ctx.command("test").action(async ({ session }) => {
    session.send("这是通过新版本取出的积分数据" + await ctx.points.get(session.userId));
  });
  ctx.command("积分排行").alias("排行").action(async ({ session }) => {
    const topUsers = await ctx.points.getTopN(10);
    let msg = "积分排行榜\n";
    topUsers.forEach((item, index) => {
      if (!item.username) {
        item.username = item.userid;
      }
      let name2 = item.username;
      if (name2.length == 1) {
        name2 = name2;
      } else if (name2.length <= 5) {
        name2 = name2.slice(0, Math.floor(name2.length / 2)) + "***";
      } else {
        name2 = name2.slice(0, Math.floor(name2.length / 5)) + "***" + name2.slice(Math.floor(name2.length / 5) * 4);
      }
      msg += `${index + 1}. ${name2}—${item.points}
`;
    });
    session.send(msg);
  });
  ctx.command("签到").alias("qd").action(async ({ session }) => {
    const lockKey = `qd:lock:${session.userId}`;
    if (lockSet.has(lockKey)) return;
    lockSet.add(lockKey);
    try {
      const usertype = cfg.isdev ? "notToday" : await this.timeService.checkTime(session.userId);
      if (usertype == "already") {
        const message2 = (0, import_koishi3.h)("quote", { id: session.messageId }) + await Api.buildQDmessage("already", session.userId, session.username, usertype);
        await session.send(message2);
        return;
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
      this.timeService.updateTime(session.userId);
      const message = (0, import_koishi3.h)("quote", { id: session.messageId }) + (cfg.isdev ? "【测试模式】" : "") + await Api.buildQDmessage("success", session.userId, session.username, usertype, uppoints);
      await session.send(message);
    } finally {
      lockSet.delete(lockKey);
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
  name,
  version
});
