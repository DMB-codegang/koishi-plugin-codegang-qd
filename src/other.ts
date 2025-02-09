import { HTTP, Logger } from 'koishi';
import { Config } from './config';

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
    // 旧方式，由于不稳定已经弃用
    // try {
    //     let row = await http.get(`https://api.fanlisky.cn/api/qr-fortune/get/${userid}`);
    //     if (row.code == 200) {
    //         return `今日运势：${row.data.fortuneSummary}${row.data.luckyStar}\n${row.data.signText}\n${row.data.unSignText}`;
    //     } else {
    //         return `运势获取失败……${row.code}\n${row.msg}`;
    //     }
    // } catch (err) {
    //     console.error(`Error fetching fortune: ${err.message}`);
    //     return '运势获取失败……';
    // }

    try {
        //将userid，今天年份，月份，日期拼接成url
        let row = await http.get(`http://qq.link114.cn/${userid}${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`);
        if (row) {
            //取出内容的class="listpage_content"div内的内容
            row = row.match(/<div class="listpage_content">([\s\S]*?)<\/div>/)[1];

            let res = { index: '', star: '', sign: '', res: '' };
            //取出运势总结的结果写入res.index
            res.index = row.match(/<dt>运情总结：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
            //取出幸运星的结果写入res.star
            res.star = row.match(/<dt>幸运星：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
            //取出签文的结果写入res.sign
            res.sign = row.match(/<dt>签文：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];
            //取出解签的结果写入res.res
            res.res = row.match(/<dt>解签：<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)[1];

            return `今日运势：${res.index}${res.star}\n${res.sign}\n${res.res}`;
        } else {
            return `运势获取失败……${row.code}\n${row.msg}`;
        }
    } catch (err) {
        console.error(`Error fetching fortune: ${err.message}`);
        return '运势获取失败……' + err.message;
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