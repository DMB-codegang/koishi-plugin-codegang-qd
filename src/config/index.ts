import { Schema } from 'koishi'

// 定义通用的变量替换说明


export interface Config {
    minplusnum: number
    maxplusnum: number
    timezone: number
    firstplusnum: number
    captchaType: 'none' | '科目1' | '科目4'
    captchaProbability: number
    style_text: string
    style_already_text: string
    style_failed_text: string
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
        captchaType: Schema.union(['none', '科目1']).default('none').description('验证码类型'),
        captchaProbability: Schema.number().min(0).max(1).default(0.5).step(0.1).description('人机验证触发概率'),
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
        style_text: Schema.string().default('签到成功，你获得了{points}积分\n今天是你连续签到的第{consecutive_days}天哦').description('签到成功的文本').role('textarea', { rows: [4,3] }),
        style_already_text: Schema.string().default('你今天已经签到过了哦').description('已签到的文本').role('textarea', { rows: [4,3] }),
        style_failed_text: Schema.string().default('签到出现异常，请联系管理员：{error}').description('签到失败的文本').role('textarea', { rows: [4,3] }).experimental(),
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