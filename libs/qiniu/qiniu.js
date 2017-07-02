let storage = require('qiniu')
let config = require('./../config')
let async=require('async')
//根据七牛云官网的sdk编写的图片上传类
class qiniu {
    constructor(bucket) {
        storage.conf.ACCESS_KEY = config.ACCESS_KEY
        storage.conf.SECRET_KEY = config.SECRET_KEY

        this.bucket = bucket
    }


    uptoken() {
        let put_policy = new storage.rs.PutPolicy(this.bucket + ":" + this.key)
        //put_policy.callbackUrl = 'http://ocxi5zst0.bkt.clouddn.com/callback.php'
       //put_policy.callbackBody = 'filename=$(fname)&filesize=$(fsize)'
        return put_policy.token()
    }

    upload_file(key,file_path,callback){
        this.key = key
        this.file_path = file_path
        let token=this.uptoken()
        //console.log(token)
        let extra=new storage.io.PutExtra()
        storage.io.putFile(token,this.key,this.file_path,extra,(err,res)=>{
            if(err) {
                callback(err)
            }
            else{
                //console.log(res.hash,res.key.res.persistentId)
                callback(null,res)
            }
        })
    }


}
module.exports=qiniu