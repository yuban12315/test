const fs=require('fs')

const filename='test.txt'
class Thunder{
    constructor(){
        this.list=[]
    }
    async read(filename) {
        await fs.readFile(filename,(err,buffer)=>{
            if (err){
                console.log(err)
                return -1
            }
            let list=this.list
            const string =buffer.toLocaleString()
            let temp=""
            let index=0
            for (let i in string){
                if (string[i]==='\r'){
                    continue
                }
                if (string[i] ==='账'||string[i] ==='号'||string[i] ==='码') continue
                if (string[i] ==='密'){
                    temp+=' '
                    continue
                }
                if (string[i]==='\n'){

                    list[index]=temp
                    index++
                    temp = ""
                    continue
                }
                temp+=string[i]
            }
            //console.log(list)
            temp = list
            list=[]
            for (let i in temp){
                const array=[]
                let user='',pass=''
                let flag=true
                for (let j in temp[i]){
                    if (temp[i][j]===' '){
                        flag=false
                        continue
                    }
                    if (flag) user+=temp[i][j]
                    else pass+=temp[i][j]
                }
                list[i]={user,pass}
            }
            console.log(this.list)
        })
    }
    async login(){

    }
}
const test=new Thunder()
test.read(filename)
test.login()

