import { Context } from 'koishi';
import { Config } from './config';
export declare const name = "codegang-qd";
export declare const description = "Codegang\u7B7E\u5230\u63D2\u4EF6";
export declare const author = "\u5C0F\u820D";
export declare const version = "2.0.0";
export declare const inject: string[];
export * from './config';
declare module 'koishi' {
    interface Tables {
        codegang_qd: codegang_qd;
    }
}
export interface codegang_qd {
    id: number;
    userid: string;
    username: string;
    time: Date;
    monthlyRecords: JSON;
}
export declare function apply(ctx: Context, cfg: Config): Promise<void>;
