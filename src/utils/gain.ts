// 积分计算
/**
 * 随机积分
 * @param max 最大积分
 * @param min 最小积分
 * @returns 积分
 */
export function randomGain(max: number, min: number = 0) {
    return Math.round(Random(max, min))
}

/**
 * 蓄值衰减奖励算法
 * @param max 最大积分
 * @param min 最小积分
 * @param saturation 饱和值
 * @param urveFactor 蓄值衰减因子
 * @returns 积分
 */
export function sdraGain(max: number, min: number, saturation: number, urveFactor: number, randomRange: number, userPoints: number) {
    let gain: number = min
    if (userPoints < saturation) {
        const fx = (1 - (userPoints / saturation)) ** urveFactor // 蓄值衰减函数
        gain = min + (max - min) * fx // 计算当前积分
    }
    const random = Random(1, randomRange) // 随机积分
    console.log(gain, random)
    return Math.round(gain * random) // 四舍五入
}

function Random(max: number, min: number = 0): number{
    return Math.random() * (max - min) + min
}