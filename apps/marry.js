import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class example extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日老婆',
      dsc: '今日老婆',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(#|/)?(今日老婆|marry)$',
          fnc: '今日老婆'
        }
        /* {
                    reg: "^(#|/)?(休妻|悔婚)$",
                    fnc: '悔婚',
                } */
      ]
    })
  };

  async 今日老婆 (e) {
    const date_time = formatDate(new Date())
    let marrydata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`))
    // let cpdata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_cp`));
    let [randomWife, selfMember] = await getRandomWife(e)

    let isSameDayMarry = marrydata && marrydata.lastmarryDate == date_time
    // let isSameDayCP = cpdata && cpdata.lastCPDate == date_time;

    let notMarryToday = marrydata && !isSameDayMarry
    // let notCPToday = cpdata && !isSameDayCP;

    let replyMessage = ''

    let isRemarry = marrydata && marrydata.isRemarry ? marrydata.isRemarry : false

    let imageUrl
    let content

    if (!marrydata || notMarryToday) {
      // logger.info("1")
    } else if (isSameDayMarry) {
      replyMessage = `今天已经迎娶【${marrydata.lastmarry.nickname}】了哦~`,
      imageUrl = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${marrydata.lastmarry.user_id}`
      // logger.info(marrydata)
    } /* else if (!marrydata && isSameDayCP || notMarryToday && isSameDayCP) {
            replyMessage = `今天已经被【${cpdata.lastCP.nickname}】娶走了哦~`;
            imageUrl = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${cpdata.lastCP.user_id}`
            // logger.info("3")
        } else if (!marrydata && notCPToday) {
            this.setContext('继续cp');
            replyMessage = `之前【${cpdata.lastCP.nickname}】和你组成CP了，如果想继续请回复“是的”`;
            // logger.info("4")
        } */ else {
      await redis.del(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`)
      // await redis.del(`Yunzai:logier-plugin:${e.group_id}_${randomWife.user_id}_cp`);
    }

    if (replyMessage) {
      generateFortune(e, replyMessage, content, imageUrl)
    } else {
      handleMarryAndCP(isRemarry, e, date_time, randomWife, selfMember, redis)
    }

    return true
  }

  /* async 悔婚(e) {
        const isRemarry = true;
        const date_time = formatDate(new Date());
        const marrydata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`));
        let [randomWife, selfMember] = await getRandomWife(e);

        if (!marrydata.isRemarry && isRemarry) {

            handleMarryAndCP(true, e, date_time, randomWife, selfMember, redis)

        } else if (marrydata.isRemarry && isRemarry) {
            await this.e.reply(['小小', segment.at(e.user_id), '竟敢不自量力，一天只可以悔婚一次'], true);
        }
        else {
            await redis.del(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`);
            await redis.del(`Yunzai:logier-plugin:${e.group_id}_${randomWife.user_id}_cp`);
            handleMarryAndCP(false, e, date_time, randomWife, selfMember, redis);
        }

    return true;

    }

    async recp(e) {
        this.finish('recp')
        let messageText = this.e.message.map(item => item.text).join('');
        if (/^(#|\/)?(是的|是|愿意|继续|我愿意|当然)$/.test(messageText)) {
            const date_time = formatDate(new Date());
            const marrydata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_marry`));
            const cpdata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_cp`));
            let marry = {
                lastmarryDate: date_time,
                lastmarry: marrydata.lastmarry,
                isRemarry: marrydata.isRemarry
            };
            let cp = {
                lastCPDate: date_time,
                lastCP: cpdata.lastCP,
            };
            await redis.set(`Yunzai:logier-plugin:${e.group_id}_${cpdata.lastCP.user_id}_marry`, JSON.stringify(marry));
            await redis.set(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_cp`, JSON.stringify(cp));
            let replyMessage = `和${cpdata.lastCP.nickname}续婚了哦~`;
            let imageUrl = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${cpdata.lastCP.user_id}`;

            generateFortune(e,replyMessage,content, imageUrl);
        }else {
            handleMarryAndCP(false, e, date_time, randomWife, selfMember, redis);
        }

        return true;

        } */
}

function formatDate (date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function handleMarryAndCP (isRemarry, e, date_time, randomWife, selfMember, redis) {
  let marry = {
    lastmarryDate: date_time,
    lastmarry: randomWife,
    isRemarry
  }
  /* let cp = {
        lastCPDate: date_time,
        lastCP: selfMember,
    }; */
  await redis.set(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`, JSON.stringify(marry))
  // await redis.set(`Yunzai:logier-plugin:${e.group_id}_${randomWife.user_id}_cp`, JSON.stringify(cp));
  let content = isRemarry ? '解怨释结，更莫相憎；一别两宽，各生欢喜。' : ''
  let replyMessage = `${randomWife.nickname}成为了你的新老婆哦~`
  let imageUrl = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${randomWife.user_id}`

  generateFortune(e, replyMessage, content, imageUrl)
}

async function getRandomWife (e) {
  let mmap = await e.group.getMemberMap()
  let arrMember = Array.from(mmap.values())
  const selfMember = arrMember.find(member => member.user_id === String(e.user_id))
  let excludeUserIds = [String(e.self_id), String(e.user_id), '2854196310']
  let filteredArrMember = arrMember.filter(member => !excludeUserIds.includes(String(member.user_id)))
  const randomWife = filteredArrMember[Math.floor(Math.random() * filteredArrMember.length)]

  return [randomWife, selfMember]
}

async function generateFortune (e, replyMessage, content, imageUrl) {
  let 结婚诗词 = [
    '百年推甲子，福地在春申',
    '红毹拥出态娇妍，璧合珠联看并肩',
    '锦堂此夜春如海，瑞兆其昌五世绵',
    '喜溢重门迎凤侣，光增陋室迓宾车',
    '花好月圆庆佳期，鸟语芬芳喜事添',
    '蓬门且喜来珠履，侣伴从今到白头',
    '志同道合好伴侣，情深谊长新家庭',
    '连理枝头喜鹊闹，才子佳人信天缘',
    '百年恩爱双心结，千里姻缘一线牵',
    '琴韵谱成同梦语，灯花笑对含羞人',
    '佳偶天成心相印，百年好合乐无边',
    '洞房花烛交颈鸳鸯双得意，夫妻恩爱和鸣凤鸾两多情',
    '锋芒略敛夫妻和美，凡事无争伉俪温馨',
    '相亲相爱幸福永，同德同心幸福长',
    '鸳鸯璧合天缘定，龙凤呈祥喜气生',
    '百年修得同船渡，千年修得共枕眠',
    '良缘相遇情不禁，一种缘分两处思',
    '情投意合如芝兰，同心协力共克艰',
    '桃花潭水深千尺，不及汪伦送我情',
    '花开花落两相知，缘来缘去共相守']
  if (!content) {
    let randomIndex = Math.floor(Math.random() * 结婚诗词.length)
    content = 结婚诗词[randomIndex]
  }

// 1. 读取本地CSS文件内容
const cssPath = path.join(__dirname, '../resources/css/marry.css');
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
   <div class="fortune">
     <h2>今日老婆</h2>
        <br>
       <div class="content">
          <p>${content}</p>
       </div>
          <br>
          <br>
          <br>
        <p>Create By Logier-Plugin </p>
   </div>
     <div class="image">
      <img src="${imageUrl}" />
    </div>
  </body>
 </html> `

  let browser;
  try {
    // 启动Puppeteer浏览器实例，设置无头模式，并添加一些启动参数以避免某些环境下的权限问题
    browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox']});

    // 创建一个新的页面实例
    const page = await browser.newPage();

    // 设置页面内容为HTML字符串（这里假设Html变量已经定义并包含了要渲染的HTML内容）
    await page.setContent(Html);

    // 截取整个页面的图片，并将结果转换为Buffer对象
    const image = Buffer.from(await page.screenshot({fullPage: true}));

    // 发送包含图片的消息
    e.reply([replyMessage, segment.image(image)], true);
  } catch (error) {
    // 如果过程中发生错误，记录日志，并尝试使用文本消息回复
    logger.info('[今日老婆]：图片渲染失败，使用文本发送');
  } finally {
    // 无论是否发生错误，确保浏览器实例被关闭
    if (browser) {
      await browser.close();
    }
  }
}
