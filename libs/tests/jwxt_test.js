let jwxt=require('./../jwxt/jwxt')
let async=require('async')

let test=new jwxt('0151123843','2535286679')

async.waterfall([
    (callback)=>{
        test.login((err,res)=>{
            if(err) callback(err)
            else {
                console.log(res)
                callback(null)
            }
        })
    },
    (callback)=>{
        test.getMainPage((err,res)=>{
            if(err) callback(err)
            else {
                console.log(res)
                callback(null)
            }
        })
    }
],(err,res)=>{
    //集中处理err
})