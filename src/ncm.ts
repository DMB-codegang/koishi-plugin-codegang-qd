import { Config } from './config';

export class Ncm {
    http: any;
    cfg: Config;
    constructor() {}
    public init(http: any, cfg: Config) {
        this.http = http;
        this.cfg = cfg;
    }

    async search(keyword: string) {
        try {
            // let row_1 = await this.http.get(`${this.cfg.ncmapi}/search.php?keyword=${keyword}`);
            let row_1 = [];
            let search_songs_num = 25;
            // 检查是否有结果
            if (row_1.length != 0) {
                search_songs_num = search_songs_num - row_1.length;
            }
            let row_2 = await this.http.get(`${this.cfg.ncmapi}/cloudsearch?limit=${search_songs_num}&keywords=${keyword}`);
            // 合并两个结果
            for (let i = 0; i < row_1.length; i++) {
                if (row_1[i].from == '【codegang曲库】') {
                    row_1[i].name = row_1[i].from + row_1[i].name;
                }
            }
            let row = row_1.concat(row_2.result.songs);
            return row;
        } catch (error) {
            console.error(`Error fetching data: ${error.message}`);
            return { error: 'Failed to fetch search results' };
        }
    }

    async getmusic(id: string, cookie: string) {
        let row = await this.http.get(`${this.cfg.ncmapi}/song/url?id=${id}&cookie=${cookie}`);
        return row.data[0];
    }

    async getmv(id: string, cookie: string) {
        let row = await this.http.get(`${this.cfg.ncmapi}/mv/url?id=${id}&cookie=${cookie}`);
        return row.data;
    }
}