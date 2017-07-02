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
                if(!err){
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

    //选课
    chooseCourse(callback) {
        let cookie = this.cookie
        if (cookie != null) {
            async.waterfall([
                    (callback) => {
                        //http://202.207.0.238:8081/xkAction.do
                        request.get(`${this.baseUrl}/xkAction.do`).set(this.browserMsg).set('Cookie', cookie)
                            .charset('GBK').end((err, res) => {
                            if(!err){
                                if(res.hasOwnProperty('text')){
                                    if(res.text.includes('对不起、非选课阶段不允许选课')){
                                        callback(new Error('未到选课时间'))
                                    }
                                    else callback(null,'ss')
                                }
                                else{
                                    callback(new Error('服务器错误'))
                                }
                            }
                            else{
                                callback(err)
                            }
                        })
                    }
                ],
                (err, res) => callback(err,res))
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