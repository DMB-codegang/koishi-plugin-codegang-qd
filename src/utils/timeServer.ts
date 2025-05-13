import { Context } from 'koishi'
import { UserType } from '../types'

const database_name = 'codegang_qd' as const

export class time {
    private static ctx: Context
    private static timezone: number
    static Init(ctx: Context, timezone: number) {
        time.ctx = ctx
        time.timezone = timezone
    }

    // 获取当前时区的时间
    static getCurrentTime() {
        const date = new Date()
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
        return new Date(utc + (3600000 * time.timezone))
    }

    static async updateTime(userid: string) {
        const currentTime = time.getCurrentTime()
        const year = currentTime.getFullYear()
        const month = currentTime.getMonth() + 1
        const day = currentTime.getDate()
        const userRecords = await time.ctx.database.get(database_name, { userid });
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        if (userRecords.length === 0) {
            // 新用户
            const monthlyRecords = {};
            monthlyRecords[yearMonth] = [day];
            this.ctx.database.create(database_name, { userid, time: currentTime, monthlyRecords });
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
            this.ctx.database.set(database_name, { userid }, { time: currentTime, monthlyRecords });
        }
        return true;
    }

    static async checkTime(userid: string): Promise<UserType> {
        const userRecords = await this.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) return 'newUser'; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        const currentTime = time.getCurrentTime()

        const isSameDay = lastTime.getFullYear() === currentTime.getFullYear() &&
            lastTime.getMonth() === currentTime.getMonth() &&
            lastTime.getDate() === currentTime.getDate();
        return isSameDay ? 'already' : 'notToday'; // 同一天返回上次签到时间，否则返回1
    }

    static async getLastTime(userid: string): Promise<number | Date> {
        const userRecords = await time.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.time) return 0; // 新用户返回0
        const lastTime = new Date(userRecords[0].time);
        return lastTime; // 返回上次签到时间
    }

    // 获取用户连续签到天数
    static async getConsecutiveDays(userid: string): Promise<number> {
        const userRecords = await time.ctx.database.get(database_name, { userid });
        if (!userRecords[0]?.monthlyRecords) return 0;

        const today = time.getCurrentTime();
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