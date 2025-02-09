import { Context } from 'koishi';
import { Config } from './config';
export declare const name = "codegang-qd";
export declare const description = "Codegang\u7B7E\u5230\u63D2\u4EF6";
export declare const author = "\u5C0F\u820D";
export declare const inject: {
    required: string[];
    optional: string[];
};
export * from './config';
declare module 'koishi' {
    interface Tables {
        codegang_jf: codegang_jf;
    }
}
export interface codegang_jf {
    id: number;
    userid: string;
    username: string;
    jf: number;
    time: Date;
}
export declare function apply(ctx: Context, cfg: Config): Promise<void>;
