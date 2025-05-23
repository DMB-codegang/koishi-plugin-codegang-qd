import { Context, Session, h } from "koishi";
import { Config } from "../config";

export class Check {
    static async check(ctx: Context, cfg: Config, Session: Session): Promise<Boolean> {
        switch (cfg.captchaType) {
            case 'none': {
                return true
            }
            case '科目1': {
                return await this.km1(ctx, Session)
            }
        }
    }

    private static async km1(ctx: Context, session: Session): Promise<Boolean> {
        try {
            const captcha = await ctx.http.get('https://api.52vmy.cn/api/query/jiakao')
            if (captcha.code === 200) {
                let message = '你触发了人机验证，请听题：\n' + captcha.data[0].question
                if (captcha.data[0].pic) message += h('img', { src: captcha.data[0].pic }).toString()
                if (captcha.data[0].option1){
                    message += '\n' + captcha.data[0].option1
                    message += '\n' + captcha.data[0].option2
                    message += '\n' + captcha.data[0].option3
                    message += '\n' + captcha.data[0].option4
                }
                await session.send(message)
                let userAnswer = await session.prompt(60000)
                if (userAnswer == null || userAnswer == undefined) {
                    return false
                }
                
                if (captcha.data[0].answer == '错' || captcha.data[0].answer == '对') {
                    if (userAnswer.includes('x') || userAnswer.includes('×') || userAnswer.includes('✗') || userAnswer.includes('❌') || 
                    userAnswer.includes('错') || userAnswer.includes('不对') || userAnswer.includes('不正确') || 
                    userAnswer.includes('不是') || userAnswer.includes('错误') || userAnswer.includes('假') || 
                    userAnswer.includes('否') || userAnswer.includes('不') || userAnswer.includes('没有') || 
                    userAnswer.includes('不行') || userAnswer.includes('不可以') || userAnswer.includes('不对的') || 
                    userAnswer.includes('不正确的') || userAnswer.includes('错的') || userAnswer.includes('假的') ||
                    userAnswer.toLowerCase().includes('no') || userAnswer.toLowerCase().includes('false') || 
                    userAnswer.toLowerCase().includes('wrong') || userAnswer.toLowerCase().includes('incorrect') || 
                    userAnswer.toLowerCase().includes('n') || userAnswer.toLowerCase().includes('f') ||
                    userAnswer.includes('0')) {
                    userAnswer = '错'
                } else {
                    userAnswer = '对'
                }
                    if (userAnswer == captcha.data[0].answer) {
                        session.send('回答正确!算你运气好，看看解析：\n\n' + captcha.data[0].explain)
                        return true
                    } else {
                        session.send('大笨蛋答案错误，还要加把劲呢\n\n' + captcha.data[0].explain)
                        return false
                    }
                } else {
                    // 将用户答案转化为大写
                    userAnswer = userAnswer.toUpperCase()
                    if (userAnswer == captcha.data[0].answer) {
                        session.send('回答正确!算你运气好，看看解析：\n\n' + captcha.data[0].explain)
                        return true
                    } else {
                        session.send('大笨蛋答案错误，还要加把劲呢\n\n'+ '正确答案：' + captcha.data[0].answer + '\n' + captcha.data[0].explain)
                        return false
                    }
                }
            }

        } catch (error) {
            return true
        }
    }
}