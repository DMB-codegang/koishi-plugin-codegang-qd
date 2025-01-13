import { Config } from './config';
export declare class Ncm {
    http: any;
    cfg: Config;
    constructor();
    init(http: any, cfg: Config): void;
    search(keyword: string): Promise<any[] | {
        error: string;
    }>;
    getmusic(id: string, level: string): Promise<any>;
    getmv(id: string): Promise<any>;
    getHotSearch(): Promise<any>;
}
