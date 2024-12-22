import puppeteer from 'puppeteer'
import { NumToRoman, getImageUrl, getFunctionData } from '../utils/getdate.js'
import fetch from 'node-fetch'

import setting from '../model/setting.js'

export class example extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日天气',
      dsc: '今日天气',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(天气)\\s.*$',
          fnc: '城市天气'
        }
      ]
    })
    this.task = {
      cron: this.Config.WeatherPushTime,
      name: '推送城市天气',
      fnc: () => this.推送城市天气()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get Config () {
    return setting.getConfig('Weather')
  }

  async 推送城市天气 (e) {
    if (!this.Config.WeatherPushSwitch) { return false }

    logger.info('[城市天气]开始推送……')
    for (let i = 0; i < this.Config.WeatherPushgroup.length; i++) {
      setTimeout(async () => {
        Bot.pickGroup(this.Config.WeatherPushgroup[i].group).sendMsg([segment.image(await pushweather(e, this.Config.WeatherPushgroup[i].city))])
      }, i * 3000)
    }
    return true
  }

  async 城市天气 (e) {
    logger.info(this.Config.WeatherPushSwitch)
    logger.info(this.Config.WeatherPushgroup)

    const image = Buffer.from(await pushweather(e)) // 添加了 await
    e.reply([segment.image(image)])

    return true
  }
}

const WeatherKey = setting.getConfig('Weather').WeatherKey

async function pushweather (e, pushcity) {
  const city = (e?.msg ?? '').replace(/#?(天气)/, '').trim()
  const cityToUse = city || pushcity

  const { location, name } = await getCityGeo(cityToUse, WeatherKey)

  const output = await getIndices(location, WeatherKey)

  const { forecastresult, iconDays, iconNights } = await getForecast(location, WeatherKey)

  let now = new Date()
  let datatime = now.toLocaleDateString('zh-CN') // 日期格式
  let days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let dayOfWeek = days[now.getDay()] // 日期转换为星期几

  const urlConfig = await getFunctionData('Urls', 'Urls', '城市天气')

  let imageUrl = await getImageUrl(urlConfig.imageUrls)


  let browser
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    let Html = `
         <!DOCTYPE html>
         <html>
         <head>
         <link rel="stylesheet" href="../resources/font/"> 
         <style>
         /*!
* QWeather Icons (https://icons.qweather.com)
* Copyright QWeather 和风天气 (https://www.qweather.com)
* License:  Code for MIT, Icons for CC BY 4.0
*/

@font-face {
  font-family: "qweather-icons";
  src: url("../resources/font/fonts/qweather-icons.woff2?c4a8eb216e1e59e6c4df464b9ee6f9be") format("woff2"),
       url("../resources/font/fonts/qweather-icons.woff?c4a8eb216e1e59e6c4df464b9ee6f9be") format("woff"),
       url("../resources/font/fonts/qweather-icons.ttf?c4a8eb216e1e59e6c4df464b9ee6f9be") format("truetype");
}

[class^="qi-"]::before,
[class*=" qi-"]::before {
  display: inline-block;
  font-family: "qweather-icons" !important;
  font-style: normal;
  font-weight: normal !important;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  vertical-align: -.125em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.qi-100::before { content: "\\f101"; }
.qi-101::before { content: "\\f102"; }
.qi-102::before { content: "\\f103"; }
.qi-103::before { content: "\\f104"; }
.qi-104::before { content: "\\f105"; }
.qi-150::before { content: "\\f106"; }
.qi-151::before { content: "\\f107"; }
.qi-152::before { content: "\\f108"; }
.qi-153::before { content: "\\f109"; }
.qi-300::before { content: "\\f10a"; }
.qi-301::before { content: "\\f10b"; }
.qi-302::before { content: "\\f10c"; }
.qi-303::before { content: "\\f10d"; }
.qi-304::before { content: "\\f10e"; }
.qi-305::before { content: "\\f10f"; }
.qi-306::before { content: "\\f110"; }
.qi-307::before { content: "\\f111"; }
.qi-308::before { content: "\\f112"; }
.qi-309::before { content: "\\f113"; }
.qi-310::before { content: "\\f114"; }
.qi-311::before { content: "\\f115"; }
.qi-312::before { content: "\\f116"; }
.qi-313::before { content: "\\f117"; }
.qi-314::before { content: "\\f118"; }
.qi-315::before { content: "\\f119"; }
.qi-316::before { content: "\\f11a"; }
.qi-317::before { content: "\\f11b"; }
.qi-318::before { content: "\\f11c"; }
.qi-350::before { content: "\\f11d"; }
.qi-351::before { content: "\\f11e"; }
.qi-399::before { content: "\\f11f"; }
.qi-400::before { content: "\\f120"; }
.qi-401::before { content: "\\f121"; }
.qi-402::before { content: "\\f122"; }
.qi-403::before { content: "\\f123"; }
.qi-404::before { content: "\\f124"; }
.qi-405::before { content: "\\f125"; }
.qi-406::before { content: "\\f126"; }
.qi-407::before { content: "\\f127"; }
.qi-408::before { content: "\\f128"; }
.qi-409::before { content: "\\f129"; }
.qi-410::before { content: "\\f12a"; }
.qi-456::before { content: "\\f12b"; }
.qi-457::before { content: "\\f12c"; }
.qi-499::before { content: "\\f12d"; }
.qi-500::before { content: "\\f12e"; }
.qi-501::before { content: "\\f12f"; }
.qi-502::before { content: "\\f130"; }
.qi-503::before { content: "\\f131"; }
.qi-504::before { content: "\\f132"; }
.qi-507::before { content: "\\f133"; }
.qi-508::before { content: "\\f134"; }
.qi-509::before { content: "\\f135"; }
.qi-510::before { content: "\\f136"; }
.qi-511::before { content: "\\f137"; }
.qi-512::before { content: "\\f138"; }
.qi-513::before { content: "\\f139"; }
.qi-514::before { content: "\\f13a"; }
.qi-515::before { content: "\\f13b"; }
.qi-800::before { content: "\\f13c"; }
.qi-801::before { content: "\\f13d"; }
.qi-802::before { content: "\\f13e"; }
.qi-803::before { content: "\\f13f"; }
.qi-804::before { content: "\\f140"; }
.qi-805::before { content: "\\f141"; }
.qi-806::before { content: "\\f142"; }
.qi-807::before { content: "\\f143"; }
.qi-900::before { content: "\\f144"; }
.qi-901::before { content: "\\f145"; }
.qi-999::before { content: "\\f146"; }
.qi-1001::before { content: "\\f147"; }
.qi-1002::before { content: "\\f148"; }
.qi-1003::before { content: "\\f149"; }
.qi-1004::before { content: "\\f14a"; }
.qi-1005::before { content: "\\f14b"; }
.qi-1006::before { content: "\\f14c"; }
.qi-1007::before { content: "\\f14d"; }
.qi-1008::before { content: "\\f14e"; }
.qi-1009::before { content: "\\f14f"; }
.qi-1010::before { content: "\\f150"; }
.qi-1011::before { content: "\\f151"; }
.qi-1012::before { content: "\\f152"; }
.qi-1013::before { content: "\\f153"; }
.qi-1014::before { content: "\\f154"; }
.qi-1015::before { content: "\\f155"; }
.qi-1016::before { content: "\\f156"; }
.qi-1017::before { content: "\\f157"; }
.qi-1018::before { content: "\\f158"; }
.qi-1019::before { content: "\\f159"; }
.qi-1020::before { content: "\\f15a"; }
.qi-1021::before { content: "\\f15b"; }
.qi-1022::before { content: "\\f15c"; }
.qi-1023::before { content: "\\f15d"; }
.qi-1024::before { content: "\\f15e"; }
.qi-1025::before { content: "\\f15f"; }
.qi-1026::before { content: "\\f160"; }
.qi-1027::before { content: "\\f161"; }
.qi-1028::before { content: "\\f162"; }
.qi-1029::before { content: "\\f163"; }
.qi-1030::before { content: "\\f164"; }
.qi-1031::before { content: "\\f165"; }
.qi-1032::before { content: "\\f166"; }
.qi-1033::before { content: "\\f167"; }
.qi-1034::before { content: "\\f168"; }
.qi-1035::before { content: "\\f169"; }
.qi-1036::before { content: "\\f16a"; }
.qi-1037::before { content: "\\f16b"; }
.qi-1038::before { content: "\\f16c"; }
.qi-1039::before { content: "\\f16d"; }
.qi-1040::before { content: "\\f16e"; }
.qi-1041::before { content: "\\f16f"; }
.qi-1042::before { content: "\\f170"; }
.qi-1043::before { content: "\\f171"; }
.qi-1044::before { content: "\\f172"; }
.qi-1045::before { content: "\\f173"; }
.qi-1046::before { content: "\\f174"; }
.qi-1047::before { content: "\\f175"; }
.qi-1048::before { content: "\\f176"; }
.qi-1049::before { content: "\\f177"; }
.qi-1050::before { content: "\\f178"; }
.qi-1051::before { content: "\\f179"; }
.qi-1052::before { content: "\\f17a"; }
.qi-1053::before { content: "\\f17b"; }
.qi-1054::before { content: "\\f17c"; }
.qi-1055::before { content: "\\f17d"; }
.qi-1056::before { content: "\\f17e"; }
.qi-1057::before { content: "\\f17f"; }
.qi-1058::before { content: "\\f180"; }
.qi-1059::before { content: "\\f181"; }
.qi-1060::before { content: "\\f182"; }
.qi-1061::before { content: "\\f183"; }
.qi-1062::before { content: "\\f184"; }
.qi-1063::before { content: "\\f185"; }
.qi-1064::before { content: "\\f186"; }
.qi-1065::before { content: "\\f187"; }
.qi-1066::before { content: "\\f188"; }
.qi-1067::before { content: "\\f189"; }
.qi-1068::before { content: "\\f18a"; }
.qi-1069::before { content: "\\f18b"; }
.qi-1071::before { content: "\\f18c"; }
.qi-1072::before { content: "\\f18d"; }
.qi-1073::before { content: "\\f18e"; }
.qi-1074::before { content: "\\f18f"; }
.qi-1075::before { content: "\\f190"; }
.qi-1076::before { content: "\\f191"; }
.qi-1077::before { content: "\\f192"; }
.qi-1078::before { content: "\\f193"; }
.qi-1079::before { content: "\\f194"; }
.qi-1080::before { content: "\\f195"; }
.qi-1081::before { content: "\\f196"; }
.qi-1082::before { content: "\\f197"; }
.qi-1084::before { content: "\\f198"; }
.qi-1085::before { content: "\\f199"; }
.qi-1086::before { content: "\\f19a"; }
.qi-1087::before { content: "\\f19b"; }
.qi-1088::before { content: "\\f19c"; }
.qi-1089::before { content: "\\f19d"; }
.qi-1201::before { content: "\\f2c5"; }
.qi-1202::before { content: "\\f2c6"; }
.qi-1203::before { content: "\\f2c7"; }
.qi-1204::before { content: "\\f2c8"; }
.qi-1205::before { content: "\\f2c9"; }
.qi-1206::before { content: "\\f2ca"; }
.qi-1207::before { content: "\\f2cb"; }
.qi-1208::before { content: "\\f2cc"; }
.qi-1209::before { content: "\\f2cd"; }
.qi-1210::before { content: "\\f2ce"; }
.qi-1211::before { content: "\\f2cf"; }
.qi-1212::before { content: "\\f2d0"; }
.qi-1213::before { content: "\\f2d1"; }
.qi-1214::before { content: "\\f2d2"; }
.qi-1215::before { content: "\\f2d3"; }
.qi-1216::before { content: "\\f2d4"; }
.qi-1217::before { content: "\\f2d5"; }
.qi-1218::before { content: "\\f2d6"; }
.qi-1219::before { content: "\\f2d7"; }
.qi-1221::before { content: "\\f2d8"; }
.qi-1241::before { content: "\\f2d9"; }
.qi-1242::before { content: "\\f2da"; }
.qi-1243::before { content: "\\f2db"; }
.qi-1244::before { content: "\\f2dc"; }
.qi-1245::before { content: "\\f2dd"; }
.qi-1246::before { content: "\\f2de"; }
.qi-1247::before { content: "\\f2df"; }
.qi-1248::before { content: "\\f2e0"; }
.qi-1249::before { content: "\\f2e1"; }
.qi-1250::before { content: "\\f2e2"; }
.qi-1251::before { content: "\\f2e3"; }
.qi-1271::before { content: "\\f2f6"; }
.qi-1272::before { content: "\\f2f7"; }
.qi-1273::before { content: "\\f2f8"; }
.qi-1274::before { content: "\\f2f9"; }
.qi-1601::before { content: "\\f1a1"; }
.qi-1602::before { content: "\\f1a2"; }
.qi-1603::before { content: "\\f1a3"; }
.qi-1604::before { content: "\\f1a4"; }
.qi-1605::before { content: "\\f1a5"; }
.qi-1606::before { content: "\\f1a6"; }
.qi-1607::before { content: "\\f1a7"; }
.qi-1608::before { content: "\\f20c"; }
.qi-1609::before { content: "\\f20d"; }
.qi-1610::before { content: "\\f20e"; }
.qi-1701::before { content: "\\f1a8"; }
.qi-1702::before { content: "\\f1a9"; }
.qi-1703::before { content: "\\f1aa"; }
.qi-1801::before { content: "\\f20f"; }
.qi-1802::before { content: "\\f210"; }
.qi-1803::before { content: "\\f211"; }
.qi-1804::before { content: "\\f212"; }
.qi-1805::before { content: "\\f213"; }
.qi-2001::before { content: "\\f1ab"; }
.qi-2002::before { content: "\\f1ac"; }
.qi-2003::before { content: "\\f1ad"; }
.qi-2004::before { content: "\\f1ae"; }
.qi-2005::before { content: "\\f1af"; }
.qi-2006::before { content: "\\f1b0"; }
.qi-2007::before { content: "\\f1b1"; }
.qi-2029::before { content: "\\f214"; }
.qi-2030::before { content: "\\f215"; }
.qi-2031::before { content: "\\f216"; }
.qi-2032::before { content: "\\f217"; }
.qi-2033::before { content: "\\f218"; }
.qi-2050::before { content: "\\f219"; }
.qi-2051::before { content: "\\f21a"; }
.qi-2052::before { content: "\\f1c7"; }
.qi-2053::before { content: "\\f1c8"; }
.qi-2054::before { content: "\\f1c9"; }
.qi-2070::before { content: "\\f21b"; }
.qi-2071::before { content: "\\f21c"; }
.qi-2072::before { content: "\\f21d"; }
.qi-2073::before { content: "\\f21e"; }
.qi-2074::before { content: "\\f21f"; }
.qi-2075::before { content: "\\f220"; }
.qi-2076::before { content: "\\f221"; }
.qi-2077::before { content: "\\f222"; }
.qi-2078::before { content: "\\f223"; }
.qi-2079::before { content: "\\f224"; }
.qi-2080::before { content: "\\f225"; }
.qi-2081::before { content: "\\f226"; }
.qi-2082::before { content: "\\f227"; }
.qi-2083::before { content: "\\f228"; }
.qi-2084::before { content: "\\f229"; }
.qi-2085::before { content: "\\f22a"; }
.qi-2100::before { content: "\\f22b"; }
.qi-2101::before { content: "\\f22c"; }
.qi-2102::before { content: "\\f22d"; }
.qi-2103::before { content: "\\f22e"; }
.qi-2104::before { content: "\\f22f"; }
.qi-2105::before { content: "\\f230"; }
.qi-2106::before { content: "\\f231"; }
.qi-2107::before { content: "\\f232"; }
.qi-2108::before { content: "\\f233"; }
.qi-2109::before { content: "\\f234"; }
.qi-2111::before { content: "\\f235"; }
.qi-2120::before { content: "\\f236"; }
.qi-2121::before { content: "\\f237"; }
.qi-2122::before { content: "\\f238"; }
.qi-2123::before { content: "\\f239"; }
.qi-2124::before { content: "\\f23a"; }
.qi-2125::before { content: "\\f23b"; }
.qi-2126::before { content: "\\f23c"; }
.qi-2127::before { content: "\\f23d"; }
.qi-2128::before { content: "\\f23e"; }
.qi-2129::before { content: "\\f23f"; }
.qi-2130::before { content: "\\f240"; }
.qi-2131::before { content: "\\f241"; }
.qi-2132::before { content: "\\f242"; }
.qi-2133::before { content: "\\f243"; }
.qi-2134::before { content: "\\f244"; }
.qi-2135::before { content: "\\f245"; }
.qi-2150::before { content: "\\f246"; }
.qi-2151::before { content: "\\f247"; }
.qi-2152::before { content: "\\f248"; }
.qi-2153::before { content: "\\f249"; }
.qi-2154::before { content: "\\f24a"; }
.qi-2155::before { content: "\\f24b"; }
.qi-2156::before { content: "\\f24c"; }
.qi-2157::before { content: "\\f24d"; }
.qi-2158::before { content: "\\f24e"; }
.qi-2159::before { content: "\\f24f"; }
.qi-2160::before { content: "\\f250"; }
.qi-2161::before { content: "\\f251"; }
.qi-2162::before { content: "\\f252"; }
.qi-2163::before { content: "\\f253"; }
.qi-2164::before { content: "\\f254"; }
.qi-2165::before { content: "\\f255"; }
.qi-2166::before { content: "\\f256"; }
.qi-2190::before { content: "\\f257"; }
.qi-2191::before { content: "\\f258"; }
.qi-2192::before { content: "\\f259"; }
.qi-2193::before { content: "\\f25a"; }
.qi-2200::before { content: "\\f2e4"; }
.qi-2201::before { content: "\\f2e5"; }
.qi-2202::before { content: "\\f2e6"; }
.qi-2203::before { content: "\\f2e7"; }
.qi-2204::before { content: "\\f2e8"; }
.qi-2205::before { content: "\\f2e9"; }
.qi-2207::before { content: "\\f2ea"; }
.qi-2208::before { content: "\\f2eb"; }
.qi-2209::before { content: "\\f2ec"; }
.qi-2210::before { content: "\\f2ed"; }
.qi-2211::before { content: "\\f2ee"; }
.qi-2212::before { content: "\\f2ef"; }
.qi-2213::before { content: "\\f2f0"; }
.qi-2214::before { content: "\\f2f1"; }
.qi-2215::before { content: "\\f2f2"; }
.qi-2216::before { content: "\\f2f3"; }
.qi-2217::before { content: "\\f2f4"; }
.qi-2218::before { content: "\\f2f5"; }
.qi-2300::before { content: "\\f25b"; }
.qi-2301::before { content: "\\f25c"; }
.qi-2302::before { content: "\\f25d"; }
.qi-2303::before { content: "\\f25e"; }
.qi-2304::before { content: "\\f25f"; }
.qi-2305::before { content: "\\f260"; }
.qi-2306::before { content: "\\f261"; }
.qi-2307::before { content: "\\f262"; }
.qi-2308::before { content: "\\f263"; }
.qi-2309::before { content: "\\f264"; }
.qi-2311::before { content: "\\f265"; }
.qi-2312::before { content: "\\f266"; }
.qi-2313::before { content: "\\f267"; }
.qi-2314::before { content: "\\f268"; }
.qi-2315::before { content: "\\f269"; }
.qi-2316::before { content: "\\f26a"; }
.qi-2317::before { content: "\\f26b"; }
.qi-2318::before { content: "\\f26c"; }
.qi-2319::before { content: "\\f26d"; }
.qi-2320::before { content: "\\f26e"; }
.qi-2321::before { content: "\\f26f"; }
.qi-2322::before { content: "\\f270"; }
.qi-2323::before { content: "\\f271"; }
.qi-2324::before { content: "\\f272"; }
.qi-2325::before { content: "\\f273"; }
.qi-2326::before { content: "\\f274"; }
.qi-2327::before { content: "\\f275"; }
.qi-2328::before { content: "\\f276"; }
.qi-2330::before { content: "\\f277"; }
.qi-2331::before { content: "\\f278"; }
.qi-2332::before { content: "\\f279"; }
.qi-2333::before { content: "\\f27a"; }
.qi-2341::before { content: "\\f27b"; }
.qi-2343::before { content: "\\f27c"; }
.qi-2345::before { content: "\\f27d"; }
.qi-2346::before { content: "\\f27e"; }
.qi-2348::before { content: "\\f27f"; }
.qi-2349::before { content: "\\f280"; }
.qi-2350::before { content: "\\f281"; }
.qi-2351::before { content: "\\f282"; }
.qi-2352::before { content: "\\f283"; }
.qi-2353::before { content: "\\f284"; }
.qi-2354::before { content: "\\f285"; }
.qi-2355::before { content: "\\f286"; }
.qi-2356::before { content: "\\f287"; }
.qi-2357::before { content: "\\f288"; }
.qi-2358::before { content: "\\f289"; }
.qi-2359::before { content: "\\f28a"; }
.qi-2360::before { content: "\\f28b"; }
.qi-2361::before { content: "\\f28c"; }
.qi-2362::before { content: "\\f28d"; }
.qi-2363::before { content: "\\f28e"; }
.qi-2364::before { content: "\\f28f"; }
.qi-2365::before { content: "\\f290"; }
.qi-2366::before { content: "\\f291"; }
.qi-2367::before { content: "\\f292"; }
.qi-2368::before { content: "\\f293"; }
.qi-2369::before { content: "\\f294"; }
.qi-2370::before { content: "\\f295"; }
.qi-2371::before { content: "\\f296"; }
.qi-2372::before { content: "\\f297"; }
.qi-2373::before { content: "\\f298"; }
.qi-2374::before { content: "\\f299"; }
.qi-2375::before { content: "\\f29a"; }
.qi-2376::before { content: "\\f29b"; }
.qi-2377::before { content: "\\f29c"; }
.qi-2378::before { content: "\\f29d"; }
.qi-2379::before { content: "\\f29e"; }
.qi-2380::before { content: "\\f29f"; }
.qi-2381::before { content: "\\f2a0"; }
.qi-2382::before { content: "\\f2a1"; }
.qi-2383::before { content: "\\f2a2"; }
.qi-2384::before { content: "\\f2a3"; }
.qi-2385::before { content: "\\f2a4"; }
.qi-2386::before { content: "\\f2a5"; }
.qi-2387::before { content: "\\f2a6"; }
.qi-2388::before { content: "\\f2a7"; }
.qi-2389::before { content: "\\f2a8"; }
.qi-2390::before { content: "\\f2a9"; }
.qi-2391::before { content: "\\f2aa"; }
.qi-2392::before { content: "\\f2ab"; }
.qi-2393::before { content: "\\f2ac"; }
.qi-2394::before { content: "\\f2ad"; }
.qi-2395::before { content: "\\f2ae"; }
.qi-2396::before { content: "\\f2af"; }
.qi-2397::before { content: "\\f2b0"; }
.qi-2398::before { content: "\\f2b1"; }
.qi-2399::before { content: "\\f2b2"; }
.qi-2400::before { content: "\\f2b3"; }
.qi-2409::before { content: "\\f2b4"; }
.qi-2411::before { content: "\\f2b5"; }
.qi-2412::before { content: "\\f2b6"; }
.qi-2413::before { content: "\\f2b7"; }
.qi-2414::before { content: "\\f2b8"; }
.qi-2415::before { content: "\\f2b9"; }
.qi-2416::before { content: "\\f2ba"; }
.qi-2417::before { content: "\\f2bb"; }
.qi-2418::before { content: "\\f2bc"; }
.qi-2419::before { content: "\\f2bd"; }
.qi-2420::before { content: "\\f2be"; }
.qi-2421::before { content: "\\f2bf"; }
.qi-2422::before { content: "\\f2c0"; }
.qi-2423::before { content: "\\f2c1"; }
.qi-2424::before { content: "\\f2c2"; }
.qi-2425::before { content: "\\f2c3"; }
.qi-2426::before { content: "\\f2c4"; }
.qi-9998::before { content: "\\f1ca"; }
.qi-9999::before { content: "\\f1cb"; }
.qi-100-fill::before { content: "\\f1cc"; }
.qi-101-fill::before { content: "\\f1cd"; }
.qi-102-fill::before { content: "\\f1ce"; }
.qi-103-fill::before { content: "\\f1cf"; }
.qi-104-fill::before { content: "\\f1d0"; }
.qi-150-fill::before { content: "\\f1d1"; }
.qi-151-fill::before { content: "\\f1d2"; }
.qi-152-fill::before { content: "\\f1d3"; }
.qi-153-fill::before { content: "\\f1d4"; }
.qi-300-fill::before { content: "\\f1d5"; }
.qi-301-fill::before { content: "\\f1d6"; }
.qi-302-fill::before { content: "\\f1d7"; }
.qi-303-fill::before { content: "\\f1d8"; }
.qi-304-fill::before { content: "\\f1d9"; }
.qi-305-fill::before { content: "\\f1da"; }
.qi-306-fill::before { content: "\\f1db"; }
.qi-307-fill::before { content: "\\f1dc"; }
.qi-308-fill::before { content: "\\f1dd"; }
.qi-309-fill::before { content: "\\f1de"; }
.qi-310-fill::before { content: "\\f1df"; }
.qi-311-fill::before { content: "\\f1e0"; }
.qi-312-fill::before { content: "\\f1e1"; }
.qi-313-fill::before { content: "\\f1e2"; }
.qi-314-fill::before { content: "\\f1e3"; }
.qi-315-fill::before { content: "\\f1e4"; }
.qi-316-fill::before { content: "\\f1e5"; }
.qi-317-fill::before { content: "\\f1e6"; }
.qi-318-fill::before { content: "\\f1e7"; }
.qi-350-fill::before { content: "\\f1e8"; }
.qi-351-fill::before { content: "\\f1e9"; }
.qi-399-fill::before { content: "\\f1ea"; }
.qi-400-fill::before { content: "\\f1eb"; }
.qi-401-fill::before { content: "\\f1ec"; }
.qi-402-fill::before { content: "\\f1ed"; }
.qi-403-fill::before { content: "\\f1ee"; }
.qi-404-fill::before { content: "\\f1ef"; }
.qi-405-fill::before { content: "\\f1f0"; }
.qi-406-fill::before { content: "\\f1f1"; }
.qi-407-fill::before { content: "\\f1f2"; }
.qi-408-fill::before { content: "\\f1f3"; }
.qi-409-fill::before { content: "\\f1f4"; }
.qi-410-fill::before { content: "\\f1f5"; }
.qi-456-fill::before { content: "\\f1f6"; }
.qi-457-fill::before { content: "\\f1f7"; }
.qi-499-fill::before { content: "\\f1f8"; }
.qi-500-fill::before { content: "\\f1f9"; }
.qi-501-fill::before { content: "\\f1fa"; }
.qi-502-fill::before { content: "\\f1fb"; }
.qi-503-fill::before { content: "\\f1fc"; }
.qi-504-fill::before { content: "\\f1fd"; }
.qi-507-fill::before { content: "\\f1fe"; }
.qi-508-fill::before { content: "\\f1ff"; }
.qi-509-fill::before { content: "\\f200"; }
.qi-510-fill::before { content: "\\f201"; }
.qi-511-fill::before { content: "\\f202"; }
.qi-512-fill::before { content: "\\f203"; }
.qi-513-fill::before { content: "\\f204"; }
.qi-514-fill::before { content: "\\f205"; }
.qi-515-fill::before { content: "\\f206"; }
.qi-900-fill::before { content: "\\f207"; }
.qi-901-fill::before { content: "\\f208"; }
.qi-999-fill::before { content: "\\f209"; }
.qi-qweather-fill::before { content: "\\f20a"; }
.qi-qweather::before { content: "\\f20b"; }
.qi-sunny::before { content: "\\f101"; }
.qi-cloudy::before { content: "\\f102"; }
.qi-few-clouds::before { content: "\\f103"; }
.qi-partly-cloudy::before { content: "\\f104"; }
.qi-overcast::before { content: "\\f105"; }
.qi-clear-night::before { content: "\\f106"; }
.qi-cloudy-night::before { content: "\\f107"; }
.qi-few-clouds-night::before { content: "\\f108"; }
.qi-partly-cloudy-night::before { content: "\\f109"; }
.qi-shower-rain::before { content: "\\f10a"; }
.qi-heavy-shower-rain::before { content: "\\f10b"; }
.qi-thundershower::before { content: "\\f10c"; }
.qi-heavy-thunderstorm::before { content: "\\f10d"; }
.qi-thundershower-with-hail::before { content: "\\f10e"; }
.qi-light-rain::before { content: "\\f10f"; }
.qi-moderate-rain::before { content: "\\f110"; }
.qi-heavy-rain::before { content: "\\f111"; }
.qi-extreme-rain::before { content: "\\f112"; }
.qi-drizzle-rain::before { content: "\\f113"; }
.qi-storm::before { content: "\\f114"; }
.qi-heavy-storm::before { content: "\\f115"; }
.qi-severe-storm::before { content: "\\f116"; }
.qi-freezing-rain::before { content: "\\f117"; }
.qi-light-to-moderate-rain::before { content: "\\f118"; }
.qi-moderate-to-heavy-rain::before { content: "\\f119"; }
.qi-heavy-rain-to-storm::before { content: "\\f11a"; }
.qi-storm-to-heavy-storm::before { content: "\\f11b"; }
.qi-heavy-to-severe-storm::before { content: "\\f11c"; }
.qi-shower-rain-night::before { content: "\\f11d"; }
.qi-heavy-shower-rain-night::before { content: "\\f11e"; }
.qi-rain::before { content: "\\f11f"; }
.qi-light-snow::before { content: "\\f120"; }
.qi-moderate-snow::before { content: "\\f121"; }
.qi-heavy-snow::before { content: "\\f122"; }
.qi-snowstorm::before { content: "\\f123"; }
.qi-sleet::before { content: "\\f124"; }
.qi-rain-and-snow::before { content: "\\f125"; }
.qi-shower-snow::before { content: "\\f126"; }
.qi-snow-flurry::before { content: "\\f127"; }
.qi-light-to-moderate-snow::before { content: "\\f128"; }
.qi-moderate-to-heavy-snow::before { content: "\\f129"; }
.qi-heavy-snow-to-snowstorm::before { content: "\\f12a"; }
.qi-shower-snow-night::before { content: "\\f12b"; }
.qi-snow-flurry-night::before { content: "\\f12c"; }
.qi-snow::before { content: "\\f12d"; }
.qi-mist::before { content: "\\f12e"; }
.qi-foggy::before { content: "\\f12f"; }
.qi-haze::before { content: "\\f130"; }
.qi-sand::before { content: "\\f131"; }
.qi-dust::before { content: "\\f132"; }
.qi-duststorm::before { content: "\\f133"; }
.qi-sandstorm::before { content: "\\f134"; }
.qi-dense-fog::before { content: "\\f135"; }
.qi-strong-fog::before { content: "\\f136"; }
.qi-moderate-haze::before { content: "\\f137"; }
.qi-heavy-haze::before { content: "\\f138"; }
.qi-severe-haze::before { content: "\\f139"; }
.qi-heavy-fog::before { content: "\\f13a"; }
.qi-extra-heavy-fog::before { content: "\\f13b"; }
.qi-new-moon::before { content: "\\f13c"; }
.qi-waxing-crescent::before { content: "\\f13d"; }
.qi-first-quarter::before { content: "\\f13e"; }
.qi-waxing-gibbous::before { content: "\\f13f"; }
.qi-full-moon::before { content: "\\f140"; }
.qi-waning-gibbous::before { content: "\\f141"; }
.qi-last-quarter::before { content: "\\f142"; }
.qi-waning-crescent::before { content: "\\f143"; }
.qi-hot::before { content: "\\f144"; }
.qi-cold::before { content: "\\f145"; }
.qi-unknown::before { content: "\\f146"; }
.qi-typhoon::before { content: "\\f147"; }
.qi-tornado::before { content: "\\f148"; }
.qi-rainstorm::before { content: "\\f149"; }
.qi-snow-storm::before { content: "\\f14a"; }
.qi-cold-wave::before { content: "\\f14b"; }
.qi-gale::before { content: "\\f14c"; }
.qi-sandstorm-warning::before { content: "\\f14d"; }
.qi-low-temperature-freeze::before { content: "\\f14e"; }
.qi-high-temperature::before { content: "\\f14f"; }
.qi-heat-wave::before { content: "\\f150"; }
.qi-dry-hot-wind::before { content: "\\f151"; }
.qi-downburst::before { content: "\\f152"; }
.qi-avalanche::before { content: "\\f153"; }
.qi-lightning::before { content: "\\f154"; }
.qi-hail::before { content: "\\f155"; }
.qi-frost::before { content: "\\f156"; }
.qi-heavy-fog-warning::before { content: "\\f157"; }
.qi-low-level-wind-shearl::before { content: "\\f158"; }
.qi-haze-warning::before { content: "\\f159"; }
.qi-thunder-gust::before { content: "\\f15a"; }
.qi-road-icing::before { content: "\\f15b"; }
.qi-drought::before { content: "\\f15c"; }
.qi-gale-at-sea::before { content: "\\f15d"; }
.qi-heat-stroke::before { content: "\\f15e"; }
.qi-wildfire::before { content: "\\f15f"; }
.qi-grassland-fire::before { content: "\\f160"; }
.qi-freeze::before { content: "\\f161"; }
.qi-space-weather::before { content: "\\f162"; }
.qi-heavy-air-pollution::before { content: "\\f163"; }
.qi-low-temperature-rain-and-snow::before { content: "\\f164"; }
.qi-strong-convection::before { content: "\\f165"; }
.qi-ozone::before { content: "\\f166"; }
.qi-heavy-snow-warning::before { content: "\\f167"; }
.qi-cold-warning::before { content: "\\f168"; }
.qi-continuous-rain::before { content: "\\f169"; }
.qi-waterlogging::before { content: "\\f16a"; }
.qi-geological-hazard::before { content: "\\f16b"; }
.qi-heavy-rainfall::before { content: "\\f16c"; }
.qi-severely-falling-temperature::before { content: "\\f16d"; }
.qi-snow-disaster::before { content: "\\f16e"; }
.qi-wildfire-grassland::before { content: "\\f16f"; }
.qi-medical-meteorology::before { content: "\\f170"; }
.qi-thunderstorm::before { content: "\\f171"; }
.qi-school-closure::before { content: "\\f172"; }
.qi-factory-closure::before { content: "\\f173"; }
.qi-maritime-risk::before { content: "\\f174"; }
.qi-spring-dust::before { content: "\\f175"; }
.qi-falling-temperature::before { content: "\\f176"; }
.qi-typhoon-and-rainstorm::before { content: "\\f177"; }
.qi-severe-cold::before { content: "\\f178"; }
.qi-sand-dust::before { content: "\\f179"; }
.qi-sea-thunderstorms::before { content: "\\f17a"; }
.qi-sea-fog::before { content: "\\f17b"; }
.qi-sea-thunder::before { content: "\\f17c"; }
.qi-sea-typhoon::before { content: "\\f17d"; }
.qi-low-temperature::before { content: "\\f17e"; }
.qi-road-ice-and-snow::before { content: "\\f17f"; }
.qi-thunderstorm-and-gale::before { content: "\\f180"; }
.qi-continuous-low-temperature::before { content: "\\f181"; }
.qi-low-visibility::before { content: "\\f182"; }
.qi-strong-dust::before { content: "\\f183"; }
.qi-gale-in-sea-area::before { content: "\\f184"; }
.qi-short-duration-heavy-shower-rain::before { content: "\\f185"; }
.qi-short-lived-heavy-shower-rain::before { content: "\\f186"; }
.qi-sea-area-fog::before { content: "\\f187"; }
.qi-heat-stroke-conditions::before { content: "\\f188"; }
.qi-heavy-pollution-weather::before { content: "\\f189"; }
.qi-co-poisoning-weather-conditions::before { content: "\\f18a"; }
.qi-respiratory-disease-weather-wonditions::before { content: "\\f18b"; }
.qi-intestinal-disease-weather-wonditions::before { content: "\\f18c"; }
.qi-cardiovascular-disease-weather-wonditions::before { content: "\\f18d"; }
.qi-flooding-weather-risk::before { content: "\\f18e"; }
.qi-heavy-pollution-weather-conditions::before { content: "\\f18f"; }
.qi-urban-flooding-weather-risk::before { content: "\\f190"; }
.qi-flooding-weather-risk-2::before { content: "\\f191"; }
.qi-wildfire-weather-risk::before { content: "\\f192"; }
.qi-meteorological-drought::before { content: "\\f193"; }
.qi-agricultural-weather-risk::before { content: "\\f194"; }
.qi-strong-monsoon::before { content: "\\f195"; }
.qi-ice-accretion-on-wire::before { content: "\\f196"; }
.qi-stroke-weather-risk::before { content: "\\f197"; }
.qi-wildfire-grassland-risk::before { content: "\\f198"; }
.qi-thunderstorm-and-strong-winds::before { content: "\\f199"; }
.qi-low-temperature-freeze2::before { content: "\\f19a"; }
.qi-low-temperature-damage::before { content: "\\f19b"; }
.qi-national-agricultural-meteorological-risk::before { content: "\\f19c"; }
.qi-dry-hot-wind-risk-for-winter-wheat::before { content: "\\f19d"; }
.qi-flood::before { content: "\\f2c5"; }
.qi-urban-flooding::before { content: "\\f2c6"; }
.qi-reservoir-danger::before { content: "\\f2c7"; }
.qi-dike-danger::before { content: "\\f2c8"; }
.qi-ice-flood::before { content: "\\f2c9"; }
.qi-waterlogging2::before { content: "\\f2ca"; }
.qi-flood-and-waterlogging::before { content: "\\f2cb"; }
.qi-dry-water::before { content: "\\f2cc"; }
.qi-flood-and-flash-flood-in-small-and-medium-rivers::before { content: "\\f2cd"; }
.qi-difficulty-drinking-water-for-rural-people-and-animals::before { content: "\\f2ce"; }
.qi-flood-in-small-and-medium-rivers::before { content: "\\f2cf"; }
.qi-flood-and-drought-advisory::before { content: "\\f2d0"; }
.qi-urban-flood-risk::before { content: "\\f2d1"; }
.qi-flash-flood::before { content: "\\f2d2"; }
.qi-agricultural-drought::before { content: "\\f2d3"; }
.qi-urban-water-shortage::before { content: "\\f2d4"; }
.qi-ecological-drought::before { content: "\\f2d5"; }
.qi-disaster-risk-early-warning::before { content: "\\f2d6"; }
.qi-flash-flood-weather-risk::before { content: "\\f2d7"; }
.qi-water-conservancy-and-drought::before { content: "\\f2d8"; }
.qi-landslide::before { content: "\\f2d9"; }
.qi-debris-flows::before { content: "\\f2da"; }
.qi-landslide-event::before { content: "\\f2db"; }
.qi-ground-collapses::before { content: "\\f2dc"; }
.qi-ground-fissure::before { content: "\\f2dd"; }
.qi-land-subsidence::before { content: "\\f2de"; }
.qi-volcanic-eruption::before { content: "\\f2df"; }
.qi-geological-hazard-weather-risk::before { content: "\\f2e0"; }
.qi-geological-hazard-weather::before { content: "\\f2e1"; }
.qi-geological-hazard2::before { content: "\\f2e2"; }
.qi-geological-hazard-risk::before { content: "\\f2e3"; }
.qi-air-pollution-incident::before { content: "\\f2f6"; }
.qi-heavy-air-pollution-2::before { content: "\\f2f7"; }
.qi-air-pollution::before { content: "\\f2f8"; }
.qi-heavy-pollution-weather-2::before { content: "\\f2f9"; }
.qi-very-hot-weather::before { content: "\\f1a1"; }
.qi-strong-monsoon-signal::before { content: "\\f1a2"; }
.qi-landslip::before { content: "\\f1a3"; }
.qi-tropical-cyclone::before { content: "\\f1a4"; }
.qi-fire-danger::before { content: "\\f1a5"; }
.qi-flooding-in-the-northern-new-territories::before { content: "\\f1a6"; }
.qi-cold-weather::before { content: "\\f1a7"; }
.qi-thunderstorm2::before { content: "\\f20c"; }
.qi-rainstorm2::before { content: "\\f20d"; }
.qi-frost2::before { content: "\\f20e"; }
.qi-cold-surge-advisory::before { content: "\\f1a8"; }
.qi-strong-wind-advisory::before { content: "\\f1a9"; }
.qi-rainfall-advisory::before { content: "\\f1aa"; }
.qi-strong-monsoon-signal2::before { content: "\\f20f"; }
.qi-storm-surge2::before { content: "\\f210"; }
.qi-tropical-cyclone2::before { content: "\\f211"; }
.qi-rainstorm3::before { content: "\\f212"; }
.qi-thunderstorm3::before { content: "\\f213"; }
.qi-wind-warning::before { content: "\\f1ab"; }
.qi-snow-ice::before { content: "\\f1ac"; }
.qi-fog::before { content: "\\f1ad"; }
.qi-coastal-event::before { content: "\\f1ae"; }
.qi-forest-fire::before { content: "\\f1af"; }
.qi-rain-warning::before { content: "\\f1b0"; }
.qi-rain-flood::before { content: "\\f1b1"; }
.qi-thunderstorm4::before { content: "\\f214"; }
.qi-high-temperature2::before { content: "\\f215"; }
.qi-low-temperature2::before { content: "\\f216"; }
.qi-avalanches::before { content: "\\f217"; }
.qi-flooding::before { content: "\\f218"; }
.qi-rain-warning2::before { content: "\\f250"; }
.qi-wind::before { content: "\\f21a"; }
.qi-snow-warning::before { content: "\\f1c7"; }
.qi-zonda-wind::before { content: "\\f1c8"; }
.qi-storm-warning::before { content: "\\f1c9"; }
.qi-dust-raising-winds2::before { content: "\\f21b"; }
.qi-strong-surface-winds2::before { content: "\\f21c"; }
.qi-hot-day2::before { content: "\\f21d"; }
.qi-warm-night2::before { content: "\\f21e"; }
.qi-cold-day2::before { content: "\\f21f"; }
.qi-thunderstorm-and-lightning2::before { content: "\\f220"; }
.qi-hailstorm2::before { content: "\\f221"; }
.qi-sea-area-warning2::before { content: "\\f222"; }
.qi-fishermen-warning2::before { content: "\\f223"; }
.qi-heavy-snow-warning2::before { content: "\\f243"; }
.qi-dust-storm::before { content: "\\f225"; }
.qi-heat-wave2::before { content: "\\f226"; }
.qi-cold-wave2::before { content: "\\f227"; }
.qi-fog2::before { content: "\\f228"; }
.qi-heavy-rain-warning::before { content: "\\f229"; }
.qi-ground-frost2::before { content: "\\f22a"; }
.qi-fog3::before { content: "\\f22b"; }
.qi-thunder-rain2::before { content: "\\f22c"; }
.qi-thunder-storm::before { content: "\\f22d"; }
.qi-light-rain-warning::before { content: "\\f22e"; }
.qi-heavy-rain-warning2::before { content: "\\f22f"; }
.qi-fresh-wind::before { content: "\\f230"; }
.qi-thunderstorm-and-dust::before { content: "\\f231"; }
.qi-dust-warning::before { content: "\\f232"; }
.qi-high-wave::before { content: "\\f233"; }
.qi-frost3::before { content: "\\f234"; }
.qi-drop-in-visibility::before { content: "\\f235"; }
.qi-low-humidity2::before { content: "\\f236"; }
.qi-accumulated-rain2::before { content: "\\f237"; }
.qi-cold-wave3::before { content: "\\f238"; }
.qi-tornado2::before { content: "\\f239"; }
.qi-thunderstorm5::before { content: "\\f23a"; }
.qi-hail2::before { content: "\\f23b"; }
.qi-heavy-rainfall2::before { content: "\\f23c"; }
.qi-gale2::before { content: "\\f23d"; }
.qi-heat-wave3::before { content: "\\f23e"; }
.qi-cold-warning2::before { content: "\\f23f"; }
.qi-frost4::before { content: "\\f240"; }
.qi-drought2::before { content: "\\f241"; }
.qi-forest-fire2::before { content: "\\f242"; }
.qi-severely-falling-temperature2::before { content: "\\f244"; }
.qi-rainstorm4::before { content: "\\f245"; }
.qi-wind2::before { content: "\\f246"; }
.qi-snow-ice2::before { content: "\\f247"; }
.qi-freeze2::before { content: "\\f248"; }
.qi-thunderstorms::before { content: "\\f249"; }
.qi-fog4::before { content: "\\f24a"; }
.qi-high-temperature3::before { content: "\\f24b"; }
.qi-low-temperature3::before { content: "\\f24c"; }
.qi-coastal-event2::before { content: "\\f24d"; }
.qi-forest-fire3::before { content: "\\f24e"; }
.qi-avalanches2::before { content: "\\f24f"; }
.qi-flood2::before { content: "\\f251"; }
.qi-rain-flood2::before { content: "\\f252"; }
.qi-mudflow2::before { content: "\\f253"; }
.qi-duststorm-warning::before { content: "\\f254"; }
.qi-freezing-rain-and-icing::before { content: "\\f255"; }
.qi-other-dangers::before { content: "\\f256"; }
.qi-severe-thunderstorms::before { content: "\\f257"; }
.qi-damaging-winds2::before { content: "\\f258"; }
.qi-veld-fire-conditions2::before { content: "\\f259"; }
.qi-weather-advisory2::before { content: "\\f25a"; }
.qi-thunderstorm6::before { content: "\\f2e4"; }
.qi-squall::before { content: "\\f2e5"; }
.qi-air-quality::before { content: "\\f2e6"; }
.qi-rainfall::before { content: "\\f2e7"; }
.qi-fog5::before { content: "\\f2e8"; }
.qi-heat::before { content: "\\f2e9"; }
.qi-wildfire2::before { content: "\\f2ea"; }
.qi-wind3::before { content: "\\f2eb"; }
.qi-freezing-rain-warning::before { content: "\\f2ec"; }
.qi-tornado3::before { content: "\\f2ed"; }
.qi-blizzard::before { content: "\\f2ee"; }
.qi-weather-warning::before { content: "\\f2ef"; }
.qi-winter-storm::before { content: "\\f2f0"; }
.qi-freezing-drizzle::before { content: "\\f2f1"; }
.qi-snowfall::before { content: "\\f2f2"; }
.qi-blowing-snow::before { content: "\\f2f3"; }
.qi-extreme-cold::before { content: "\\f2f4"; }
.qi-frost5::before { content: "\\f2f5"; }
.qi-hazardous-seas-warning::before { content: "\\f25b"; }
.qi-heavy-freezing-spray-warning::before { content: "\\f25c"; }
.qi-red-flag-warning::before { content: "\\f25d"; }
.qi-freeze-warning::before { content: "\\f25e"; }
.qi-hard-freeze-warning::before { content: "\\f25f"; }
.qi-extreme-cold-warning::before { content: "\\f260"; }
.qi-wind-chill-warning::before { content: "\\f261"; }
.qi-gale-warning::before { content: "\\f262"; }
.qi-excessive-heat-warning::before { content: "\\f263"; }
.qi-lake-effect-snow-warning::before { content: "\\f264"; }
.qi-blowing-dust-warning::before { content: "\\f265"; }
.qi-dust-storm-warning::before { content: "\\f266"; }
.qi-storm-warning2::before { content: "\\f267"; }
.qi-tropical-storm-warning::before { content: "\\f268"; }
.qi-high-wind-warning::before { content: "\\f269"; }
.qi-high-surf-warning::before { content: "\\f26a"; }
.qi-flood-warning::before { content: "\\f26b"; }
.qi-lakeshore-flood-warning::before { content: "\\f26c"; }
.qi-coastal-flood-warning::before { content: "\\f26d"; }
.qi-ashfall-warning::before { content: "\\f26e"; }
.qi-volcano-warning::before { content: "\\f26f"; }
.qi-earthquake-warning::before { content: "\\f270"; }
.qi-avalanche-warning::before { content: "\\f271"; }
.qi-winter-storm-warning::before { content: "\\f272"; }
.qi-ice-storm-warning::before { content: "\\f273"; }
.qi-snow-squall-warning::before { content: "\\f274"; }
.qi-blizzard-warning::before { content: "\\f275"; }
.qi-special-marine-warning::before { content: "\\f276"; }
.qi-typhoon-warning::before { content: "\\f277"; }
.qi-hurricane-warning::before { content: "\\f278"; }
.qi-hurricane-force-wind-warning::before { content: "\\f279"; }
.qi-storm-surge-warning::before { content: "\\f27a"; }
.qi-flash-flood-warning::before { content: "\\f27b"; }
.qi-severe-thunderstorm-warning::before { content: "\\f27c"; }
.qi-extreme-wind-warning::before { content: "\\f27d"; }
.qi-tornado-warning::before { content: "\\f27e"; }
.qi-tsunami-warning::before { content: "\\f27f"; }
.qi-fire-weather-watch::before { content: "\\f280"; }
.qi-freeze-watch::before { content: "\\f281"; }
.qi-hard-freeze-watch::before { content: "\\f282"; }
.qi-wind-chill-watch::before { content: "\\f283"; }
.qi-extreme-cold-watch::before { content: "\\f284"; }
.qi-excessive-heat-watch::before { content: "\\f285"; }
.qi-high-wind-watch::before { content: "\\f286"; }
.qi-flood-watch::before { content: "\\f287"; }
.qi-lakeshore-flood-watch::before { content: "\\f288"; }
.qi-coastal-flood-watch::before { content: "\\f289"; }
.qi-heavy-freezing-spray-watch::before { content: "\\f28a"; }
.qi-hazardous-seas-watch::before { content: "\\f28b"; }
.qi-winter-storm-watch::before { content: "\\f28c"; }
.qi-gale-watch::before { content: "\\f28d"; }
.qi-avalanche-watch::before { content: "\\f28e"; }
.qi-storm-watch::before { content: "\\f28f"; }
.qi-tropical-storm-watch::before { content: "\\f290"; }
.qi-typhoon-watch::before { content: "\\f291"; }
.qi-hurricane-force-wind-watch::before { content: "\\f292"; }
.qi-hurricane-watch::before { content: "\\f293"; }
.qi-storm-surge-watch::before { content: "\\f294"; }
.qi-flash-flood-watch::before { content: "\\f295"; }
.qi-severe-thunderstorm-watch::before { content: "\\f296"; }
.qi-tornado-watch::before { content: "\\f297"; }
.qi-tsunami-watch::before { content: "\\f298"; }
.qi-air-stagnation-advisory::before { content: "\\f299"; }
.qi-low-water-advisory::before { content: "\\f29a"; }
.qi-freezing-spray-advisory::before { content: "\\f29b"; }
.qi-freezing-fog-advisory::before { content: "\\f29c"; }
.qi-ashfall-advisory::before { content: "\\f29d"; }
.qi-frost-advisory::before { content: "\\f29e"; }
.qi-wind-advisory::before { content: "\\f29f"; }
.qi-lake-wind-advisory::before { content: "\\f2a0"; }
.qi-blowing-dust-advisory::before { content: "\\f2a1"; }
.qi-dust-advisory::before { content: "\\f2a2"; }
.qi-brisk-wind-advisory::before { content: "\\f2a3"; }
.qi-small-craft-advisory::before { content: "\\f2a4"; }
.qi-small-craft-advisory-for-winds::before { content: "\\f2a5"; }
.qi-small-craft-advisory-for-rough-bar::before { content: "\\f2a6"; }
.qi-small-craft-advisory-for-hazardous-seas::before { content: "\\f2a7"; }
.qi-dense-smoke-advisory::before { content: "\\f2a8"; }
.qi-dense-fog-advisory::before { content: "\\f2a9"; }
.qi-high-surf-advisory::before { content: "\\f2aa"; }
.qi-coastal-flood-advisory::before { content: "\\f2ab"; }
.qi-lakeshore-flood-advisory::before { content: "\\f2ac"; }
.qi-hydrologic-advisory::before { content: "\\f2ad"; }
.qi-flood-advisory::before { content: "\\f2ae"; }
.qi-heat-advisory::before { content: "\\f2af"; }
.qi-wind-chill-advisory::before { content: "\\f2b0"; }
.qi-winter-weather-advisory::before { content: "\\f2b1"; }
.qi-avalanche-advisory::before { content: "\\f2b2"; }
.qi-tsunami-advisory::before { content: "\\f2b3"; }
.qi-flood-statement::before { content: "\\f2b4"; }
.qi-hydrologic-outlook::before { content: "\\f2b5"; }
.qi-hazardous-weather-outlook::before { content: "\\f2b6"; }
.qi-air-quality-alert::before { content: "\\f2b7"; }
.qi-extreme-fire-danger::before { content: "\\f2b8"; }
.qi-marine-weather-statement::before { content: "\\f2b9"; }
.qi-special-weather-statement::before { content: "\\f2ba"; }
.qi-lakeshore-flood-statement::before { content: "\\f2bb"; }
.qi-coastal-flood-statement::before { content: "\\f2bc"; }
.qi-beach-hazards-statement::before { content: "\\f2bd"; }
.qi-rip-current-statement::before { content: "\\f2be"; }
.qi-tropical-depression-local-statement::before { content: "\\f2bf"; }
.qi-tropical-storm-local-statement::before { content: "\\f2c0"; }
.qi-typhoon-local-statement::before { content: "\\f2c1"; }
.qi-hurricane-local-statement::before { content: "\\f2c2"; }
.qi-severe-weather-statement::before { content: "\\f2c3"; }
.qi-flash-flood-statement::before { content: "\\f2c4"; }
.qi-severe-weather-warning::before { content: "\\f1ca"; }
.qi-warning-default::before { content: "\\f1cb"; }
.qi-sunny-fill::before { content: "\\f1cc"; }
.qi-cloudy-fill::before { content: "\\f1cd"; }
.qi-few-clouds-fill::before { content: "\\f1ce"; }
.qi-partly-cloudy-fill::before { content: "\\f1cf"; }
.qi-overcast-fill::before { content: "\\f1d0"; }
.qi-clear-night-fill::before { content: "\\f1d1"; }
.qi-cloudy-night-fill::before { content: "\\f1d2"; }
.qi-few-clouds-night-fill::before { content: "\\f1d3"; }
.qi-partly-cloudy-night-fill::before { content: "\\f1d4"; }
.qi-shower-rain-fill::before { content: "\\f1d5"; }
.qi-heavy-shower-rain-fill::before { content: "\\f1d6"; }
.qi-thundershower-fill::before { content: "\\f1d7"; }
.qi-heavy-thunderstorm-fill::before { content: "\\f1d8"; }
.qi-thundershower-with-hail-fill::before { content: "\\f1d9"; }
.qi-light-rain-fill::before { content: "\\f1da"; }
.qi-moderate-rain-fill::before { content: "\\f1db"; }
.qi-heavy-rain-fill::before { content: "\\f1dc"; }
.qi-extreme-rain-fill::before { content: "\\f1dd"; }
.qi-drizzle-rain-fill::before { content: "\\f1de"; }
.qi-storm-fill::before { content: "\\f1df"; }
.qi-heavy-storm-fill::before { content: "\\f1e0"; }
.qi-severe-storm-fill::before { content: "\\f1e1"; }
.qi-freezing-rain-fill::before { content: "\\f1e2"; }
.qi-light-to-moderate-rain-fill::before { content: "\\f1e3"; }
.qi-moderate-to-heavy-rain-fill::before { content: "\\f1e4"; }
.qi-heavy-rain-to-storm-fill::before { content: "\\f1e5"; }
.qi-storm-to-heavy-storm-fill::before { content: "\\f1e6"; }
.qi-heavy-to-severe-storm-fill::before { content: "\\f1e7"; }
.qi-shower-rain-night-fill::before { content: "\\f1e8"; }
.qi-heavy-shower-rain-night-fill::before { content: "\\f1e9"; }
.qi-rain-fill::before { content: "\\f1ea"; }
.qi-light-snow-fill::before { content: "\\f1eb"; }
.qi-moderate-snow-fill::before { content: "\\f1ec"; }
.qi-heavy-snow-fill::before { content: "\\f1ed"; }
.qi-snowstorm-fill::before { content: "\\f1ee"; }
.qi-sleet-fill::before { content: "\\f1ef"; }
.qi-rain-and-snow-fill::before { content: "\\f1f0"; }
.qi-shower-snow-fill::before { content: "\\f1f1"; }
.qi-snow-flurry-fill::before { content: "\\f1f2"; }
.qi-light-to-moderate-snow-fill::before { content: "\\f1f3"; }
.qi-moderate-to-heavy-snow-fill::before { content: "\\f1f4"; }
.qi-heavy-snow-to-snowstorm-fill::before { content: "\\f1f5"; }
.qi-shower-snow-night-fill::before { content: "\\f1f6"; }
.qi-snow-flurry-night-fill::before { content: "\\f1f7"; }
.qi-snow-fill::before { content: "\\f1f8"; }
.qi-mist-fill::before { content: "\\f1f9"; }
.qi-foggy-fill::before { content: "\\f1fa"; }
.qi-haze-fill::before { content: "\\f1fb"; }
.qi-sand-fill::before { content: "\\f1fc"; }
.qi-dust-fill::before { content: "\\f1fd"; }
.qi-duststorm-fill::before { content: "\\f1fe"; }
.qi-sandstorm-fill::before { content: "\\f1ff"; }
.qi-dense-fog-fill::before { content: "\\f200"; }
.qi-strong-fog-fill::before { content: "\\f201"; }
.qi-moderate-haze-fill::before { content: "\\f202"; }
.qi-heavy-haze-fill::before { content: "\\f203"; }
.qi-severe-haze-fill::before { content: "\\f204"; }
.qi-heavy-fog-fill::before { content: "\\f205"; }
.qi-extra-heavy-fog-fill::before { content: "\\f206"; }
.qi-hot-fill::before { content: "\\f207"; }
.qi-cold-fill::before { content: "\\f208"; }
.qi-unknown-fill::before { content: "\\f209"; }

         </style>
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         
         <style>
         * {
            padding: 0;
            margin: 0;
         }
         body{
           position:absolute;
         }
         .nei{
           float: left;
           box-shadow: 3px 3px 3px #666666;
           width: 50%;
           min-width: 400px;
           height:100%;
           display:flex;
           flex-direction: column;
           justify-content: space-between;
           border-radius:10px 10px 10px 10px;
           border:1px solid #a1a1a1;
           background: rgba(255, 255, 255, 0.5);
           z-index:1;
           position:absolute;
         }
         p {
           color : rgba(0,0,0, 0.6);
           font-size:1.5rem;
           padding: 2px; 
           word-wrap: break-word;
           white-space: pre-wrap;
         }
         .centered-content {
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           margin: 0 1rem 0 1rem;
           height: 100%;
         }
         .tu{
          float: left;
           border:1px solid #000000;
           max-width: 1024px
         }
         img{
            border:1px solid #000000;
            border-radius:10px 10px 10px 10px;
         }
         </style>
         </head>
         <body>
         <div class="tu">
             <img src ="${imageUrl}" height=1024px>
         </div>
         <div class="nei">
           <div class="centered-content">
            <br>
            <h2 style="font-weight:bolder; font-size: 2.2em;">${datatime} ${dayOfWeek} ${name}</h2>
            <br>
            <i style="font-size: 3em;" class="qi-${iconDays[0]}"> / <i class="qi-${iconNights[0]}"></i></i>
             <p style="font-weight:bolder; font-size: 2em; line-height:"150%">${forecastresult[0]}</p>
             <br>
             <p>${output}</p>
           </div>
           <br>
           <p style="font-weight: bold; margin-bottom: 20px; text-align: center;">Create By 鸢尾花插件 </p>
         </div>
         </body>
         </html>
         `

    await page.setContent(Html)
    // 获取图片元素
    const imgElement = await page.$('.tu img')
    // 对图片元素进行截图
    const image = await imgElement.screenshot()

    return image
  } catch (error) {
    logger.error(error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

async function getCityGeo (city, WeatherKey) {
  const cityGeo = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${WeatherKey}`
  const cityGeoresponse = await fetch(cityGeo)
  const data = await cityGeoresponse.json()
  if (data.code !== '200') {
    logger.info('未获取到城市id')
    return false
  }
  const location = data.location[0].id
  const name = data.location[0].name

  return { location, name }
}

async function getForecast (location, WeatherKey) {
  const forecast = `https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${WeatherKey}`
  const forecastresponse = await fetch(forecast)
  const forecastdata = await forecastresponse.json()

  // 创建一个空数组来存储结果
  const forecastresult = []
  const iconDays = []
  const iconNights = []

  // 遍历 forecastdata.daily 数组
  for (const item of forecastdata.daily) {
    const tempMax = item.tempMax // 获取 tempMax 属性
    const tempMin = item.tempMin // 获取 tempMin 属性
    const windScaleDay = item.windScaleDay // 获取 windScaleDay 属性
    const windScaleNight = item.windScaleNight // 获取 windScaleNight 属性
    // 定义一个函数来计算中位数
    function getMedian (scale) {
      let numbers = scale.split('-').map(Number) // 分割字符串并转换为数字
      return Math.round((numbers[0] + numbers[1]) / 2) // 计算平均值并四舍五入
    }

    let medianWindScaleDay = getMedian(windScaleDay)
    let medianWindScaleNight = getMedian(windScaleNight)
    // const precip = item.precip; // 获取 precip 属性
    // const uvIndex = item.uvIndex; // 获取 uvIndex 属性
    // const humidity = item.humidity; // 获取 humidity 属性
    const iconDay = item.iconDay // 获取 humidity 属性
    const iconNight = item.iconNight // 获取 humidity 属性

    const output = `气温：${tempMin}°C/${tempMax}°C\n风力：${medianWindScaleDay}级/${medianWindScaleNight}级\n`
    // 创建模板字符串
    // const output = `气温：${tempMin}°C/${tempMax}°C\n风力：${windScaleDay}/${windScaleNight}\n降水量：${precip}\n紫外线指数：${uvIndex} \n湿度：${humidity}%\n`;

    // 将模板字符串添加到 forecastresult 数组
    forecastresult.push(output)
    iconDays.push(iconDay)
    iconNights.push(iconNight)
  }

  return { forecastresult, iconDays, iconNights }
}


async function getIndices (location, WeatherKey) {
  const indices = `https://devapi.qweather.com/v7/indices/1d?type=1,3,5,9,11,14,15,16&location=${location}&key=${WeatherKey}`
  const indicesresponse = await fetch(indices)
  const indicesdata = await indicesresponse.json()

  // 创建一个空数组来存储结果
  const result = []

  // 遍历 forecastdata.daily 数组
  for (const item of indicesdata.daily) {
    const name = item.name // 获取 name 属性
    const text = item.text // 获取 text 属性
    const level = parseInt(item.level) // 获取 level 属性并转换为整数
    const romanLevel = NumToRoman(level) // 将 level 转换为罗马数字

    // 检查 level 是否大于或等于3
    if (level >= 3) {
      // 如果 level 大于或等于3，将 name 和 text 添加到 result 数组
      result.push(`<span style="font-size: 1.2em; font-weight: bolder">${name}(${romanLevel})</span>：${text}`)
    }
  }
  // 使用换行符连接 result 数组的所有元素
  const output = result.join('\n\n')
  return output
}


