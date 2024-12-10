import { Context, Schema } from 'koishi';
export declare const name = "codegang-qd";
export declare const description = "Codegang\u7B7E\u5230\u63D2\u4EF6";
export declare const author = "\u5C0F\u820D";
export declare const inject: {
    required: string[];
    optional: string[];
};
export interface Config {
    minplusnum: number;
    maxplusnum: number;
    firstplusnum: number;
    menu: string;
    limit: number;
    cookie: string;
}
export declare const Config: Schema<Config>;
declare module 'koishi' {
    interface Tables {
        codegang_jf: codegang_jf;
        codegang_user_set: codegang_user_set;
    }
}
export interface codegang_jf {
    id: number;
    userid: string;
    jf: number;
    time: Date;
}
export interface codegang_user_set {
    id: number;
    userid: string;
    set: any;
}
export declare function apply(ctx: Context, cfg: Config): Promise<void>;
