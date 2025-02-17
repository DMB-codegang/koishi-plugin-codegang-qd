import { HTTP, Logger } from 'koishi';
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

export async function getfortune(http: HTTP, userid: string) {

    try {
        //将userid，今天年份，月份，日期拼接成url
        // 参数为(url: string, config?: HTTP.RequestConfig)
        // 定义头部信息
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        userid = (Number(userid)+Number(`${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`)).toString();
        let row = await http.get(`http://qq.link114.cn/${userid}`, { headers });
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
            log.error('运势获取失败: %s', row);
            return `运势获取失败……${row}`;
        }
    } catch (err) {
        log.error('获取运势时遇到致命错误: %s', err);
        return '获取运势时遇到致命错误' + err;
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