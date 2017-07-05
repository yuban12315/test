let jwxt = require('./../jwxt/jwxt')
let fs = require('fs')
let async = require('async')

let test = new jwxt('0151123843', '2535286679')

let func=function (number) {
    async.waterfall([
        (callback) => {
        console.log(number)
            test.login((err, res) => {
                if (err) callback(err)
                else {
                    console.log(res)
                    callback(null)
                }
            })
        },
        (callback) => {
            test.chooseCourse([{
                courseNumber: '140442210',
                serialNumber: '01'
            }], (err, res) => {
                if (err) callback(err)
                else {
                    if (res) console.log(res)
                    callback(null)
                }
            })
        }
    ], (err, res) => {
        //集中处理err
        if (err) {
            console.log(err)
            func(number++)
        }
    })
}
func(1)

// async.waterfall([
//     (callback)=>{
//         test.login((err,res)=>{
//             if(err) callback(err)
//             else {
//                 console.log(res)
//                 callback(null)
//             }
//         })
//     },
//     (callback)=>{
//         test.getCurriculum((err,res)=>{
//             if(err) callback(err)
//             else {
//                 if(res)console.log(res)
//                 callback(null)
//             }
//         })
//     }
// ],(err,res)=>{
//     //集中处理err
//     if(err) console.log(err)
// })