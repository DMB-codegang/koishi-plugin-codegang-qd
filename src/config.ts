import { Dict,Schema } from 'koishi'

export interface Config {
    minplusnum: number
    maxplusnum: number
    firstplusnum: number
    menu: string
    ncmapi: string
    limit: number
    cookie: string
    isdev: boolean
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        minplusnum: Schema.number().default(1).description('每次签到的最小加分数量').required(),
        maxplusnum: Schema.number().default(10).description('每次签到最大加分数量').required(),
        firstplusnum: Schema.number().default(20).description('首次签到的额外加分数量'),
        menu: Schema.string().role('textarea', { rows: [6, 3] }),
        ncmapi: Schema.string().default("").description('网易云音乐API地址'),
        limit: Schema.number().default(5).description('网易云单页搜索结果数量'),
        cookie: Schema.string().role('textarea', { rows: [4, 3] }).description('网易云音乐cookie'),
    }).description('基础配置'),
    Schema.object({
        isdev: Schema.boolean().default(false).description('是否为测试模式\n！警告：测试模式下不会使用积分系统').experimental()
    }).description('开发者配置')

])