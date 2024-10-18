# 鸢尾花插件(logier-plugin)

<div align="center">
  <a href="https://logier.gitee.io/">
    <img src="./resources/img/logo.png" alt="Logo" height="120">
  </a>
<br>

 [![Group](https://img.shields.io/badge/QQ-blue?style=flat&labelColor=white&logo=tencentqq&logoColor=black)](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY) &nbsp; [![Group](https://img.shields.io/badge/博客-blue?style=flat&labelColor=white&logo=hexo&logoColor=black)](https://logier.gitee.io/) &nbsp;[![Group](https://img.shields.io/badge/表情包仓库-blue?style=flat&labelColor=white&logo=data:image/png;base64,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&logoColor=black)](https://gitee.com/logier/emojihub/) &nbsp; <a href='https://gitee.com/logier/logier-plugins/stargazers'><img src='https://gitee.com/logier/logier-plugins/badge/star.svg?theme=dark' alt='star'></img></a> &nbsp; [![爱发电](https://img.shields.io/badge/爱发电-blue?style=flat&labelColor=white&logo=data:image/png;base64,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&logoColor=black)](https://afdian.net/a/logier)

 <img src="https://count.getloli.com/get/@:logier?theme=moebooru-h" alt=":logier" />
</div>



***如果发现bug，希望及时Q群告知我或提交issue***
***如果喜欢本插件，就点点star吧***

## 更新日志 💡

### **24.08.16 添加自定义摸鱼日历和今日新闻api**
### **24.02.26 更新潜伏模板，群聊中收到消息后概率GPT回复并发送表情包，对俗手哥拙劣的模仿**
### **24.02.23 破坏性更新，修复了更新后配置项丢失的问题，以及启动插件缺失yaml文件的问题，更新后需要重新配置，谨慎更新**

## 安装教程 ✨


Yunzai-Bot目录下执行(二者选其一)

gitee
```
git clone --depth=1 https://gitee.com/logier/logier-plugins.git ./plugins/logier-plugin/
```
github
```
git clone --depth=1 https://github.com/logier/logier-plugins.git ./plugins/logier-plugin/
```

## 插件功能 👓

- 发送 **#鸢尾花帮助** 获取插件详细信息

- 推荐使用[锅巴插件](https://gitee.com/guoba-yunzai/guoba-plugin)进行配置

<br>



| 名称 | 指令 | 名称 | 指令 |
|:-------:|:------:|:-------:|:------:|
| 表情包仓库 | #表情包 | 表情包小偷 | 发送消息随机触发 |
| 戳一戳表情 | 戳一戳触发 | 保存表情包 | #存(表情\|涩图) <br> #查看(表情包\|涩图)+序号？<br> #删除(表情包\|涩图)+序号  | 
| 定时发图 | 定时推送 | 摸鱼日历 | 定时推送 | 
| 今日新闻 | 定时推送 | 城市天气 | 定时推送 |  
| 今日运势 | #今日运势 #悔签 | cp生成器 | #今日cp | 
| 算一卦 | #算卦 #悔卦 | 塔罗牌 | #塔罗牌 #占卜 #彩虹塔罗牌 | 
| 签到 | #签到 | 番剧 | #今日番剧 |
| 自定义图片api | 自定义指令 | 进退群通知 | 进退群触发 | 
| 问候回复 |  打招呼触发 <br> 例如早安、晚安 | 发送消息随机触发| 潜伏模板|


### 表情包系列
