import { Schema } from 'koishi'

export interface Config {
    minplusnum: number
    maxplusnum: number
    firstplusnum: number
    // 签到成功的文本
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {points}为用户获得的积分
     * {fortune}为用户运势
     * {time}为用户签到时间
     * {totalpoints}为用户总积分
     * {<key>}其他绑定值
     */
    style_text: string
    // 已签到文本
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {points}为用户获得的积分
     * {fortune}为用户运势
     * {time}为用户签到时间
     * {totalpoints}为用户总积分
     * {<key>}其他绑定值
     */
    style_already_text: string
    // 签到失败文本
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
    style_failed_text: string
    // 新用户签到欢迎语
    /**
     * {AT}为艾特用户
     * {username}为用户昵称
     * {time}为用户签到时间
     * {<key>}其他绑定值
     */
    style_welcome_text: string
    style_apiList: {
        key: string
        type: 'text' | 'image'
        url: string
        jsonPath: string
    }[]
    isdev: boolean
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        minplusnum: Schema.number().default(1).description('每次签到的最小加分数量'),
        maxplusnum: Schema.number().default(10).description('每次签到最大加分数量'),
        firstplusnum: Schema.number().default(20).description('首次签到的额外加分数量'),
    }).description('基础配置'),
    Schema.object({
        
        style_text: Schema.string().description('签到成功的文本\n`{user}`为用户昵称\n`{points}`为用户积分\n`{fortune}`为用户运势\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分').role('textarea', { rows: [4,3] }),
        style_already_text: Schema.string().description('已签到的文本\n`{user}`为用户昵称\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分').role('textarea', { rows: [4,3] }),
        style_failed_text: Schema.string().description('签到失败的文本\n`{user}`为用户昵称\n`{time}`为用户签到时间\n`{totalpoints}`为用户总积分').role('textarea', { rows: [4,3] }).experimental(),
        style_welcome_text: Schema.string().default('这是你首次签到哦').description('新用户签到欢迎语\n`{user}`为用户昵称\n`{time}`为用户签到时间').role('textarea', { rows: [4,3] }),
    }),
    Schema.object({
        style_apiList: Schema.array(Schema.object({
            key: Schema.string().description('绑定值'),
            type: Schema.union(['text', 'image']).description('绑定值的类型'),
            url: Schema.string().description('URL/text，当文本开头不是http将会作为普通文本嵌入'),
            jsonPath: Schema.string().description('API的响应数据路径'),
          })).role('table'),
    }).description('签到样式'),
    Schema.object({
        isdev: Schema.boolean().default(false).description('是否为测试模式\n！警告：测试模式下不会使用积分系统').experimental()
    }).description('开发者配置')
])