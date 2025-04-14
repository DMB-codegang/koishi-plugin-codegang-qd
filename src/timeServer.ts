import { Context } from 'koishi'

const database_name = 'codegang_qd' as const

export type UserType = 'newUser'|'already'|'notToday'

export class time {
    private ctx: Context
    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async updateTime(userid: string) { 
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (userRecords.length === 0) { 
            this.ctx.database.create(database_name, { userid, time: new Date() });
        } else {
            this.ctx.database.set(database_name, { userid }, { time: new Date() });
        }
        return true; 
    }

    async checkTime(userid: string): Promise<UserType> {
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) return 'newUser'; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        const nowTime = new Date();
        const isSameDay = lastTime.getUTCFullYear() === nowTime.getUTCFullYear() &&
                         lastTime.getUTCMonth() === nowTime.getUTCMonth() &&
                         lastTime.getUTCDate() === nowTime.getUTCDate();
        return isSameDay ? 'already' : 'notToday'; // 同一天返回上次签到时间，否则返回1
    }

    async getLastTime(userid: string): Promise<number | Date> {
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) 0; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        return lastTime; // 返回上次签到时间
    }
}