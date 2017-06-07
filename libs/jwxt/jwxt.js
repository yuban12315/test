let request = require('superagent-charset')(require('superagent-retry')(require('superagent')))
let async=require('async')
class jwxt {
    constructor(username, password) {
        //学号，登录密码
        this.username = username
        this.password = password
        //内蒙古大学教务系统
        this.baseUrl = 'http://jwxt.imu.edu.cn'
        this.browserMsg={
            "User-Agent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
        }
        //保存登录cookie
        this.cookies={}
    }

    //登录
    login(){
        request.post(`${this.baseUrl}/loginAction.do`)
    }

    getUsername() {
        return this.username
    }

    getPassword() {
        return this.password
    }
}
module.exports=jwxt