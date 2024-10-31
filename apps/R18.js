import fetch from 'node-fetch';

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]三次元',
      dsc: '三次元',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(三次元)$',
          fnc: '三次元'
        },
      ]
    });
      }
    



      async 摸鱼日历 (e) {


 // 判断是否为 Base64 图片
 if (imageUrl.startsWith('data:image/') && imageUrl.includes(';base64,')) {
    // 如果是 Base64 图片 也发不出去

    e.reply([segment.image(imageUrl)]) // 直接发送 Base64 图片
  } else {
    // 如果不是 Base64 图片
    e.reply([segment.image(imageUrl)]) // 直接发送普通图片
  }
      
  return true
}
}
  const imageUrl = Buffer.from('https://ap.atxrom.com/r18');// 三次元接口地址 自己用