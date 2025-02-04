import { Dict,Schema } from 'koishi'

export interface Config {
    delay: number
    minplusnum: number
    maxplusnum: number
    firstplusnum: number
    picApi: string
    setuApi: string
    menu: string
    ncmapi: string
    limit: number
    level: string
    cookie: string
    isdev: boolean
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        delay: Schema.number().default(1000).description('回复延迟时间，降低风控风险'),
        minplusnum: Schema.number().default(1).description('每次签到的最小加分数量'),
        maxplusnum: Schema.number().default(10).description('每次签到最大加分数量'),
        firstplusnum: Schema.number().default(20).description('首次签到的额外加分数量'),
        menu: Schema.string().role('textarea', { rows: [6, 3] }),
    }).description('基础配置'),
    Schema.object({
        picApi: Schema.string().default('').description('图片API地址'),
        setuApi: Schema.string().default('').description('涩图API地址')
    }).description('图片配置'),
    Schema.object({
        ncmapi: Schema.string().default("").description('网易云音乐API地址'),
        limit: Schema.number().default(5).description('网易云单页搜索结果数量'),
        level: Schema.union([
            Schema.const('standard').description('标准'),
            Schema.const('higher').description('较高'),
            Schema.const('exhigh').description('极高'),
            Schema.const('lossless').description('无损'),
            Schema.const('hires').description('Hi-Res'),
            Schema.const('jyeffect').description('高清环绕声'),
            Schema.const('sky').description('沉浸环绕声'),
            Schema.const('dolby').description('杜比全景声'),
            Schema.const('jymaster').description('超清母带')
        ]).description('音质等级 杜比全景声需要cookie的os=pc以保证码率正常'),
        cookie: Schema.string().role('textarea', { rows: [4, 3] }).description('网易云音乐cookie'),
    }).description('网易云音乐配置'),
    Schema.object({
        isdev: Schema.boolean().default(false).description('是否为测试模式\n！警告：测试模式下不会使用积分系统').experimental()
    }).description('开发者配置')
])