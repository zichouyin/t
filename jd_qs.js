/*
#完美礼遇 情书传情
6  9,12 * * * */
const $ = new Env('完美礼遇 情书传情');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let senduseridList = []
let sendidList = []

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = `https://api.m.jd.com/client.action`;
!(async () => {
        if (!cookiesArr[0]) {
            $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
                "open-url": "https://bean.m.jd.com/"
            });
            return;
        }
        for (let i = 0; i < cookiesArr.length; i++) {
            cookie = cookiesArr[i];
            if (cookie) {
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                $.Authorization = "Bearer undefined"
                console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
                if (!$.isLogin) {
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\n`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
                    if ($.isNode()) {
                        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    }
                    continue
                }
                await genToken()
                authres = await taskPostUrl("authorized_to_log_in", {
                    "token": $.token,
                    "source": "01"
                })
                $.Authorization = `Bearer ${authres.access_token}`
                user = await taskUrl("get_user_info", "")
                console.log(`昵称：${user.nickname}\n剩余抽奖次数：${user.lottery_number}`)
                taskList = await taskUrl("task_state", "")
                productList = await taskUrl("task_info", "")
                for (var o in taskList) {
                    switch (o) {
                        case "view_shop": //关注浏览店铺
                            console.log("浏览店铺：")
                            console.log(`  今日已浏览${taskList[o].length}个商品`)
                            //if (taskList[o].length < 12) {
                            if (taskList[o].length < productList.shops.length) {
                                shopList = productList.shops.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (shop of shopList) {
                                    console.log(`  去浏览${shop.name} `)
                                    console.log(`  等待3秒 `)
                                    await $.wait(3000);
                                    await taskUrl("shop_view", `?shop_id=${shop.id}`)
                                }
                            }
                            await $.wait(3000);
                            break
                        case "view_meetingplace": //浏览会场
                            console.log("浏览会场：")
                            console.log(`  今日已浏览${taskList[o].length}会场`)
                            //if (taskList[o].length < 15) {
                            if (taskList[o].length < productList.meetingplaces.length) {
                                meetingList = productList.meetingplaces.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (meetingplace of meetingList) {
                                    console.log(`  去浏览${meetingplace.name} `)
                                    console.log(`  等待3秒 `)
                                    await $.wait(3000);
                                    await taskUrl("meetingplace_view", `?meetingplace_id=${meetingplace.id}`)
                                }
                            }
                            await $.wait(3000);
                            break
                        case "open_card":
                            console.log("不做开卡")
                            //if (taskList[o] == "1") console.log("  开卡")
                            //else {
                            //    console.log("  开卡")
                            //    await taskUrl(o, "")
                            //}
                            break
                        case "view_product": //浏览商品/加购
                            console.log("浏览商品：")
                            console.log(`  今日已浏览${taskList[o].length}个商品`)
                            //if (taskList[o].length != 12) {
                            if (taskList[o].length < productList.prodcuts.length) {
                                pList = productList.prodcuts.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (product of pList) {
                                    console.log(`  去浏览${product.name} `)
                                    console.log(`  等待3秒 `)
                                    await $.wait(3000);
                                    await taskUrl("product_view", `?product_id=${product.id}`)
                                }
                            }
                            await $.wait(3000);
                            break
                        
                        case "channel_view": //关注浏览频道
                            console.log("浏览频道：")
                            console.log(`  今日已浏览${taskList[o].length}个频道`)
                            //if (taskList[o].length < 1) {
                            if (taskList[o].length < productList.channel.length) {
                                shopList = productList.channel.filter(x => taskList[o].indexOf(x.id) == "-1")
                                for (shop of shopList) {
                                    console.log(`  去浏览${shop.name} `)
                                    console.log(`  等待3秒 `)
                                    await $.wait(3000);
                                    await taskUrl("fertilizer_chanel_view", `?channel_id=${shop.id}`)
                                }
                            }
                            await $.wait(3000);
                            break
                        
                        case "friend": //邀请
                            console.log("邀请好友查看情书：")
                            console.log(`  已邀请${taskList[o].length}个小伙伴查看情书`)
                            if (taskList[o].length == 5)
                            {
                                console.log(`  此账号助力已满`)
                            }
                            else
                            {
                                for (k=0;k<5;k++)
                                {
                                    sendinfo = await taskPostUrlwriteLetter("send_love_letter", `?title=%E4%BD%A0%E5%A5%BD&content=%E4%BD%A0%E5%A5%BD&footer=%E4%BD%A0%E5%A5%BD`)
                                    sendidList.push(sendinfo.send_id)
                                    await $.wait(3000);
                                }
                                senduseridList.push(sendinfo.send_user_id)
                                console.log(`  等待3秒 user_id`,sendinfo.send_user_id)
                            }
                            await $.wait(3000);
                            break
                        default:
                            break
                    }
                }
            }
        }
        
        for (let i = 0; i < cookiesArr.length; i++) {
            cookie = cookiesArr[i];
            await genToken()
            authres = await taskPostUrl("authorized_to_log_in", {
                "token": $.token,
                "source": "01"
            })
            $.Authorization = `Bearer ${authres.access_token}`
            for (p = 0; p < senduseridList.length; p++) {
                if (p == i)
                {
                    console.log("不能查看自己发的情书，继续查看下一个人的情书")
                    continue
                }
                console.log(`账号${i+1}去助力user_id ${senduseridList[p]}`)
                let results = await taskPostUrlwriteLetter("accept_love_letter", `?send_user_id=${senduseridList[p]}&send_id=${sendidList[p*5]}`)
                //console.log(results)
                if(results.send_info == '')
                {
                    if(results.msg == '今天您已经看过TA的情书')
                    {
                        console.log("今天您已经看过TA的情书，继续查看下一个人的情书")
                        continue
                    }
                    if(results.msg == '情书已被人抢先一步查看')
                    {
                        console.log("情书已被人抢先一步查看，继续查看这个人的下一份情书")
                        for (q=1;q<5;q++)
                        {
                            let nextResult = await taskPostUrlwriteLetter("accept_love_letter", `?send_user_id=${senduseridList[p]}&send_id=${sendidList[p*5+q]}`)
                            if (nextResult.send_info != '')
                            {
                                console.log("助力成功")
                                break
                            }
                            else
                            {
                                console.log("助力失败或此人助力已满",results)
                            }
                            await $.wait(3000);
                        }
                        continue
                    }
                    else
                    {
                        console.log("不能查看自己发出的情书或发生了其他异常")
                        break
                    }
                }
                else
                {
                    console.log("助力成功")
                }
                console.log(`  等待3秒 `)
                await $.wait(3000);
            }
            await $.wait(3000);
        }
        
        for (let i = 0; i < cookiesArr.length; i++) {
            cookie = cookiesArr[i];
            await genToken()
            authres = await taskPostUrl("authorized_to_log_in", {
                "token": $.token,
                "source": "01"
            })
            $.Authorization = `Bearer ${authres.access_token}`
            user = await taskUrl("get_user_info", "")
            console.log(`昵称：${user.nickname}\n剩余抽奖次数：${user.lottery_number}`)
            console.log("去抽奖")
            user = await taskUrl("get_user_info", "")
            console.log(`昵称：${user.nickname}\n剩余抽奖次数：${user.lottery_number}`)
            for (t = 0; t < user.lottery_number; t++) {
                let lotteryes = await taskPostUrl("lottery", "")
                //console.log(lotteryes)
                if (lotteryes.prize)
                {
                    if (lotteryes.prize.id == 0 && lotteryes.prize.type == 0 )
                    {
                        console.log("恭喜您获得了空气")
                    }
                    else
                    {
                        console.log(`恭喜你获得 ${lotteryes.prize.name}`)
                    }
                }
                else 
                {
                    console.log("恭喜您获得了空气")
                }
                console.log(`  等待3秒 `)
                await $.wait(3000);
            }
            await $.wait(3000);
        }
    })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息

//genToken
function genToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.8&build=89053&client=android&d_brand=HUAWEI&d_model=FRD-AL10&osVersion=8.0.0&screen=1792*1080&partner=huawei&oaid=7afefff5-fffe-40ee-f3de-ffe2ff2fe001&eid=eidAe19a8122a1s2xg+0aWybTLCCATsD6oJbEcYPteQMa3ttkXFlkcAdMo+uVF++BjcBVVNjMkIoFnW2bzHDBnLN0aukEYW72btJTe2aQ4xqyuZqRExl&sdkVersion=26&lang=zh_CN&uuid=5f3a6b660a7d29be&aid=5f3a6b660a7d29be&area=27_2442_2444_31912&networkType=4g&wifiBssid=unknown&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJNuUBMiXpghp5mwBH3zhv1rOuSPEwsLjdPic0zNM6Lj6PpFnIuEOquU1jRYinqzNTeY4975Q%2BY0bAj1wlPztJiG9oagIGX5VE2sOe5rDgMdLlMkXFRaAAR9poPzL4f6KOaDmmcpTJFuB%2BkHswe5crq3X4UvjWD8PmvNm8KpDaQmvW6sbcOUE7Vw%3D%3D&uemps=0-0&harmonyOs=0&st=1626874286410&sign=c1bbfde69bd0d06fc19db58dff7291f5&sv=102',
        body: 'body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fxinrui2-isv.isvjcloud.com%22%7D&',
        headers: {
            'Host': 'api.m.jd.com',
            'accept': '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    $.token = data['token']
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function taskUrl(url, data) {
    let body = {
        url: `https://xinrui2-isv.isvjcloud.com/api/${url}${data}`,
        headers: {
            'Host': 'xinrui2-isv.isvjcloud.com',
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'com.jingdong.app.mall',
            "Authorization": $.Authorization,
            'Referer': 'https://xinrui2-isv.isvjcloud.com/beauty-christmas2021/?channel=dingzhihuichang&tttparams=s68wA2YFeyJnTGF0IjoiMzYuMTc1NTkiLCJnTG5nIjoiMTE3LjA4MDciLCJncHNfYXJlYSI6IjBfMF8wXzAiLCJsYXQiOjAsImxuZyI6MCwibW9kZWwiOiJSZWRtaSBLMzAgUHJvIFpvb20gRWRpdGlvbiIsInByc3RhdGUiOiIwIiwidW5fYXJlYSI6IjEzXzExMTJfNDY2NjVfNDY2OTkifQ8%3D%3D&sid=43cf43ef70215d3e0690f1e1b13b5d6w&un_area=13_1112_46665_46699',
            'user-agent': 'jdapp;android;10.2.6;;;appBuild/91563;ef/1;ep/%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1639443614479%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22sv%22%3A%22CJO%3D%22%2C%22ad%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%2C%22od%22%3A%22CWTvENLtCWVvDtK1CJc0EK%3D%3D%22%2C%22ov%22%3A%22CzK%3D%22%2C%22ud%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Redmi K30 Pro Zoom Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045735 Mobile Safari/537.36',
            //     'content-type': 'application/x-www-form-urlencoded',
            //     'Cookie': `${cookie} ;`,
        }
    }
    //   console.log(body.url)
    return new Promise(resolve => {
        $.get(body, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(data)
                    resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrl(url, data) {
    let body = {
        url: `https://xinrui2-isv.isvjcloud.com/api/${url}`,
        json: data,
        headers: {
            'Host': 'xinrui2-isv.isvjcloud.com',
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'com.jingdong.app.mall',
            'Origin': 'https://xinrui2-isv.isvjcloud.com',
            "Authorization": $.Authorization,
            'Referer': 'https://xinrui2-isv.isvjcloud.com/beauty-christmas2021/?channel=dingzhihuichang&tttparams=s68wA2YFeyJnTGF0IjoiMzYuMTc1NTkiLCJnTG5nIjoiMTE3LjA4MDciLCJncHNfYXJlYSI6IjBfMF8wXzAiLCJsYXQiOjAsImxuZyI6MCwibW9kZWwiOiJSZWRtaSBLMzAgUHJvIFpvb20gRWRpdGlvbiIsInByc3RhdGUiOiIwIiwidW5fYXJlYSI6IjEzXzExMTJfNDY2NjVfNDY2OTkifQ8%3D%3D&sid=43cf43ef70215d3e0690f1e1b13b5d6w&un_area=13_1112_46665_46699',
            'user-agent': 'jdapp;android;10.2.6;;;appBuild/91563;ef/1;ep/%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1639443614479%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22sv%22%3A%22CJO%3D%22%2C%22ad%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%2C%22od%22%3A%22CWTvENLtCWVvDtK1CJc0EK%3D%3D%22%2C%22ov%22%3A%22CzK%3D%22%2C%22ud%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Redmi K30 Pro Zoom Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045735 Mobile Safari/537.36',
            'content-type': 'application/json;charset=UTF-8',
            //     'Cookie': `${cookie} ;`,
        }
    }
    return new Promise(resolve => {
        $.post(body, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(data)
                    resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrlwriteLetter(url, data) {
    let body = {
        url: `https://xinrui2-isv.isvjcloud.com/api/${url}${data}`,
        //json: data,
        headers: {
            'Host': 'xinrui2-isv.isvjcloud.com',
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'com.jingdong.app.mall',
            'Origin': 'https://xinrui2-isv.isvjcloud.com',
            "Authorization": $.Authorization,
            'Referer': 'https://xinrui2-isv.isvjcloud.com/beauty-christmas2021/writeLetter',
            'user-agent': 'jdapp;android;10.2.6;;;appBuild/91563;ef/1;ep/%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1639443614479%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22sv%22%3A%22CJO%3D%22%2C%22ad%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%2C%22od%22%3A%22CWTvENLtCWVvDtK1CJc0EK%3D%3D%22%2C%22ov%22%3A%22CzK%3D%22%2C%22ud%22%3A%22EJq4YtLsENGzC2C0ZNu5Zq%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Redmi K30 Pro Zoom Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045735 Mobile Safari/537.36',
            'content-type': 'application/json;charset=UTF-8',
            //     'Cookie': `${cookie} ;`,
        }
    }
    return new Promise(resolve => {
        $.post(body, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(data)
                    resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

