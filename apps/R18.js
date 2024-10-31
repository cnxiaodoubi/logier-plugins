import { getFunctionData } from '../utils/getdate.js'
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
    let fetchUrl = await fetch(moyuapiUrl).catch(err => logger.error(err));
    let imgUrl = await fetchUrl.json();
    imgUrl = await imgUrl.url;

    e.reply([segment.image(imgUrl)]);

    return true
  }

}

const moyuapiUrl = 'https://ap.atxrom.com/r18';// 三次元接口地址 自己用