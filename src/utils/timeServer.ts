import { Context } from 'koishi'
import { UserType } from '../types'

const database_name = 'codegang_qd' as const

export class time {
    private static ctx: Context
    static Init(ctx: Context) {
        time.ctx = ctx
    }

    static async updateTime(userid: string) {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const userRecords = await time.ctx.database.get(database_name, { userid });
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        if (userRecords.length === 0) {
            // 新用户
            const monthlyRecords = {};
            monthlyRecords[yearMonth] = [day];
            this.ctx.database.create(database_name, { userid, time: new Date(), monthlyRecords });
        } else {
            // 更新现有用户的记录
            let monthlyRecords = userRecords[0].monthlyRecords || {};

            // 如果当月没有记录，创建一个空数组
            if (!monthlyRecords[yearMonth]) {
                monthlyRecords[yearMonth] = [];
            }

            // 如果当天没有签到，添加签到记录
            if (!monthlyRecords[yearMonth].includes(day)) {
                monthlyRecords[yearMonth].push(day);
                // 对日期进行排序
                monthlyRecords[yearMonth].sort((a: number, b: number) => a - b);
            }
            this.ctx.database.set(database_name, { userid }, { time: new Date(), monthlyRecords });
        }
        return true;
    }

    static async checkTime(userid: string): Promise<UserType> {
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) return 'newUser'; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        const nowTime = new Date();
        const isSameDay = lastTime.getUTCFullYear() === nowTime.getUTCFullYear() &&
            lastTime.getUTCMonth() === nowTime.getUTCMonth() &&
            lastTime.getUTCDate() === nowTime.getUTCDate();
        return isSameDay ? 'already' : 'notToday'; // 同一天返回上次签到时间，否则返回1
    }

    static async getLastTime(userid: string): Promise<number | Date> {
        const userRecords = await time.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) 0; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        return lastTime; // 返回上次签到时间
    }

    // 获取用户连续签到天数
    static async getConsecutiveDays(userid: string): Promise<number> {
        const userRecords = await time.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.monthlyRecords) return 0;

        const today = new Date();
        let consecutiveDays = 0;
        let checkDate = new Date(today);

        // 从今天开始往前检查，直到找到第一个未签到的日期
        while (true) {
            const year = checkDate.getFullYear();
            const month = checkDate.getMonth() + 1;
            const day = checkDate.getDate();
            const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

            // 检查该日期是否有签到记录
            const monthRecord = userRecords[0].monthlyRecords[yearMonth] || [];
            if (!monthRecord.includes(day)) {
                break;
            }

            consecutiveDays++;

            // 前一天
            checkDate.setDate(checkDate.getDate() - 1);

            // 防止无限循环
            if (consecutiveDays > 9999) break;
        }

        return consecutiveDays;
    }


}