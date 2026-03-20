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
  checkConfig: () => checkConfig,
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

// src/services/api.ts
var import_koishi = require("koishi");
var jsonpath = __toESM(require("jsonpath"));

// src/utils/fortune_data.ts
function FortuneHash(userId, date = /* @__PURE__ */ new Date()) {
  const userIdStr = userId.toString();
  const dateStr = date.toISOString().split("T")[0];
  const userIdHash = hashString(userIdStr);
  const dateHash = hashString(dateStr);
  const combinedHash = combineHashes(userIdHash, dateHash);
  return Math.abs(combinedHash % fortuneData.length - 1);
}
__name(FortuneHash, "FortuneHash");
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}
__name(hashString, "hashString");
function combineHashes(hash1, hash2) {
  let combined = hash1 ^ hash2;
  combined = (combined ^ combined >>> 16) * 2246822507;
  combined = (combined ^ combined >>> 13) * 3266489909;
  return combined ^ combined >>> 16;
}
__name(combineHashes, "combineHashes");
var fortuneData = [
  {
    "id": 1,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "得而复失，枉费心机，守成无贪，可保安稳",
    "interpretation": "一生艰难辛苦，如波浪之重叠不绝，终身多受挫折而致病弱，刑罚，孤独夭寿之凶兆，若能及早修行善德，脱离凡俗而隐退者，尚可保小康之清福，则化凶为吉也。"
  },
  {
    "id": 2,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "大展鸿图，信用得固，无远弗界，可获成功",
    "interpretation": "地开泰万事成，身体康安亦富荣，否泰名誉兼享福，一生无忧乐绵长。顺风满帆而容易有所成就，易取富贵人生。"
  },
  {
    "id": 3,
    "summary": "凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "根基不固，摇摇欲坠，一盛一衰，劳而无功",
    "interpretation": "与人合伙比之独营好得多，若自己独营商则中途易受挫折。"
  },
  {
    "id": 4,
    "summary": "大吉+官运",
    "rating": "★★★★★★☆",
    "verse": "根深蒂固，蒸蒸日上，如意吉祥，百事顺遂",
    "interpretation": "进取富贵又如意，智达明敏扬名威，名利寿福皆此得，前途光茫好鸿图。外缘殊胜，容易得人之助力及予人好印象。"
  },
  {
    "id": 5,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "坎坷前途，苦难折磨，非有毅力，难望成功",
    "interpretation": "为人独断独行，事事自行作主解决，鲜有求助他人。而这份独立个性，正正就是吸引异性的特质。但其实心底里，却是渴望有人可让他/她依赖。"
  },
  {
    "id": 6,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "阴阳和合，生意欣荣，名利双收，后福重重",
    "interpretation": "福禄寿长阴阳和，心身健全是英豪，名利双收富荣达，乃是世上福德人。财源特佳金钱有餘，离出生之地而往大都市求谋必得更发达。"
  },
  {
    "id": 7,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "万宝云集，天降幸运，立志奋发，可成大功",
    "interpretation": "安稳余庆福禄开，盛大幸福天赐来，内含衰兆应谨慎，注意品行福乐享。名誉良好，信用亦佳，步步高升。"
  },
  {
    "id": 8,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "专心经营，和气致祥，排除万难，必获成功",
    "interpretation": "刚毅果断除万难，独立权威志气安，内外和好兼柔性，温和养德耀吉星。很勤勉求上进，又很有耐力，在技术界或艺能界，是最可能成功之数也。但此数因少得人和，而略感孤独些。"
  },
  {
    "id": 9,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "努力发达，贯彻志望，不忘进退，成功可期",
    "interpretation": "意志坚刚善恶明，富进取心求和平，忍耐克己如心意，前难后成可安然。很勤勉求上进，又很有耐力，在技术界或艺能界，是最可能成功之数也。但此数因少得人和，而略感孤独些。"
  },
  {
    "id": 10,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "虽抱奇才，有才无命，独营无力，财利无望",
    "interpretation": "你虽然很有才，但是却没这个命（时运）；事业上自己单干，是不会有什么好发展的，财利难望意思是说发财致富这个愿望是很难实现的。"
  },
  {
    "id": 11,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "乌云遮月，暗淡无光，空费心力，徒劳无功",
    "interpretation": "有特强的第六灵感，性格率直无机心，深得朋辈爱戴。感情路上多采多姿。做事喜好凭个人直觉及预感做决定。"
  },
  {
    "id": 12,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "草木逢春，枯叶沾露，稳健着实，必得人望",
    "interpretation": "挽回家运矣春光，顺调发展财辉煌，温和笃实阴阳合，稳健顺调得人望。顺风满帆而容易有所成就，易取富贵人生。外缘殊胜，容易得人之助力及予人好印象。"
  },
  {
    "id": 13,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "薄弱无力，孤立无摇，外祥内苦，谋事难成",
    "interpretation": "人生路上诸事不顺，自身能力之限制，经常迫于无耐。由于性格或人际关系上的问题，难遇贵人。经常一人处理所有事情，即使有天大的能力，总会遇到不能解决的问题，而这些问题会导致事业的失败。"
  },
  {
    "id": 14,
    "summary": "大吉+官运+才艺",
    "rating": "★★★★★★☆",
    "verse": "天赋吉运，能得人望，善用智慧，必获成功",
    "interpretation": "智略超群博学多，善处事务亦忍和，功业成就得富荣，艺才相身乐千锺。外缘殊胜，容易得人之助力及予人好印象。具有此数之人，男多勇敢果断，女多貌若天仙，有风流不羁(不顾时局大体)倾向，若修养不够或抑制力不强，往往因桃色事件惹来麻烦。"
  },
  {
    "id": 15,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "忍得苦难，必有后福，是成是败，惟靠坚毅",
    "interpretation": "只要有坚毅的决心，肯下功夫肯吃苦，多么难的事也能做成功。成功了，福也是必然相随。"
  },
  {
    "id": 16,
    "summary": "大吉+财运",
    "rating": "★★★★★★☆",
    "verse": "谦恭做事，必得人和，大事成就，一定兴隆",
    "interpretation": "福寿拱照德望高，财子寿全又温和，慈祥好善可恭敬，富贵繁荣得惠泽。财源特佳金钱有餘，离出生之地而往大都市求谋必得更发达。外缘殊胜，容易得人之助力及予人好印象。"
  },
  {
    "id": 17,
    "summary": "大吉+官运+财运",
    "rating": "★★★★★★☆",
    "verse": "能获众望，成就大业，名利双收，盟主四方",
    "interpretation": "贵人得助天乙扶，为人之上有财富，众望所归事业成，不可贪色保安宁。名誉良好，信用亦佳，步步高升。外缘殊胜，容易得人之助力及予人好印象。"
  },
  {
    "id": 18,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "排除万难，有贵人助，把握时机，可得成功",
    "interpretation": "突破万难权威高，刚性固执如英豪，须事谨慎守和平，可得大功奏业成。很勤勉求上进，又很有耐力，在技术界或艺能界，是最可能成功之数也。但此数因少得人和，而略感孤独些。"
  },
  {
    "id": 19,
    "summary": "中吉+才艺",
    "rating": "★★★★★☆☆",
    "verse": "经商做事，顺利昌隆，如能慎始，百事亨通",
    "interpretation": "有志竟成事皆通，智谋发展有威望，过刚遭难咸柔德，博得名利大成功。很勤勉求上进，又很有耐力，在技术界或艺能界，是最可能成功之数也。但此数因少得人和，而略感孤独些。"
  },
  {
    "id": 20,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "成功虽早，慎防空亏，内外不合，障碍重重",
    "interpretation": "事业初得成功，不能过度放松警惕，不要将积累的资本挥霍一空。如果团队里人心不能合到一起，今后做起事来也会遇到很多的阻碍。"
  },
  {
    "id": 21,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "智高志大，历尽艰难，焦心忧劳，进退两难",
    "interpretation": "即使有宏图大志并且能力超人，但全靠白手起家，需要突破社会重重规则，劳劳碌碌，最后可能处于进退两难的选择当中，不过，由于个人毅力与才气，只要坚持，最后终必成功。"
  },
  {
    "id": 22,
    "summary": "大吉+官运",
    "rating": "★★★★★★☆",
    "verse": "专心经营，善用智慧，霜雪梅花，春来怒放",
    "interpretation": "明月光照乐依依，俟如梅花待放时，兴家立业名利全，各自独立有权威。男带此数，需要加强节制力，可免受桃花困扰。女则因事业雄心万丈，多晚婚。"
  },
  {
    "id": 23,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "秋草逢霜，怀才不遇，忧愁怨苦，事不如意",
    "interpretation": "秋天的枯草已经赶上了冰冷的寒霜，而我胸怀才学但生不逢时，难以施展，人生尽是这些忧愁、埋怨、苦衷，人生之事都不如意。"
  },
  {
    "id": 24,
    "summary": "大吉+官运",
    "rating": "★★★★★★☆",
    "verse": "旭日升天，名显四方，渐次进展，终成大业",
    "interpretation": "旭日东昇势壮富，贯彻大业万事胜，终至荣达功名显，猛虎添翼势声强。具有此数之人，男多勇敢果断，女多貌若天仙，有风流不羁(不顾时局大体)倾向，若修养不够或抑制力不强，往往因桃色事件惹来麻烦。"
  },
  {
    "id": 25,
    "summary": "大吉+财运",
    "rating": "★★★★★★☆",
    "verse": "锦绣前程，须靠自力，多用智谋，能奏大功",
    "interpretation": "家门余庆福无疆，子孙繁荣富贵强，白手成家立大业，财源广进智谋全。营商的话还是独营的好，与人合伙久之厌烦不耐。少年读书需用心，舟至桥头直自然。"
  },
  {
    "id": 26,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "天时地利，再得人格，讲信修睦，即可成功",
    "interpretation": "资性英敏有奇能，怪癖不和害前程，修身涵养与仁和，奏功获得大鸿图。需要注重个人私生活，可免因桃色韵事贻误前程。"
  },
  {
    "id": 27,
    "summary": "凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "波澜起伏，千变万化，凌驾万难，必可成功",
    "interpretation": "局势不稳定，变化极多，任何困难都难不到你，最终您将一定会成功，且成就不小，关键是您能否在多变的艰难环境下坚持到最后。"
  },
  {
    "id": 28,
    "summary": "凶带吉",
    "rating": "★★☆☆☆☆☆",
    "verse": "一成一败，一盛一衰，惟靠谨慎，可守成功",
    "interpretation": "成 败， 盛 衰这都是相对的，有成功就会有失败，有强盛就会有衰落这都只是时间问题，只有坚定的信念对能获得一定的成功但并不能够永久。"
  },
  {
    "id": 29,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "鱼临旱地，难逃恶运，此数大凶，不如更名",
    "interpretation": '现时处境就如鱼在旱地上一样，面临大的恶运，是大凶之兆，此处的"不如更名"从现代角度来看，并非全指改名，而更多是指要改变现在的做人处事方式，才能摆脱大凶的来临。'
  },
  {
    "id": 30,
    "summary": "大吉+官运+财运+才艺",
    "rating": "★★★★★★★",
    "verse": "如龙得云，青云直上，智谋奋进，才略奏功",
    "interpretation": "欲望难足希望高，计谋成功财力豪，猜疑嫉妒性自改，如龙乘云势运开。智能超人贯彻大志，富贵无比，不甘寂寞，叱吒风云之大吉数，但容易发生牢骚及贪心、欲望太多而永不知足，为其缺点。切忌沉迷投机，可免贻误前程。"
  },
  {
    "id": 31,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "吉凶参半，得失相伴，投机取巧，如赛一样",
    "interpretation": "没有做太多对他人有价值的事情，导到一生来所做的事有如博彩，投机取巧，来得快也去得快，没有多少剩余，命运也在输赢之间转变。"
  },
  {
    "id": 32,
    "summary": "大吉+官运",
    "rating": "★★★★★★☆",
    "verse": "此数大吉，名利双收，渐进向上，大业成就",
    "interpretation": "智勇得志意气新，建立声誉事业兴，终到富贵福禄奏，为人领导德望高。顺风满帆而容易有所成就，易取富贵人生。"
  },
  {
    "id": 33,
    "summary": "中吉+财运",
    "rating": "★★★★☆☆☆",
    "verse": "池中之龙，风云际会，一跃上天，成功可望",
    "interpretation": "侥倖所得贵人扶，善捉机会有财富，认真努力向前程，家门隆昌得富荣。与人合伙比之独营好得多，若自己独营商则中途易受挫折。"
  },
  {
    "id": 34,
    "summary": "大吉+财运+才艺",
    "rating": "★★★★★★☆",
    "verse": "不可意气，善用智慧，如能慎始，必可昌隆",
    "interpretation": "家门隆昌精神爽，博得名利星月朗，权威智谋极周全，君是天下富贵翁。具有此数之人，男则勇敢果断，而女则美貌如仙子，有风流不羁(不顾时局大体)倾向，若修养不够或抑制力不强，往往因桃色事件惹来麻烦。"
  },
  {
    "id": 35,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "灾难不绝，难望成功，此数大凶，不如更名",
    "interpretation": '人生路上遇到相当多困难，特别在追求事业的路上，什么事情很难成功。此处的"不如更名"从现代角度来看，并非全指改名，而更多是指要改变现在的做人处事方式，方能扭转现在的运数。'
  },
  {
    "id": 36,
    "summary": "中吉",
    "rating": "★★★★☆☆☆",
    "verse": "中吉之数，进退保守，生意安稳，成就可期",
    "interpretation": "温和平安艺才高，努力前途福运来，文笔奇绝仁德高，务实稳健掌门人。"
  },
  {
    "id": 37,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "波澜重迭，常陷穷困，动不如静，有才无命",
    "interpretation": "越是对命运的抗争，越是使自已陷入困境，常常想靠自已改变命运，却一次次使自已的生活走入穷困，还不如听天由命，安于本份。"
  },
  {
    "id": 38,
    "summary": "中吉+才艺",
    "rating": "★★★★☆☆☆",
    "verse": "逢凶化吉，吉人天相，风条雨顺，生意兴隆",
    "interpretation": "权威显达得众望，忠实热诚运极旺，大德奏功无难事，终得富荣乐千锺。"
  },
  {
    "id": 39,
    "summary": "凶带吉",
    "rating": "★★★☆☆☆☆",
    "verse": "名虽可得，利则难获，艺界发展，可望成功",
    "interpretation": "可能有名气，却未能用这名气带来财运，可考虑从事娱乐或艺术来业，把名气转化成事业中一部分。"
  },
  {
    "id": 40,
    "summary": "大吉+官运",
    "rating": "★★★★★★☆",
    "verse": "富贵荣华实可当，光明荣达好儿郎，家门隆昌福万千，世代子孙个个贤。",
    "interpretation": "因异性而引起之纠纷困扰，失利特多，而且一生常遇逆境之折磨。家庭和顺则万事可成。智能超人贯彻大志，富贵无比，不甘寂寞，叱吒风云之大吉数。切忌牢骚、贪心、欲望太多、永不知足影响前程。"
  },
  {
    "id": 41,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "一胜一衰，浮沉不定，知难而退，自获天佑",
    "interpretation": "谨慎保安勿自骄，智谋胆略得显晓，知难而退获天佑，妄进逞强败涂地。"
  },
  {
    "id": 42,
    "summary": "大吉+财运+官运",
    "rating": "★★★★★★☆",
    "verse": "天赋吉运，德望兼备，继续努力，前途无限",
    "interpretation": "德望高大名誉振，才谋健全财源进，富贵荣华福禄至，前途洋洋得意真。"
  },
  {
    "id": 43,
    "summary": "吉带凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "事业不专，十九不成，专心进取，可望成功",
    "interpretation": "对事业不专注者，很难有所成就，有了进取心，对事业专心致志才有成功的希望！"
  },
  {
    "id": 44,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "雨夜之花，外祥内苦，忍耐自重，转凶为吉",
    "interpretation": "下雨对于花来说，是件好事，但是雨夜，像征着孤独、恐惧、所以，看似吉祥的一片，实是内心承受着煎熬。如果坚强的忍耐过雨夜的敲打，熬过寂寞与恐惧，待明晨又是个艳阳天。"
  },
  {
    "id": 45,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "虽用心计，事难遂愿，贪功好进，必招失败",
    "interpretation": "无论在社会中有什么地位都会被认定为最低层的人。你深深体会到社会的不公平一面，为了替贫民谋幸福，你会想尽办法改善社会的状况，尤其是如何改善最低下层平民的生活。"
  },
  {
    "id": 46,
    "summary": "中吉+官运",
    "rating": "★★★★★☆☆",
    "verse": "杨柳遇春，绿叶发枝，冲破难关，一举成名",
    "interpretation": "新生泰运顺行舟，排除万难总无忧，成功繁荣四海明，荣华富贵好前程。"
  },
  {
    "id": 47,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "坎坷不平，艰难重重，若无耐心，难望有成",
    "interpretation": "人生过程中，您会遇到非常多的困难，有一坡未平一坡又起之势，在面对这些坎坷时，只要有耐心和毅力，最终都会获得成功的，否则容易一事无成。"
  },
  {
    "id": 48,
    "summary": "大吉",
    "rating": "★★★★★☆☆",
    "verse": "有贵人助，可成大业，虽遇不幸，浮沉不大",
    "interpretation": "开花结子衣食足，大业奏功可庆祝，子孙繁荣多快乐，一家圆满庆有馀。"
  },
  {
    "id": 49,
    "summary": "大吉+才艺",
    "rating": "★★★★★★☆",
    "verse": "美化丰实，鹤立鸡群，名利俱全，繁荣富贵",
    "interpretation": "有德且智德望高，堪为顾问得仁和，名利双收天赋富，威望荣达世间豪。"
  },
  {
    "id": 50,
    "summary": "凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "遇吉则吉，遇凶则凶，惟靠谨慎，逢凶化吉",
    "interpretation": "遇到好的的人或事自然就会有好的事情发生或是有好的事降临，相反的遇到坏人坏事就会有糟糕的事情发生讨厌的人来了，想要不被厄运控制，打破坏人坏事的困扰，就只有小心谨慎，有了这种心思方可逢凶化吉，就是遇到坏的也可以变成好的。"
  },
  {
    "id": 51,
    "summary": "吉带凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "吉凶互见，一成一败，凶中有吉，吉中有凶",
    "interpretation": "一生并不顺利，在顺境时，记得要居安思危；在逆境时千万不要气馁，以您的性格，可以做到逆境中发现机会，从危机中发现生机。"
  },
  {
    "id": 52,
    "summary": "吉带凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "一盛一衰，浮沉不常，自重自处，可保平安",
    "interpretation": "人生有盛有衰，十年河西，十年河东。不论在顺利的时候的还是在倒霉的时候，都要做到自重自处，不能因胜利而洋洋自得，也不能因失败而一蹶不振，只要这样，才能平平安安！"
  },
  {
    "id": 53,
    "summary": "大吉+财运",
    "rating": "★★★★★★☆",
    "verse": "草木逢春，雨过天晴，渡过难关，即获成功",
    "interpretation": "先见机明察佳期，意志坚固好运时，功名利达福禄全，一世荣隆乐绵绵。"
  },
  {
    "id": 54,
    "summary": "吉带凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "盛衰参半，外祥内苦，先吉后凶，先凶后吉",
    "interpretation": "一生好运与恶运都会让您遇上，当外表风光时，可能您的内心正受到非常大的困苦。前半生可能过得很苦，但后半生会出现转运，生活变得很美好；也有可能是前半生过得很风光，而后半生却很潦倒。"
  },
  {
    "id": 55,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "虽倾全力，难望成功，此数大凶，最好改名",
    "interpretation": "即使全力以赴，却没有取得成功。导致失败的原因是现时的待人处事方式有问题，要改变这个现状，要自我反省，改变一些令人厌恶的恶习，方可取得成功。"
  },
  {
    "id": 56,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "外观隆昌，内隐祸患，克服难关，开出泰运",
    "interpretation": "外人看来很风光，而自已内部隐藏的危机，只要解决内部的危机，人生将会过得风风火火。"
  },
  {
    "id": 57,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "事与愿违，终难成功，欲速不达，有始有终",
    "interpretation": "做事不能三分钟热度，要有始有终。急于求成，将会事与愿违，大事难成。"
  },
  {
    "id": 58,
    "summary": "中吉",
    "rating": "★★★★☆☆☆",
    "verse": "努力经营，时来运转，旷野枯草，春来花开",
    "interpretation": "寒雪青松性刚强，一度祸难过灾殃，将此发达利亨通，晚景繁荣福无疆。"
  },
  {
    "id": 59,
    "summary": "凶带吉",
    "rating": "★★★☆☆☆☆",
    "verse": "半凶半吉，浮沉多端，始凶终吉，能保成功",
    "interpretation": "所求之事，是吉凶参半。所要经历的，既有非你所愿、无法承受之痛苦，也有甘之如饴、顺风顺水之运气。无法如预期的稳定，不确定的因素对其本身影响很大。要老老实实接受磨难的考验，之后成功就会不期而遇。"
  },
  {
    "id": 60,
    "summary": "凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "遇事犹疑，难望成事，大刀阔斧，始可有成",
    "interpretation": "做事犹豫、不果断，很难做成功；变得果断勇敢了，才有希望。"
  },
  {
    "id": 61,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "黑暗无光，心迷意乱，出尔反尔，难定方针",
    "interpretation": "黑暗无光之凶运数。不仅事事不能如意，加以心迷意乱，难决定方针，出尔反尔，徒蒙损失，虽获成就。如能就初衷贯彻，或有小康之望。"
  },
  {
    "id": 62,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "云遮半月，百隐风波，应自谨慎，始保平安",
    "interpretation": "最近运势不好，有对你不利的事情（不好的事情）要发生，自己办事情，说话要谨慎小心，才能避过这些。"
  },
  {
    "id": 63,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "烦闷懊恼，事事难展，自防灾祸，始免困境",
    "interpretation": "受到各种事情的烦扰，不能专心做想做的事情。首要问题是处理好现时的各种烦事，这样可以避免这些小事埋下的祸害，才不导致自已陷入困境。"
  },
  {
    "id": 64,
    "summary": "大吉",
    "rating": "★★★★★☆☆",
    "verse": "万物化育，繁荣之象，专心一意，始能成功",
    "interpretation": "富贵荣达得显甯，子孙繁茂福绵绵，一身平安富益寿，福禄双全享千锺。"
  },
  {
    "id": 65,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "见异思迁，十九不成，徒劳无功，不如更名",
    "interpretation": "见异思迁，使自已做的事情无一成功，开始全情投入，到后面却不能坚持，事情总是在这种情况下失败。要改变心态和做事方式，看准方向就坚持到底，方可成功。"
  },
  {
    "id": 66,
    "summary": "吉",
    "rating": "★★★★☆☆☆",
    "verse": "吉运自来，能享盛名，把握机会，必获成功",
    "interpretation": "人生路上机会众多，只要把握好一次机会，将会改写您的人生。"
  },
  {
    "id": 67,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "黑夜漫长，进退维谷，内外不合，信用缺乏",
    "interpretation": "成功之路相当漫长，经验遇到二难选择，在处理问题上，请注意个人信用，否则容易导致内部矛盾和外部人员的质疑。"
  },
  {
    "id": 68,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "时来运转，事事如意，功成名就，富贵自来",
    "interpretation": "利路享通万事成，和畅逍达四海明，家运隆盛招富贵，万商云集得繁荣。"
  },
  {
    "id": 69,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "思虑周详，计划力行，不失先机，可望成功",
    "interpretation": "兴家立业意志强，智虑周密名望扬，志操坚固信用重，一身才艺建基业。"
  },
  {
    "id": 70,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "动摇不安，常陷逆境，不得时运，难得利润",
    "interpretation": "坚持是您现时最缺乏的品质，由于没有坚定的目标，会使您陷入相当困苦的境地。而当获得成功时，却发现时不与我，外部环境已使得竞争激烈导致利润下降。"
  },
  {
    "id": 71,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "惨淡经营，难免贫困，此数不吉，最好改名",
    "interpretation": "事业不济，入不敷出，坚持一个不好的行业，不会带来事业的腾飞，最好适时转行。"
  },
  {
    "id": 72,
    "summary": "吉带凶",
    "rating": "★★★☆☆☆☆",
    "verse": "吉凶参半，惟赖勇气，贯彻力行，始可成功",
    "interpretation": "人生之路吉、凶各半，有好有坏；要想改变这种不利局面，唯有依赖你的勇气和不屈服的执行力，一步步向前，人生才会更光明，更成功。"
  },
  {
    "id": 73,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "利害混集，凶多吉少，得而复失，难以安顺",
    "interpretation": "有好也有坏，但恶运占多，得到的东西容易失去，导致生活难以安定。此运告诫：少接触投机类活动，否则容易一无所有。"
  },
  {
    "id": 74,
    "summary": "中吉",
    "rating": "★★★★☆☆☆",
    "verse": "安乐自来，自然吉祥，力行不懈，终必成功",
    "interpretation": "志高力微乏实行，妄谋无计事难成，晚年安宁静逸祥，享得天赋增吉相。"
  },
  {
    "id": 75,
    "summary": "凶",
    "rating": "★☆☆☆☆☆☆",
    "verse": "利不及费，坐食山空，如无智谋，难望成功",
    "interpretation": "入不敷出，即使有很好的基础，如果没有智谋或用人不善，难以发扬光大，最终可能败掉一切。"
  },
  {
    "id": 76,
    "summary": "吉带凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "吉中带凶，欲速不达，进不如守，可保安祥",
    "interpretation": "在好运中含藏凶兆，不能操之过急，不可冒然急进，前进得太快，容易出现危险，还不如坚守现在的阵地。"
  },
  {
    "id": 77,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "此数大凶，破产之象，宜速改变，以避厄运",
    "interpretation": "不祥之兆，财产有可能一夜尽失，应尽快改变现在的处事和投资方式，避免厄运。"
  },
  {
    "id": 78,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "先苦后甘，先甘后苦，如能守成，不致失败",
    "interpretation": "不能一生都有好运，但也不全是恶运，好坏总会各占一半，当好运来时，记得积谷防饥。"
  },
  {
    "id": 79,
    "summary": "吉带凶",
    "rating": "★★☆☆☆☆☆",
    "verse": "有得有失，华而不实，须防劫财，始保平安",
    "interpretation": "金钱上有损失，切忌花枝招展，外表的华丽可能为您带来小人的攻击。"
  },
  {
    "id": 80,
    "summary": "凶",
    "rating": "☆☆☆☆☆☆☆",
    "verse": "如走夜路，前途无光，希望不大，劳而无功",
    "interpretation": "一生就像在夜晚里走路一样，想开创新天地，却部是难以大展拳脚，可用好做好现在的事情，等待时机，主动出击容易空手而回，此命需待贵人相助方容易成功。"
  },
  {
    "id": 81,
    "summary": "大吉+财运",
    "rating": "★★★★★★☆",
    "verse": "财富丰盈，受天之佑，广结善缘，福泽绵长",
    "interpretation": "天赋财富之运，如泉水涌出，取之不竭。为人慷慨大方，乐善好施，故得人敬仰，财路更广。宜多行善事，积德累功，可保家门隆昌，子孙亦沾其惠。"
  },
  {
    "id": 82,
    "summary": "中吉+官运",
    "rating": "★★★★★☆☆",
    "verse": "循序渐进，步步高升，得人提携，位居要津",
    "interpretation": "仕途顺遂，不宜急进，稳扎稳打，自有贵人赏识提拔。需注意人际关系，谦和有礼，则上下和睦，官运亨通。若得此数，宜把握良机，一展抱负。"
  },
  {
    "id": 83,
    "summary": "吉",
    "rating": "★★★★☆☆☆",
    "verse": "海天一色，任君翱翔，勤勉不怠，必有收成",
    "interpretation": "前景广阔，发展空间巨大，无甚阻碍。只要自身肯付出努力，踏实做事，无论从事何种行业，皆能有所收获，生活安稳，渐入佳境。"
  },
  {
    "id": 84,
    "summary": "大吉+才艺",
    "rating": "★★★★★★☆",
    "verse": "天资聪颖，才华出众，声名远播，利路亨通",
    "interpretation": "天生具有艺术或技艺之才能，稍加琢磨，即可光芒四射。以此才华谋生，不仅能获得名声，更能带来丰厚的财富。但需戒骄戒躁，精益求精，方能长久。"
  },
  {
    "id": 85,
    "summary": "中吉",
    "rating": "★★★★☆☆☆",
    "verse": "聚沙成塔，积少成多，量力而行，稳中求胜",
    "interpretation": "财富与事业之成，非一蹴而就，需靠平日点滴积累。投资理财宜保守，切忌好高骛远。只要脚踏实地，持之以恒，终能积攒可观的基业，晚年富足。"
  },
  {
    "id": 86,
    "summary": "大吉+官运+财运",
    "rating": "★★★★★★★",
    "verse": "龙跃云津，风生水起，权财两得，威名远扬",
    "interpretation": "运势如日中天，权力与财富同时降临。不仅能身居高位，掌握实权，更能以此获得巨大财富。处事公正，恩威并施，可成一代领袖，名留青史。需防树大招风。"
  },
  {
    "id": 87,
    "summary": "吉带凶",
    "rating": "★★★☆☆☆☆",
    "verse": "明珠在握，却蒙微尘，拂拭洁净，重现光华",
    "interpretation": "自身本有福运或才能，但目前被一些小事或小人所困，难以施展。只要保持本心，耐心处理眼前问题，待障碍扫除，好运便会重新降临，恢复光明。"
  },
  {
    "id": 88,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "和风甘雨，万物滋生，家宅平安，百事兴隆",
    "interpretation": "运势和谐顺畅，如春风化雨，滋润万物。家庭和睦，身体健康，这是事业成功的基础。在此之上，无论求财、求名，皆能顺心如意，诸事圆满。"
  },
  {
    "id": 89,
    "summary": "中吉+才艺",
    "rating": "★★★★★☆☆",
    "verse": "独具匠心，巧夺天工，一艺傍身，终身无忧",
    "interpretation": "在某项专门技艺上有超凡的天赋和兴趣，若能专心钻研，必能达到极高境界。以此为业，不仅衣食无忧，更能获得社会地位和尊重。适合走专业化路线。"
  },
  {
    "id": 90,
    "summary": "凶带吉",
    "rating": "★★★☆☆☆☆",
    "verse": "狂风骤雨，舟行逆水，奋力撑持，终抵彼岸",
    "interpretation": "开局困难重重，阻力极大，犹如逆水行舟。但只要意志坚定，不畏艰难，付出比常人多数倍的努力，最终能够克服所有困难，获得成功，且成果更为坚固。"
  },
  {
    "id": 91,
    "summary": "大吉+财运",
    "rating": "★★★★★★☆",
    "verse": "陶朱媲美，富甲一方，乐善好施，名满乡里",
    "interpretation": "经商理财能力极强，有如古代陶朱公范蠡，能积攒巨额财富。致富后不忘回馈社会，广行善举，因此获得极佳的声誉，受人爱戴，富而好礼，德财兼备。"
  },
  {
    "id": 92,
    "summary": "吉",
    "rating": "★★★★☆☆☆",
    "verse": "春回大地，枯木逢春，生机盎然，万事可期",
    "interpretation": "经历过一段低迷期后，运势开始好转。一切都在复苏，新的机会开始出现。应抓住这个转折点，积极布局，之前停滞的事情有望重新启动并获得进展。"
  },
  {
    "id": 93,
    "summary": "中吉+官运",
    "rating": "★★★★★☆☆",
    "verse": "众望所归，荣登高位，不负所托，造福一方",
    "interpretation": "因其德行与能力，深受众人信服与推崇，被推举到领导岗位。担任此职位，不仅能实现个人抱负，更能为团队或社会带来福祉。应尽职尽责，不负众望。"
  },
  {
    "id": 94,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "福星高照，吉庆满堂，心想事成，无往不利",
    "interpretation": "运气极佳，无论做什么事都很顺利。心中所想之事，皆能如意实现。家庭充满喜庆，个人身心愉快。是难得的好运时期，应趁机完成重要的事情。"
  },
  {
    "id": 95,
    "summary": "吉带凶",
    "rating": "★★★☆☆☆☆",
    "verse": "蜜中含刺，笑里藏刀，谨慎提防，可保安康",
    "interpretation": "看似美好的事物背后可能隐藏着危机。尤其在人际交往或合作中，要警惕小人的甜言蜜语或表面功夫。保持清醒的头脑和谨慎的态度，可以避免伤害。"
  },
  {
    "id": 96,
    "summary": "中吉+才艺",
    "rating": "★★★★★☆☆",
    "verse": "妙笔生花，文采斐然，以此立世，名扬四海",
    "interpretation": "具有非凡的文学、艺术或创意才能。笔下所出，皆能打动人心。若从事写作、设计、传媒等相关行业，能获得巨大成功，作品流传后世，名利双收。"
  },
  {
    "id": 97,
    "summary": "大吉+官运+财运",
    "rating": "★★★★★★☆",
    "verse": "鱼跃龙门，身价百倍，青云直上，富贵逼人",
    "interpretation": "人生迎来关键性的转折点，如同鲤鱼跃过龙门，身份地位将发生质的飞跃。事业上会得到极大的提升，财富也随之暴涨。但要注意，跃过龙门后仍需努力。"
  },
  {
    "id": 98,
    "summary": "吉",
    "rating": "★★★★☆☆☆",
    "verse": "心地光明，待人至诚，虽无大财，亦有清福",
    "interpretation": "为人正直诚恳，心胸开阔，不计较得失。虽然没有大富大贵，但生活安宁，内心平静，无病无灾，能享清闲之福。这是一种很多人求而不得的福气。"
  },
  {
    "id": 99,
    "summary": "大吉",
    "rating": "★★★★★★☆",
    "verse": "金玉满堂，子孙贤孝，晚年安乐，福寿双全",
    "interpretation": "一生积累下丰厚的财富，并且后代子孙都非常贤能有出息，孝敬长辈。到了晚年，生活富足安逸，身体健康，长寿多福，人生圆满，令人羡慕。"
  },
  {
    "id": 100,
    "summary": "中吉",
    "rating": "★★★★★☆☆",
    "verse": "顺水推舟，不劳而力，借势而起，事半功倍",
    "interpretation": "当前大环境对自己有利，做事情非常省力，如同顺水行舟。不需要太费劲，只需顺应时势，借助外力，就能轻松达成目标，取得比平时更好的效果。"
  }
];

// src/services/api.ts
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
        message = message.replace(/\{error}/g, "获取运势失败");
        break;
      }
    }
    const consecutiveDays = await time.getConsecutiveDays(userid);
    message = message.replace(/\{user}/g, username);
    if (upPoints) message = message.replace(/\{points}/g, upPoints.toString() || "");
    message = message.replace(/\{fortune}/g, await this.getFortune(userid));
    message = message.replace(/\{consecutive_days}/g, consecutiveDays.toString());
    message = message.replace(/\{time}/g, (/* @__PURE__ */ new Date()).toLocaleString());
    message = message.replace(/\{last_time}/g, (await time.getLastTime(userid)).toLocaleString().toString());
    message = message.replace(/\{totalpoints}/g, (await this.ctx.points.get(userid)).toString());
    const keys = message.match(/{([^}]+)}/g);
    if (keys) {
      for (const key of keys) {
        try {
          const keyName = key.replace(/[{}]/g, "");
          const api = this.cfg.style_apiList.find((api2) => api2.key === keyName);
          if (!api || key == "{AT}") continue;
          if (api.url.startsWith("http")) {
            if (api.jsonPath == "" || api.jsonPath == void 0) {
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
    userid = (Number(userid) + Number(`${(/* @__PURE__ */ new Date()).getFullYear()}${(/* @__PURE__ */ new Date()).getMonth() + 1}${(/* @__PURE__ */ new Date()).getDate()}`)).toString();
    console.log(FortuneHash(userid));
    const res = fortuneData[FortuneHash(userid)];
    return `今日运势：${res.summary}${res.rating}
${res.verse}
${res.interpretation}`;
  }
  // private static hashToRange(num: number) {
  //     let hash = 2166136261; // FNV offset basis
  //     const bytes = new ArrayBuffer(4);
  //     new DataView(bytes).setInt32(0, num, true);
  //     const byteArray = new Uint8Array(bytes);
  //
  //     for (let i = 0; i < byteArray.length; i++) {
  //         hash ^= byteArray[i];
  //         hash *= 16777619; // FNV prime
  //     }
  //
  //     return (Math.abs(hash) % 80) + 1;
  // }
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

// src/utils/gain.ts
function randomGain(max, min = 0) {
  return Math.round(Random(max, min));
}
__name(randomGain, "randomGain");
function sdraGain(max, min, saturation, urveFactor, randomRange, userPoints) {
  let gain = min;
  if (userPoints < saturation) {
    const fx = (1 - userPoints / saturation) ** urveFactor;
    gain = min + (max - min) * fx;
  }
  const random = Random(1, randomRange);
  console.log(gain, random);
  return Math.round(gain * random);
}
__name(sdraGain, "sdraGain");
function Random(max, min = 0) {
  return Math.random() * (max - min) + min;
}
__name(Random, "Random");

// src/commands/signIn.ts
var lockSet = /* @__PURE__ */ new Set();
function registerSignInCommand(ctx, cfg) {
  ctx.command("签到").alias("qd").action(async ({ session }) => {
    const lockKey = `qd:lock:${session.userId}`;
    if (lockSet.has(lockKey)) return;
    lockSet.add(lockKey);
    const maxRetries = 3;
    let retryCount = 0;
    try {
      while (retryCount <= maxRetries) {
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
              return;
            }
          }
          const points = await ctx.points.get(session.userId);
          let uppoints;
          if (cfg.rewardStrategyName == "sdra") {
            uppoints = sdraGain(cfg.sdra_maxGain, cfg.sdra_minGain, cfg.sdra_saturationPoint, cfg.sdra_urveFactor, cfg.sdra_randomRange, points);
          } else {
            uppoints = randomGain(cfg.randoom_maxGain, cfg.randoom_minGain);
            if (usertype == "newUser") {
              uppoints += cfg.randoom_firstGain;
            }
          }
          const transaction = ctx.points.generateTransactionId();
          await ctx.points.add(session.userId, transaction, uppoints, name);
          await time.updateTime(session.userId);
          message = (0, import_koishi3.h)("quote", { id: session.messageId }) + (cfg.isdev ? "【测试模式】" : "") + await Api.buildQDmessage("success", session.userId, session.username, usertype, uppoints);
          await session.send(message);
          return;
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            await session.send(`签到失败: 重试${maxRetries}次后仍然失败，请稍后再试。错误信息: ${error.message || error}`);
            return;
          } else {
            ctx.logger.warn(`签到重试 ${retryCount}/${maxRetries}: ${error.message || error}`);
            await new Promise((resolve) => setTimeout(resolve, 1e3 * retryCount));
          }
        }
      }
    } finally {
      lockSet.delete(lockKey);
    }
  });
}
__name(registerSignInCommand, "registerSignInCommand");

// src/commands/index.ts
function registerCommands(ctx, cfg) {
  registerSignInCommand(ctx, cfg);
}
__name(registerCommands, "registerCommands");

// src/services/init.ts
function InitPlugin(ctx, cfg) {
  const logger = ctx.logger("cg签到");
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
  logger.info("插件初始化完成");
}
__name(InitPlugin, "InitPlugin");

// src/config/index.ts
var import_koishi4 = require("koishi");
var Config = import_koishi4.Schema.intersect([
  import_koishi4.Schema.object({
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
    rewardStrategyName: import_koishi4.Schema.union([
      import_koishi4.Schema.const("random").description("随机积分"),
      import_koishi4.Schema.const("sdra").description("蓄值衰减奖励")
    ]).default("random").description("积分计算算法")
  }).description("积分计算算法配置"),
  import_koishi4.Schema.union([
    import_koishi4.Schema.object({
      rewardStrategyName: import_koishi4.Schema.const("random"),
      randoom_firstGain: import_koishi4.Schema.number().default(20).description("首次签到的额外加分数量"),
      randoom_maxGain: import_koishi4.Schema.number().default(20).description("随机获取积分的最大值"),
      randoom_minGain: import_koishi4.Schema.number().default(10).description("随机获取积分的最小值")
    }),
    import_koishi4.Schema.object({
      rewardStrategyName: import_koishi4.Schema.const("sdra"),
      sdra_maxGain: import_koishi4.Schema.number().default(75).description("账户余额为0时的获得的积分值(最大积分获取值)"),
      sdra_minGain: import_koishi4.Schema.number().default(1).description("账户余额大于等于saturationPoint时可获得的积分值"),
      sdra_saturationPoint: import_koishi4.Schema.number().default(700).description("账户余额的饱和值，超过该值将只能获得minGain设置的积分"),
      sdra_urveFactor: import_koishi4.Schema.number().default(2).description("积分衰减因子，值越大，积分衰减越快").max(2).min(0.01).step(0.01).role("slider"),
      sdra_randomRange: import_koishi4.Schema.number().default(2).description("加权随机因子，设置大于1的至将会在1和该值之前取随机值并与sdra算法的积分值相乘").min(1)
    })
  ]),
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
    isdev: import_koishi4.Schema.boolean().default(false).description("是否为测试模式\n！**警告：本功能开启后将不限制签到次数，请勿在生产环境下开启**").experimental()
  }).description("开发者配置")
]);
function checkConfig(cfg) {
  if (cfg.rewardStrategyName == "random") {
    if (cfg.randoom_firstGain && cfg.randoom_maxGain && cfg.randoom_minGain) return true;
    return false;
  } else if (cfg.rewardStrategyName == "sdra") {
    if (cfg.sdra_maxGain && cfg.sdra_minGain && cfg.sdra_saturationPoint && cfg.sdra_urveFactor && cfg.sdra_randomRange) return true;
    return false;
  }
}
__name(checkConfig, "checkConfig");

// src/index.ts
var name = "codegang-qd";
var description = "一个高度可自定义化的签到插件";
var author = "小舍";
var inject = ["database", "http", "points"];
var usage = `
## 签到自定义文本变量一览
- \`{AT}\`为艾特用户
- \`{username}\`为用户昵称
- \`{points}\`为用户获得的积分
- \`{fortune}\`为用户运势
- \`{consecutive_days}\`为用户连续签到天数
- \`{time}\`为用户签到时间
- \`{totalpoints}\`为用户总积分
- \`{<key>}\`其他绑定值
---
## 关于蓄值衰减奖励算法

该算法是为了应对积分总量线性增长导致通货膨胀的问题设计的**缓解**方案
算法通过限制积分数量多的用户签到获得的积分数量，来控制积分总量的增长速度
您可以查看[*这里*](https://www.desmos.com/calculator/qoykayz55d)使用动画了解该算法的特性

`;
async function apply(ctx, cfg) {
  if (!checkConfig(cfg)) {
    ctx.logger.error("签到插件配置错误");
    console.log(cfg);
  }
  InitPlugin(ctx, cfg);
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  author,
  checkConfig,
  description,
  inject,
  name,
  usage
});
