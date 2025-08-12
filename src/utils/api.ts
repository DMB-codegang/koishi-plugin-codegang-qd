import { h, Context } from 'koishi'
import * as jsonpath from 'jsonpath'
import { Config } from '../config'
import { time } from './timeServer'
import { UserType } from '../types'

import fortuneData from './fortune_data';

export class Api {
    private static ctx: Context
    private static cfg: Config

    static Init(ctx: Context, cfg: Config) {
        Api.ctx = ctx
        Api.cfg = cfg
    }

    static async buildQDmessage(type: 'success' | 'already' | 'failed', userid: string, username: string, usertype: UserType, upPoints?: number, errorMessage?: string): Promise<string> {
        let message = ''
        switch (type) {
            case 'success': {
                if (!upPoints) throw new Error('Invalid parameters');
                message = this.cfg.style_text
                break;
            }
            case 'already': {
                message = this.cfg.style_already_text
                break;
            }
            case 'failed': {
                if (!errorMessage) throw new Error('Invalid parameters');
                message = this.cfg.style_failed_text
                message = message.replace(/\{error\}/g, '获取运势失败')
                break;
            }
        }
        // 获取连续签到天数
        const consecutiveDays = await time.getConsecutiveDays(userid);
        message = message.replace(/\{user\}/g, username)
        if (upPoints) message = message.replace(/\{points\}/g, upPoints.toString() || '')
        message = message.replace(/\{fortune\}/g, (await this.getFortune(userid)))
        message = message.replace(/\{consecutive_days\}/g, consecutiveDays.toString())
        message = message.replace(/\{time\}/g, (new Date()).toLocaleString())
        message = message.replace(/\{last_time\}/g, ((await time.getLastTime(userid)).toLocaleString()).toString())
        message = message.replace(/\{totalpoints\}/g, (await this.ctx.points.get(userid)).toString())
        // 将message剩下的{key}按照cfg.style_apiList的方法请求api并进行替换
        const keys = message.match(/{([^}]+)}/g)
        if (keys) {
            for (const key of keys) {
                try {
                    const keyName = key.replace(/{|}/g, '')
                    const api = this.cfg.style_apiList.find(api => api.key === keyName)
                    if (!api || key == '{AT}') continue;
                    // 判断是否为http开头，不是就作为普通文本嵌入
                    if (api.url.startsWith('http')) {
                        if (api.jsonPath == '' || api.jsonPath == undefined || api.jsonPath == null) {
                            if (api.type === 'image') {
                                message = message.replace(key, h('img', { src: api.url }).toString())
                            } else {
                                const response = await this.ctx.http.get(api.url)
                                message = message.replace(key, response)
                            }
                        } else {
                            const response = await this.ctx.http.get(api.url)
                            const data = typeof response === 'string' ? JSON.parse(response) : response
                            const value = jsonpath.query(data, api.jsonPath)[0]
                            if (api.type === 'image') {
                                message = message.replace(key, h('img', { src: value }).toString())
                            } else {
                                message = message.replace(key, value)
                            }
                        }
                    }
                } catch (error) {
                    this.ctx.logger('codegang-qd').error(error);
                    message = message.replace(key, '获取失败')
                }
            }
        }
        message = message.replace('{AT}', h('at', { id: userid }).toString())
        return message
    }


    private static async getFortune(userid: string): Promise<string> {
        if (!userid) throw new Error('Invalid parameters');
        userid = (Number(userid) + Number(`${(new Date()).getFullYear()}${(new Date()).getMonth() + 1}${(new Date()).getDate()}`)).toString();
        const res = fortuneData[this.hashToRange(Number(userid))-1]; // 对userid进行哈希，得到1-80的一个数，作为 fortuneData 的索引
        return `今日运势：${res.运情总结}${res.幸运星}\n${res.签文}\n${res.解签}`;
    }

    private static hashToRange(num: number) {
        let hash = 2166136261; // FNV offset basis
        const bytes = new ArrayBuffer(4);
        new DataView(bytes).setInt32(0, num, true);
        const byteArray = new Uint8Array(bytes);

        for (let i = 0; i < byteArray.length; i++) {
            hash ^= byteArray[i];
            hash *= 16777619; // FNV prime
        }

        return (Math.abs(hash) % 80) + 1;
    }

}