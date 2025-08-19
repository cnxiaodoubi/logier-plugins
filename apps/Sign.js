import puppeteer from 'puppeteer'
import { getTimeOfDay, getImageUrl, getFunctionData } from '../utils/getdate.js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)




export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日签到',
      dsc: '今日签到',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(今日)?(签到|打卡)$',
          fnc: '今日签到'
        }
      ]
    })
  }

  get UrlsConfig () { return getFunctionData('Urls', 'Urls', '今日签到') }

  async 今日签到 (e) {
    let now = new Date()
    let datatime = now.toLocaleDateString('zh-CN') 

    // 获取一言数据
    const response = await fetch('https://v1.hitokoto.cn')
    const hitokodata = await response.json()
    const content = hitokodata.hitokoto

    // 获取随机图片
    let imageUrl = await getImageUrl(this.UrlsConfig.imageUrls, './plugins/logier-plugin/resources/gallery/114388636.webp')

    // 修复点1：安全解析 Redis 数据，避免 JSON.parse 报错
    let data
    try {
      const redisData = await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`)
      data = redisData ? JSON.parse(redisData) : null
    } catch (err) {
      logger.error('解析签到数据失败:', err)
      data = null
    }

    const addfavor = Math.floor(Math.random() * 10) + 1
    let issign = `好感度+${addfavor}`

    // 初始化或更新签到数据
    if (!data || typeof data !== 'object') {
      data = { favor: addfavor, time: datatime }
    } else if (data.time !== datatime) {
      data.favor += addfavor
      data.time = datatime
    } else if (data.time === datatime) {
      issign = '今日已经签到了'
    }

    // 存储数据到 Redis
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_sign`, JSON.stringify(data))

    // 修复点2：再次获取数据时也做安全解析
    let finaldata
    try {
      const finalRedisData = await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`)
      finaldata = finalRedisData ? JSON.parse(finalRedisData) : data // 如果解析失败，回退到当前 data
    } catch (err) {
      logger.error('解析最终数据失败:', err)
      finaldata = data
    }

    // 处理群排名数据
    let groupdata = {}
    try {
      const groupRedisData = await redis.get(`Yunzai:logier-plugin:group${e.group_id}_sign`)
      groupdata = groupRedisData ? JSON.parse(groupRedisData) : {}
    } catch (err) {
      logger.error('解析群数据失败:', err)
      groupdata = {}
    }

    groupdata[e.user_id] = data.favor
    await redis.set(`Yunzai:logier-plugin:group${e.group_id}_sign`, JSON.stringify(groupdata))

    // 计算排名
    let favorValues = Object.values(groupdata)
    favorValues.sort((a, b) => b - a)
    let position = favorValues.indexOf(data.favor) + 1

    let nickname = e.nickname ? e.nickname : e.sender.card



 // 1. 读取本地CSS文件内容
    const cssPath = path.join(__dirname, '../resources/css/sgin.css');
    let localCss = fs.readFileSync(cssPath, 'utf-8');
    const jsPath = path.join(__dirname, '../resources/js/ign.js');
    let localJs = fs.readFileSync(jsPath, 'utf-8');














    // 生成 HTML
    let Html = `
  <!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>用户信息卡片</title>
   <style>${localCss}</style>   
</head>
<body>
  <div id="main">
    <canvas id="cav"></canvas>
    <div id="wrapper">
      <div id="left">
        <div id="user_line">
          <br>
          <img alt="用户头像" id="avatar" src="https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}" />
          <p><span id="greeting">${getTimeOfDay()}好！</span><br>${nickname}</p>
          <br>
          <div id="user_info">
            <p>${issign}</p>
            <p>当前好感度：${finaldata.favor}</p>
            <p>当前群排名：第${position}位</p>
            <p id="daily_quote">今日一言：<br>${content}</p>   
          </div>  
        </div>
      </div>
      <div id="right">
        <div id="img_top" class="img_around">
          <span id="date_text">${datatime}</span>
        </div>
        <img alt="内容图片" id="cont_img" class="bgimg" />
        <div id="img_bottom" class="img_around"></div>
      </div>
      <p id="footer">Create By 鸢尾花插件</p> 
    </div>
  </div>
  <script>${localJs}</script>
</body>
</html>
          `

    // 使用 Puppeteer 渲染图片
    let browser
    try {
      if (!imageUrl) {
        throw new Error('无法获取图片URL')
      }
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      const page = await browser.newPage()
      await page.setContent(Html)
      const imgElement = await page.$('#main')
      const image = Buffer.from(await imgElement.screenshot())
      e.reply(segment.image(image))
    } catch (error) {
      logger.error('签到图片渲染失败:', error)
      e.reply('签到成功，但图片生成失败，请稍后再试~')
    } finally {
      if (browser) {
        await browser.close()
      }
    }
    return true
  }
}
