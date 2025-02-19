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

export async function getfortune(http: HTTP, userid: string,) {

    try {
        //将userid，今天年份，月份，日期拼接成url
        // 参数为(url: string, config?: HTTP.RequestConfig)
        // 定义头部信息

        // 使用http.get方法获取网页内容的方法
        // const headers = {
        //     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //     "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        //     "cache-control": "max-age=0",
        //     "upgrade-insecure-requests": "1"
        // };
        // userid = (Number(userid)+Number(`${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`)).toString();
        // // (property) HTTP.get: HTTP.Request1
        // // <any>(url: string, config?: HTTP.RequestConfig)
        // let row = await http.get(`http://qq.link114.cn/${userid}`, { headers });

        let res = await fetch(`http://qq.link114.cn/${userid}`, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        });

        let row = await res.text();

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