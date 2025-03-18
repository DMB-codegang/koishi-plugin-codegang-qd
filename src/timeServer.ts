import { Context } from 'koishi'

const database_name = 'codegang_qd' as const

export class time {
    private ctx: Context
    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async updateTime(userid: string) {  // 方法名改为 camelCase
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (userRecords.length === 0) {  // 严格相等运算符
            this.ctx.database.create(database_name, { userid, time: new Date() });
        } else {
            this.ctx.database.set(database_name, { userid }, { time: new Date() });
        }
        return true; // 更新成功
    }

    async checkTime(userid: string) {
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) return 0; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        const nowTime = new Date();
        const isSameDay = lastTime.getUTCFullYear() === nowTime.getUTCFullYear() &&
                         lastTime.getUTCMonth() === nowTime.getUTCMonth() &&
                         lastTime.getUTCDate() === nowTime.getUTCDate();
        return isSameDay ? lastTime : 1;
    }
}