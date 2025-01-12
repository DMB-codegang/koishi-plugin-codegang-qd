import { HTTP, Logger } from 'koishi';
import { Config } from './config';
import exp from 'constants';

let log = new Logger("@codegang/codegang-qd");

export async function getHitokoto(http: HTTP) {
    try {
        let row = await http.get('https://v1.hitokoto.cn')
        return row.hitokoto + '——' + row.from;
    } catch (err) {
        console.error(`一言获取失败……`);
        log.error('一言获取失败: %s', err.message);
        return 'error';
    }

}

export async function getfortune(http: HTTP, userid: string) {
    try {
        let row = await http.get(`https://api.fanlisky.cn/api/qr-fortune/get/${userid}`);
        if (row.code == 200) {
            return `今日运势：${row.data.fortuneSummary}${row.data.luckyStar}\n${row.data.signText}\n${row.data.unSignText}`;
        } else {
            return `运势获取失败……${row.code}\n${row.msg}`;
        }
    } catch (err) {
        console.error(`Error fetching fortune: ${err.message}`);
        return '运势获取失败……';
    }
}

export async function getSetu(http: HTTP) {
    try {
        let url = await http.get('https://api.lolicon.app/setu/v2');
        return `<img src="${url.data[0].urls.original}"/>`
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}