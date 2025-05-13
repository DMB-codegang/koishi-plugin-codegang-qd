import { Schema } from 'koishi'

// 定义通用的变量替换说明


export interface Config {
    minplusnum: number
    maxplusnum: number
    timezone: number
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
        timezone: Schema.union([
            Schema.const(1).description('东一区（+1）'),
            Schema.const(2).description('东二区（+2）'),
            Schema.const(3).description('东三区（+3）'),
            Schema.const(4).description('东四区（+4）'),
            Schema.const(5).description('东五区（+5）'),
            Schema.const(6).description('东六区（+6）'),
            Schema.const(7).description('东七区（+7）'),
            Schema.const(8).description('东八区（+8）'),
            Schema.const(9).description('东九区（+9）'),
            Schema.const(10).description('东十区（+10）'),
            Schema.const(11).description('东十一区（+11）'),
            Schema.const(12).description('东十二区（+12）'),
            Schema.const(-1).description('西一区（-1）'),
            Schema.const(-2).description('西二区（-2）'),
            Schema.const(-3).description('西三区（-3）'),
            Schema.const(-4).description('西四区（-4）'),
            Schema.const(-5).description('西五区（-5）'),
            Schema.const(-6).description('西六区（-6）'),
            Schema.const(-7).description('西七区（-7）'),
            Schema.const(-8).description('西八区（-8）'),
            Schema.const(-9).description('西九区（-9）'),
            Schema.const(-10).description('西十区（-10）'),
            Schema.const(-11).description('西十一区（-11）'),
            Schema.const(-12).description('西十二区（-12）'),
            Schema.const(0).description('UTC协调世界时（+0）'),
        ]).default(8).description('时区'),
    }).description('基础配置'),
    Schema.object({
        
        style_text: Schema.string().description('签到成功的文本').role('textarea', { rows: [4,3] }),
        style_already_text: Schema.string().description('已签到的文本').role('textarea', { rows: [4,3] }),
        style_failed_text: Schema.string().description('签到失败的文本').role('textarea', { rows: [4,3] }).experimental(),
        style_welcome_text: Schema.string().default('这是你首次签到哦').description('新用户签到欢迎语').role('textarea', { rows: [4,3] }),
    }).description('签到样式'),
    Schema.object({
        style_apiList: Schema.array(Schema.object({
            key: Schema.string().description('绑定值'),
            type: Schema.union(['text', 'image']).description('绑定值的类型'),
            url: Schema.string().description('URL/text，当文本开头不是http将会作为普通文本嵌入'),
            jsonPath: Schema.string().description('API的响应数据路径'),
          })).role('table').description('可自定义的API列表'),
    }),
    Schema.object({
        isdev: Schema.boolean().default(false).description('是否为测试模式\n！警告：测试模式下不会使用积分系统').experimental()
    }).description('开发者配置')
])