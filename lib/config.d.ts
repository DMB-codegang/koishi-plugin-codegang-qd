import { Schema } from 'koishi';
export interface Config {
    delay: number;
    minplusnum: number;
    maxplusnum: number;
    firstplusnum: number;
    picApi: string;
    setuApi: string;
    menu: string;
    ncmapi: string;
    limit: number;
    level: string;
    cookie: string;
    isdev: boolean;
}
export declare const Config: Schema<Config>;
