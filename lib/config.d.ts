import { Schema } from 'koishi';
export interface Config {
    minplusnum: number;
    maxplusnum: number;
    firstplusnum: number;
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {points}为用户获得的积分
     * {fortune}为用户运势
     * {time}为用户签到时间
     * {totalpoints}为用户总积分
     * {<key>}其他绑定值
     */
    style_text: string;
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {points}为用户获得的积分
     * {fortune}为用户运势
     * {time}为用户签到时间
     * {totalpoints}为用户总积分
     * {<key>}其他绑定值
     */
    style_already_text: string;
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {points}为用户获得的积分
     * {fortune}为用户运势
     * {last_time}为用户签到时间
     * {totalpoints}为用户总积分
     * {error}为错误信息
     * {<key>}其他绑定值
    */
    style_failed_text: string;
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {time}为用户签到时间
     * {<key>}其他绑定值
     */
    style_welcome_text: string;
    style_apiList: {
        key: string;
        type: 'text' | 'image';
        url: string;
        jsonPath: string;
    }[];
    isdev: boolean;
}
export declare const Config: Schema<Config>;
