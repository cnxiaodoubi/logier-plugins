import { readAndParseJSON } from '../utils/getdate.js'

export class newcomer extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]进退群群通知',
      dsc: '进退群群通知',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 4999
    })
  }

  /** 接受到消息都会执行一次 */
  async accept (e) {
    /** 定义入群欢迎内容 */

    /** 冷却cd 30s */
    let cd = 30

    if (this.e.user_id == this.e.bot.uin) return

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    logger.info('key' + key)
    if (await redis.get(key)) return
    redis.set(key, '1', { EX: cd })

    let welcome = await readAndParseJSON('../data/welcome.json')

    let nickname
    if (e.nickname) {
      nickname = e.nickname
    } else if (e.sender && e.sender.card) {
      nickname = e.sender.card
    } else {
      // 从成员列表里获取该用户昵称
      let memberMap = await e.group.getMemberMap()
      nickname = (memberMap && memberMap.get(e.user_id)) ? memberMap.get(e.user_id).nickname : ''
    }

    let randomIndex = Math.floor(Math.random() * welcome.length) // 选择一个随机的欢迎消息
    let msg = welcome[randomIndex].replace('{0}', nickname) // 将{0}替换为成员的昵称

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`),
      msg
    ])
  }
}

export class outNotice extends plugin {
  constructor () {
    super({
      name: '退群通知',
      dsc: 'xx退群了',
      event: 'notice.group.decrease'
    })

    /** 退群提示词 */
    this.tips = '退群了'
  }

  async accept(event) {
    // 如果退群的是机器人本身，则不处理
    if (event.user_id === event.bot.uin) return;

    let name = '未知用户';

    // 调试信息：输出 event.member 对象
    logger.debug(`event.member: ${JSON.stringify(event.member)}`);

    // 获取退群成员的昵称或卡片名称
    if (event.member && (event.member.card || event.member.nickname)) {
      name = event.member.card || event.member.nickname;
    }

    // 构建通知消息
    const msg = `${name}(${event.user_id}) ${this.tips}`;

    // 记录日志
    logger.info(`[退出通知] ${event.logText} ${msg}`);

    // 回复消息到群聊
    await this.bot.sendGroupMsg({
      group_id: event.group_id,
      message: msg,
    });
  }
}
