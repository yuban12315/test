const map = [];
map[0] = [0, 20, 5, 999];
map[1] = [20, 0, 999, 1]
map[2] = [5, 999, 0, 10]
map[3] = [999, 1, 10, 0]
//console.log(map)

const d = [0, 999, 999,999];
for (let i = 0; i < 4; i++) {
    for (let j=0;j<4;j++) {
        if (map[i][ j]!==999){
            if (d[j]===999){
                d[j]=map[i][ j]
            }else{
                if ((map[i][j]+d[j])<d[j])
                d[j]=map[i][ j]+d[i]
            }
        }
    }
}

console.log(d)
