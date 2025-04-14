import { h, Context } from 'koishi'
import * as jsonpath from 'jsonpath'
import { Config } from './config'
import { time, UserType } from './timeServer'

export class api {
    private ctx: Context
    private cfg: Config
    private timeService: time

    constructor(ctx: Context, cfg: Config) {
        this.ctx = ctx
        this.cfg = cfg
        this.timeService = new time(ctx)
    }

    async buildQDmessage(type: 'success' | 'already' | 'failed', userid: string, username: string, usertype: UserType, upPoints?: number, errorMessage?: string): Promise<string> {
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
        message = message.replace(/\{user\}/g, username)
        message = message.replace(/\{points\}/g, upPoints.toString() || '')
        message = message.replace(/\{fortune\}/g, (await this.getFortune(userid)))
        message = message.replace(/\{time\}/g, (new Date()).toLocaleString())
        message = message.replace(/\{last_time\}/g, ((await this.timeService.getLastTime(userid)).toLocaleString()).toString())
        message = message.replace(/\{totalpoints\}/g, (await this.ctx.points.get(userid)).toString())
        // 将message剩下的{key}按照cfg.style_apiList的方法请求api并进行替换
        const keys = message.match(/{([^}]+)}/g)
        if (keys) {
            for (const key of keys) {
                const keyName = key.replace(/{|}/g, '')
                const api = this.cfg.style_apiList.find(api => api.key === keyName)
                if (!api || key == '{AT}') continue;
                // 判断是否为http开头，不是就作为普通文本嵌入
                if (api.url.startsWith('http')) {
                    if (api.jsonPath !== '') {
                        if (api.type === 'image') {
                            message = message.replace(key, h('img', { src: api.url }).toString())//`<img src="${api.url}"/>`)
                        } else {
                            const response = await this.ctx.http.get(api.url)
                            message = message.replace(key, response)
                        }
                    } else {
                        const response = await this.ctx.http.get(api.url)
                        const data = JSON.parse(response)
                        const value = jsonpath.query(data, api.jsonPath)[0]
                        if (api.type === 'image') {
                            message = message.replace(key, h('img', { src: value }).toString())//`<img src="${value}"/>`)
                        } else {
                            message = message.replace(key, value)
                        }
                    }
                }
            }
        }

        message = message.replace('{AT}', h('at', { id: userid }).toString())
        return message
    }


    private async getFortune(userid: string): Promise<string> {
        if (!userid) throw new Error('Invalid parameters');
        if (!this.ctx.puppeteer) return '';
        userid = (Number(userid) + Number(`${(new Date()).getFullYear()}${(new Date()).getMonth() + 1}${(new Date()).getDate()}`)).toString();
        this.ctx.puppeteer.config.args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=HttpsFirstBalancedModeAutoEnable']
        let page;
        try {
            page = await this.ctx.puppeteer.browser.newPage()
            await page.goto(`http://qq.link114.cn/${userid}`);
            const res = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('#main .listpage_content dl'));
                return items.map(dl => {
                    const label = dl.querySelector('dt').textContent.trim().replace('：', '');
                    const value = dl.querySelector('dd').textContent.trim();
                    return { label, value };
                });
            });
            return `今日运势：${res[0].value}${res[1].value}\n${res[2].value}\n${res[3].value}`;
        } catch (error) {
            this.ctx.logger('codegang-qd').error(error);
            return `获取运势失败: ${error}`;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

}