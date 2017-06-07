let request = require('superagent-charset')(require('superagent'))
let cheerio=require('cheerio')
let async=require('async')
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
    login(callback){
        request.post(`${this.baseUrl}/loginAction.do`).redirects(0).charset('GBK').set(this.browserMsg).send({
            zjh:this.getUsername(),
            mm:this.getPassword()
        }).end((err,res)=>{
            if(!err){
                if(res.hasOwnProperty('text')){
                    console.log(res.text)
                }
                if(res.hasOwnProperty('header')){
                    let cookie=res.header['set-cookie']
                    if(cookie){
                        this.setCookie(cookie)
                        callback(null,'登录成功')
                    }
                }
                else{
                    callback(new Error('服务器错误',500))
                }
            }
            else{
                callback(err)
            }
        })
    }

    getMainPage(callback){
        let cookie=this.getCookie()
        if(cookie!=null){
            request.get(`${this.baseUrl}/xkAction.do`).set(this.browserMsg).set('Cookie',cookie)
                .charset('GBK').end((err,res)=>{
                if(res.hasOwnProperty('text')){
                    callback(null,res.text)
                }
                else {
                    callback(new Error('服务器错误'),500)
                }
            })
        }
        else callback(new Error('未登录'))
    }

    getUsername() {
        return this.username
    }

    getPassword() {
        return this.password
    }

    setCookie(cookie){
        this.cookie=cookie
    }

    getCookie(){
        return this.cookie
    }
}
module.exports=jwxt