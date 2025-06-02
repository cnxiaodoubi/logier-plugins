import puppeteer from 'puppeteer'
import { readAndParseJSON, getFunctionData, numToChinese, getImageUrl } from '../utils/getdate.js'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日运势', // 插件名称
      dsc: '今日运势', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(今日运势|运势)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '今日运势' // 执行方法
        },
        {
          reg: '^#?(悔签|重新抽取运势)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '悔签' // 执行方法
        }
      ]
    })
  }


  async 今日运势 (e) {
    let jrys = await readAndParseJSON('../data/jrys.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
    let replymessage = '正在为您测算今日的运势……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('未读取到运势数据，随机抽取')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    if (now === data.time) {
      logger.info('[今日运势]今日已抽取运势，读取保存的数据')
      replymessage = '今日已抽取运势，让我帮你找找签……'
    } else {
      logger.info('[今日运势]日期已改变，重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }

  async 悔签 (e) {
    let jrys = await readAndParseJSON('../data/jrys.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
    let replymessage = '正在为您测算今日的运势……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('[今日运势]未读取到运势数据，悔签转为重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    if (now !== data.time) {
      logger.info('[今日运势]日期变更，重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    } else if (data.isRe) {
      logger.info('[今日运势]今日已悔签，不重新抽取')
      replymessage = '今天已经悔过签了,再给你看一眼吧……'
    } else {
      logger.info('[今日运势]悔签')
      replymessage = '异象骤生，运势竟然改变了……'
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: true
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }
}

async function generateFortune (e) {
  const UrlsConfig = getFunctionData('Urls', 'Urls', '今日运势')
  const imageUrl = await getImageUrl(UrlsConfig.imageUrls)

  let nickname = e.nickname ? e.nickname : e.sender.card

  let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
  const fortune = JSON.parse(data).fortune


// 1. 读取本地CSS文件内容
const cssPath = path.join(__dirname, '../resources/css/jrys.css');
let localCss = fs.readFileSync(cssPath, 'utf-8');

// 2. 将CSS中的字体路径转换为base64内联
const cssDir = path.dirname(cssPath); // 获取CSS文件所在目录
localCss = localCss.replace(
  /url\(['"]?(\.\/)?([^'")]+)['"]?\)/g,  // 匹配所有url()引用
  (match, prefix, fontPath) => {
    // 如果路径是相对路径(以./开头)，则基于CSS文件目录解析
    const fullFontPath = prefix === './' 
      ? path.join(cssDir, fontPath)
      : path.join(cssDir, fontPath); // 如果不是./开头也尝试同一目录
    
    try {
      const fontData = fs.readFileSync(fullFontPath);
      const base64 = fontData.toString('base64');
      
      // 根据文件扩展名确定MIME类型
      const extension = path.extname(fullFontPath).toLowerCase();
      const mimeTypes = {
        '.ttf': 'font/truetype',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'font/opentype',
        '.svg': 'image/svg+xml'
      };
      
      const mimeType = mimeTypes[extension] || 'application/octet-stream';
      
      return `url(data:${mimeType};base64,${base64})`;
    } catch (err) {
      console.error(`无法加载字体文件: ${fullFontPath}`, err);
      return match; // 如果文件读取失败，返回原始引用
    }
  }
);

// 3. 使用修改后的CSS
let Html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${localCss}</style>
</head>
<body>
<div class="container">
  <div class="fortune">
    <p>${nickname}的${await numToChinese(new Date().getDate())}号运势为</p>
    <h2>${fortune.fortuneSummary}</h2>
    <p>${fortune.luckyStar}</p>
    <div class="content">
      <p>${fortune.signText}</p>
      <p>${fortune.unsignText}</p>
    </div>
    <p>| 相信科学，请勿迷信 |</p>
    <p>Create By 鸢尾花插件</p>
  </div>
  <div class="image">
    <img src="${imageUrl}" />
  </div>
</div>

</body>
</html>

  `

  let browser
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(Html)
    await page.waitForSelector('img')
    const image = Buffer.from(await page.screenshot({ fullPage: true }))
    e.reply(segment.image(image))
  } catch (error) {
    logger.info('图片渲染失败，使用文本发送')
    e.reply([segment.at(e.user_id), `的${await numToChinese(new Date().getDate())}号运势为……\n${fortune.fortuneSummary}\n${fortune.luckyStar}\n${fortune.signText}\n${fortune.unsignText}`])
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
