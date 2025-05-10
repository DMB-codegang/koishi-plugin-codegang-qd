import { Context } from 'koishi';
import { Config } from './config';
export declare const name = "codegang-qd";
export declare const description = "\u4E00\u4E2A\u9AD8\u5EA6\u53EF\u81EA\u5B9A\u4E49\u5316\u7684\u7B7E\u5230\u63D2\u4EF6";
export declare const author = "\u5C0F\u820D";
export declare const inject: string[];
export declare const usage = "\n# \u7B7E\u5230\u63D2\u4EF6\n## \u4ECB\u7ECD\n\n## \u7B7E\u5230\u81EA\u5B9A\u4E49\u6587\u672C\u53D8\u91CF\u4E00\u89C8\n- `{AT}`\u4E3A\u827E\u7279\u7528\u6237  \n- `{username}`\u4E3A\u7528\u6237\u6635\u79F0  \n- `{points}`\u4E3A\u7528\u6237\u83B7\u5F97\u7684\u79EF\u5206  \n- `{fortune}`\u4E3A\u7528\u6237\u8FD0\u52BF  \n- `{consecutive_days}`\u4E3A\u7528\u6237\u8FDE\u7EED\u7B7E\u5230\u5929\u6570\n- `{time}`\u4E3A\u7528\u6237\u7B7E\u5230\u65F6\u95F4  \n- `{totalpoints}`\u4E3A\u7528\u6237\u603B\u79EF\u5206  \n- `{<key>}`\u5176\u4ED6\u7ED1\u5B9A\u503C  \n";
export * from './config';
export declare function apply(ctx: Context, cfg: Config): Promise<void>;
