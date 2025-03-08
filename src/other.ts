import { Context, HTTP, Logger } from 'koishi';
import { Config } from './config';

let log = new Logger("@codegang/codegang-qd");



export async function getHitokoto(http: HTTP) {
    try {
        let row = await http.get('https://v1.hitokoto.cn')
        return row.hitokoto + '——' + row.from;
    } catch (err) {
        console.error(`一言获取失败……`);
        log.error('一言获取失败: %s', err);
        return 'error';
    }

}

export async function getfortunev2(userid: string, puppeteer: any) {
    userid = (Number(userid) + Number(`${(new Date()).getFullYear()}${(new Date()).getMonth() + 1}${(new Date()).getDate()}`)).toString();
    puppeteer.config.args = ['--disable-features=HttpsFirstBalancedModeAutoEnable']
    const page = await puppeteer.browser.newPage()
    await page.goto(`http://qq.link114.cn/${userid}`);
    const res = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('#main .listpage_content dl'));
        return items.map(dl => {
            const label = dl.querySelector('dt').textContent.trim().replace('：', '');
            const value = dl.querySelector('dd').textContent.trim();
            return { label, value };
        });
    });
    puppeteer.browser.close();
    return `今日运势：${res[0].value}${res[1].value}\n${res[2].value}\n${res[3].value}`;
}


export async function getSetu(http: HTTP) {
    try {
        let url = await http.get('https://api.lolicon.app/setu/v2');
        return `<img src="${url.data[0].urls.original}"/>`
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}