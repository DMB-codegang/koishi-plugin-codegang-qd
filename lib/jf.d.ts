import { Config } from './config';
export declare class jf {
    private cfg;
    private database;
    constructor();
    init(database: any, cfg: Config): void;
    get(userid: string): Promise<any>;
    set(userid: string, jf: number): Promise<void>;
    add(userid: string, jf: number): Promise<void>;
    reduce(userid: string, jf: number): Promise<boolean>;
    updatetime(userid: string): Promise<boolean>;
    chacktime(userid: string): Promise<any>;
    getTopUsers(num: number): Promise<any>;
}
