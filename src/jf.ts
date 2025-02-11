import { Config } from './config';

const database_name = 'codegang_jf';

export class jf {
  private cfg: Config;
  private database: any;
  constructor() { }
  public init(database: any, cfg: Config) {
    this.cfg = cfg;
    this.database = database;
  }

  async get(userid: string) {
    let row = await this.database.get(database_name, { userid: userid });
    if (this.cfg.isdev) { return 999; }
    if (row.length == 0) {
      return 0;
    } else {
      return row[0].jf;
    }

  }

  async set(userid: string, jf: number) {
    let row = await this.database.get(database_name, { userid: userid });
    if (row.length == 0) {
      await this.database.create(database_name, { userid: userid, jf: jf });
    } else {
      await this.database.set(database_name, { userid: userid }, { jf: jf });
    }
  }

  async add(userid: string, jf: number) {
    let row = await this.database.get(database_name, { userid: userid });
    if (row.length == 0) {
      await this.database.create(database_name, { userid: userid, jf: jf });
    } else {
      await this.database.set(database_name, { userid: userid }, { jf: row[0].jf + jf });
    }
  }

  async reduce(userid: string, jf: number) {
    let row = await this.database.get(database_name, { userid: userid });
    if (row.length == 0) {
      return false;
    } else {
      if (row[0].jf < jf) {
        return false;
      } else {
        await this.database.set(database_name, { userid: userid }, { jf: row[0].jf - jf });
        return true;
      }
    }
  }

  async updatetime(userid: string) {
    let row = await this.database.get(database_name, { userid: userid });
    if (row.length == 0) {
      return false;
    } else {
      await this.database.set(database_name, { userid: userid }, { time: new Date() });
      return true;
    }
  }

  async chacktime(userid: string) {
    let row = await this.database.get(database_name, { userid: userid });
    if (row.length == 0 || row[0].time == null) {
      return 0;//新用户
    } else {
      let lasttime = row[0].time;
      let nowtime = new Date();
      if (!(lasttime == null)) {
        lasttime = new Date(lasttime);
      }
      if (lasttime.getDate() == nowtime.getDate()) {
        return lasttime;//已签到
      } else {
        return 1;//未签到
      }
    }
  }

  async getTopUsers(num: number) {
    let row = await this.database.get('codegang_jf', {}, {
      fields: ['userid', 'username', 'jf'],
      sort: { jf: 'desc' },
      limit: num
    });
    //转换为对象后返回
    return row.map((item: any) => {
      return { userid: item.userid, username: item.username, jf: item.jf };
    });
  }
}