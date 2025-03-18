import { Context, HTTP } from 'koishi';
export declare const inject: string[];
export declare function init(context: Context): void;
export declare function checkAndUpdateUserName(userid: string, username: string): Promise<void>;
export declare function getHitokoto(http: HTTP): Promise<string>;
export declare function getfortunev2(userid: string): Promise<string>;
export declare function getSetu(http: HTTP): Promise<string>;
