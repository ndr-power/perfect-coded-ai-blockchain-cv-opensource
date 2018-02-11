const fs = require('fs')
var PNGImage = require('pngjs-image');
fs.readFile('Camera_Out','utf8', (err, file) => {
    var image = PNGImage.createImage(160, 120);
    let data = file.split(',')
    data = data.map(function(cv, ...a){
        return  parseInt(cv) > 4000000 ? 0 : 255 // первое - черный, второе - белый
    })
    data = chunk(data, 160)
    // 
    data = rotate2d(data)
    data = data.map((cv,i,arr) => {
        if(cv.every(elem => elem == 255)){
            return cv.map((...args) => 0)
        }else{
            return cv
        }
    })
    data = rotate2d(data)
    // data = rotate2d(data)
    
    
    let lefttop = [0,1555]
    let leftbottom = []
    let righttop = []
    let rightbottom = []
    lefttop = getTopLeft(data)
    righttop = getTopRight(data)
    leftbottom = getBotLeft(data)
    rightbottom = getBotRight(data)
    let width = Math.abs(lefttop[0] - righttop[0])
    let height = Math.abs(lefttop[1] - leftbottom[1])    
    let cwidth = parseInt(width/10)
    let cheight = parseInt(height/10)

    c11 = 0
    c31 = 0
    c13 = 0
    c33 = 0
    c11 = data[parseInt(cwidth*3)][parseInt(cheight*3)] == 255 ? 0 : 1
    c31 = data[parseInt(cwidth*9)][parseInt(cheight*3)] == 255 ? 0 : 1
    c13 = data[parseInt(cwidth*3)][parseInt(cheight*9)] == 255 ? 0 : 1
    c33 = data[parseInt(cwidth*9)][parseInt(cheight*9)] == 255 ? 0 : 1
    console.log(c11,c31,c13,c11)
//   console.log(width, height)







// let curry = 0
// let color =[]
//  for (let i = 0; i<5; i++){ // чекаем по y
//   currx = 0
//   if (i != 0)  curry += cheight
//   for (let j = 0; j<5 ;j++){
//       shit = []
//       сolor = []
//       if( j!= 0)  currx += cwidth
//       for (let k =0; k<parseInt(cwidth);k++){
//           for (let q = 0; q<parseInt(cheight); q++){
//               if (curry != cheight*4)
//                   shit.push(data[int(currx)+k][int(curry)+q])
//               else
//                   shit.push(data[int(currx)+k][int(curry-(height-width))+q])
//                 }
//                 }
//         shit = chunk(shit, parseInt(cwidth))
//         image4 = PNGImage.createImage(parseInt(cwidth)+1,parseInt(cheight)+1)
//         for(let x = 0; x<shit.length;x++){
//             for(let y = 0; y<shit[0].length; y++){
//                 if (shit[x][y] == 255){
//                 image4.setAt(x,y, { red:255, green:0, blue:5, alpha:1000 })
//             }else{
//                 image4.setAt(x,y, { red:0, green:0, blue:0, alpha:1000 })
//                 }
            
//         }
//     }
    
  
// imgs.append(chunks(shit, int(cheight)))
//  }
//  }
 function int(nu){
     return parseInt(nu)
 }
 function len(ar){
     return ar.length
 }
 function sum(ar){
     return ar.reduce(add,0)
 }
 function add(a, b) {
    return a + b;
}

    // color = chunk(color,5)
    // console.log(color)


    data = rotate2d(data)
    
    for(let x = 0; x<data.length;x++){
        for(let y = 0; y<data[0].length; y++){
            if (data[x][y] == 255){
            image.setAt(x,y, { red:255, green:0, blue:5, alpha:1000 })
        }else{
            image.setAt(x,y, { red:0, green:0, blue:0, alpha:1000 })
            }
        
    }
}
console.log(`Topx: ${lefttop}
TopY: ${leftbottom}
LowX: ${righttop}
Lowy: ${rightbottom}`)
image.setAt(lefttop[0],lefttop[1], { red:0, green:255, blue:5, alpha:1000 })

image.setAt(leftbottom[0],leftbottom[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(righttop[0],righttop[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(rightbottom[0],rightbottom[1], { red:0, green:255, blue:5, alpha:1000 })

    image.writeImage('GodPlease1.png')
}) 
function chunk (arr, len) {
    
      var chunks = [],
          i = 0,
          n = arr.length;
    
      while (i < n) {
        chunks.push(arr.slice(i, i += len));
      }
    
      return chunks;
    }

    function rotate2d(arr){
        return arr[0].map((cv, i, arrrr) => arr.map((cvv,ii,arrr) => arr[ii][i]))
    }

/* OUTDATED CODE (зачем уж нам гитхаб...)
acc = data[0].reduce((pv, cv, ci, arr) => {
    //     coll = 0
    //     coll = data.reduce((pv2,cv2,ci2,arr2) => {
    //         // console.log(arr2[ci2][ci] == 255 ? 1 : 0)
    //         // console.log(ci, ci2)
    //         real = 0
    //         real = cv2[ci] == 255 ? 1 : 0 
    //         // console.log(pv2)
    //         return parseInt(pv2) + real
    //     })
    //     console.log(ci)
    //     console.log(coll)
    // })
    */


function getTopRight(p){
    let xy = [0,0]
    for (let i = 0; i <p.length; i++) {
        let ti=i;
        for (let j = p[ti].length-1; j >= 0&&(ti>0); j--) {
            //System.out.println(i+" "+ti+" "+j+" "+p[ti][j]);
            if(p[ti][j]==255){
                xy[0]=j;
                xy[1]=ti;
                //print(xy[0],xy[1]);
                //System.out.println(th);
                return xy;
            }
            ti--;
        }
    }

    return xy;
}
function getTopLeft(p){
    let xy = [0,0]
    
            for (let i = 0; i <p.length; i++) {
                let ti=i;
                for (let j = 0; j < p[ti].length&&(ti>0); j++) {
                    //System.out.println(i+" "+ti+" "+j+" "+p[ti][j]);
                    if(p[ti][j] == 255){
                        xy[0]=j;
                        xy[1]=ti;
                        //print(xy[0],xy[1]);
                        //System.out.println(th);
                        return xy;
                    }
                    ti--;
                }
            }
    
            return xy;
}
function getBotRight(p){
    let xy = [0,0]
    
            for (let i = p.length-1; i >=0; i--) {
                let ti=i;
                for (let j = p[ti].length-1; j >=0&&(ti<p.length-1); j--) {
                    //System.out.println(i+" "+ti+" "+j+" "+p[ti][j]);
                    if(p[ti][j] == 255  ){
                        xy[0]=j;
                        xy[1]=ti;
                        //print(xy[0],xy[1]);
                        //System.out.println(th);
                        return xy;
                    }
                    ti++;
                }
            }
    
            return xy;
}
function getBotLeft(p){
    let xy = [0,0]    
    for (let i = p.length-1; i >=0;i--) {
        let ti=i;
        for (let j = 0; j < p[ti].length&&(ti<p.length-1); j++) {
            //System.out.println(i+" "+ti+" "+j+" "+p[ti][j]);
            if(p[ti][j] == 255){
                xy[0]=j;
                xy[1]=ti;
                //print(xy[0],xy[1]);
                //System.out.println(th);
                return xy;
            }
            ti++;
        }
    }

    return xy;
}
