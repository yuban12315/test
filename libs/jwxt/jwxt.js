let request = require('superagent-charset')(require('superagent'))
let cheerio = require('cheerio')
let async = require('async')
class jwxt {
    constructor(username, password) {
        //学号，登录密码
        this.username = username
        this.password = password
        //内蒙古大学教务系统
        this.baseUrl = 'http://202.207.0.238:8085'
        this.browserMsg = {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
        //保存登录cookie
        this.cookie = null
    }

    //登录
    login(callback) {
        request.post(`${this.baseUrl}/loginAction.do`).redirects(0).charset('GBK').set(this.browserMsg).send({
            zjh: this.getUsername(),
            mm: this.getPassword()
        }).end((err, res) => {
            if (!err) {
                // if(res.hasOwnProperty('text')){
                //     console.log(res.text)
                // }
                if (res.hasOwnProperty('header')) {
                    let cookie = res.header['set-cookie']
                    if (cookie) {
                        this.setCookie(cookie)
                        callback(null, '登录成功')
                    }
                }
                else {
                    callback(new Error('服务器错误', 500))
                }
            }
            else {
                callback(err)
            }
        })
    }

    //获取主页
    getMainPage(callback) {
        let cookie = this.getCookie()
        if (cookie != null) {
            // http://jwxt.imu.edu.cn/menu/s_main.jsp
            request.get(`${this.baseUrl}/menu/s_main.jsp`).set(this.browserMsg).set('Cookie', cookie)
                .charset('GBK').end((err, res) => {
                if (res.hasOwnProperty('text')) {
                    callback(null, res.text)
                }
                else {
                    callback(new Error('服务器错误'), 500)
                }
            })
        }
        else callback(new Error('未登录'))
    }

    //获取课程表
    getCurriculum(callback) {
        let cookie = this.getCookie()
        if (cookie != null) {
            // http://jwxt.imu.edu.cn/xkAction.do?actionType=6
            request.get(`${this.baseUrl}/xkAction.do?actionType=6`).set(this.browserMsg).set('Cookie', cookie)
                .charset('GBK').end((err, res) => {
                if (!err) {
                    if (res.hasOwnProperty('text')) {
                        //获取到了课表，开始分析
                        let $ = cheerio.load(res.text, {decodeEntities: false})

                        /**
                         * 列表：
                         * tr2.td3-10     第一节
                         * tr3.td2-9      第二节
                         * tr4.td2-9      第三节
                         * tr5.td2-9      第四节
                         * tr6.td3-10    第五节
                         * tr7.td-2-9    第六节
                         * tr8.td2-9     第七节
                         * tr9.td2-9     第八节
                         *
                         * */

                        let html = $('#user>tbody>tr:nth-child(2)>td:nth-child(1)').html()
                        html = html.replace(/\n/g, '')
                        callback(null, html)
                    }
                    else {
                        callback(new Error('服务器错误'), 500)
                    }
                }
                else {
                    callback(err)
                }
            })
        }
        else callback(new Error('未登录'))
    }

    /**获取考试成绩=-=
     * 返回成绩数组
     * 格式为
     * [{name:String,
     * score:String}]*/
    getScores(callback) {
        let cookie = this.cookie
        if (cookie != null) {
            //http://202.207.0.238:8081/gradeLnAllAction.do?type=ln&oper=qbinfo&lnxndm=2016-2017%D1%A7%C4%EA%B4%BA(%C8%FD%D1%A7%C6%DA)
            request.get(`${this.baseUrl}/gradeLnAllAction.do?type=ln&oper=qbinfo`).set(this.browserMsg).set('Cookie', cookie).charset('GBK').end((err, res) => {
                if (err) {
                    callback(err)
                }
                else {
                    if (res.hasOwnProperty('text')) {
                        let $ = cheerio.load(res.text,{decodeEntities: false})
                        let data=[]
                        $ = cheerio.load($(".titleTop2").last().html(),{decodeEntities: false})
                        $('.odd').each(function (i, e) {
                            //console.log($(this).html())
                            let html = `<table>${$(this).html()}</table>`
                            let $1 = cheerio.load(html, {decodeEntities: false})
                            data.push({
                                name:'',
                                score:''
                            })
                            $1('td').each(function (i1, e) {
                                if (i1 == 2) {
                                    data[i].name=$1(this).text().replace(/\s/g,'')
                                }
                                if(i1==6){}
                                data[i].score=$1(this).text().replace(/\s/g,'')
                            })
                        })
                        callback(null,data)
                    }
                    else {
                        callback(new Error('服务器错误'))
                    }
                }

            })
        }
        else callback(new Error('未登录'))
    }

    /**选课
     * 传入课程json数组
     * 格式为[{
     * courseNumber(课程号)：number,
     * serialNumber(课序号):  number
     * }]
     * */
    chooseCourse(courses, callback) {
        let cookie = this.cookie
        if (cookie != null) {
            async.waterfall([
                    //获取选课状态
                    (callback) => {
                        //http://202.207.0.238:8081/xkAction.do
                        request.get(`${this.baseUrl}/xkAction.do`).set(this.browserMsg).set('Cookie', cookie)
                            .charset('GBK').end((err, res) => {
                            if (!err) {
                                if (res.hasOwnProperty('text')) {
                                    if (res.text.includes('不允许选课')) {
                                        callback(new Error('未到选课时间'))
                                    }
                                    //可以选课，获取方案计划号
                                    else {
                                        let number
                                        let $ = cheerio.load(res.text)
                                        number = $('input[name="fajhh"]').attr('value')
                                        callback(null, number)
                                    }
                                }
                                else {
                                    callback(new Error('服务器错误'))
                                }
                            }
                            else {
                                callback(err)
                            }
                        })
                    },
                    (number, callback) => {
                        request.get(`${this.baseUrl}/xkAction.do?actionType=-1&fajhh=${number}`).set(this.browserMsg).set('Cookie', cookie).charset('GBK').end((err, res) => callback(err))
                    },
                    (callback) => {
                        request.get(`${this.baseUrl}xkAction.do?actionType=2&pageNumber=-1&oper1=ori`).set(this.browserMsg).set('Cookie', cookie).charset('GBK').end((err, res) => callback(err))
                    },
                    (callback) => {
                        async.map(courses, (item, callback) => {
                            let courseNumber = item.courseNumber, serialNumber = item.serialNumber
                            request.get(`${this.baseUrl}jhxn=&kcsxdm=&kch=${courseNumber}&cxkxh=${serialNumber}&actionType=2&oper2=gl&pageNumber=-1`).set(this.browserMsg).set('Cookie', cookie).set.end((err, res) => {
                                if (err) {
                                    callback(err)
                                }
                                else {
                                    request.get(`xkAction.do?kcId=${courseNumber}_${serialNumber}&preActionType=2&actionType=9`).set(this.browserMsg)
                                        .set('Cookie', cookie).charset('GBK').end((err, res) => {
                                        if (err) {
                                            callback(err)
                                        }
                                        else if (res.hasOwnProperty('text')) {
                                            if (res.text.includes('成功')) {
                                                callback(null, `选${courseNumber}成功`)
                                            }
                                            else callback(new Error('选课失败'))
                                        }
                                        else callback(new Error('服务器错误'))
                                    })
                                }
                            })
                        }, (err, res) => callback(err, res))
                    }
                ],
                (err, res) => callback(err, res))
        }
        else callback(new Error('未登录'))
    }

    getUsername() {
        return this.username
    }

    getPassword() {
        return this.password
    }

    setCookie(cookie) {
        this.cookie = cookie
    }

    getCookie() {
        return this.cookie
    }
}
module.exports = jwxt