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
    data = rotate2d(data)
    
    let topx = [-1, 0],
    topy = [0, -1],
    lowx = [1500000, 0],
    lowy = [0,1500000]

    
//     for(let x = 0; x<data.length;x++){
//         for(let y = 0; y<data[0].length; y++){
//             if (data[x][y] == 255){
                
//                 if (topx[0] < x) topx = [x,y]
//                 if (topy[1] < y) topy = [x,y]
//                 if (lowx[0] > x) lowx = [x,y]
//                 if (lowy[1] > y) lowy = [x,y]
            
//             image.setAt(x,y, { red:255, green:0, blue:5, alpha:1000 })
//         }else{
//             image.setAt(x,y, { red:0, green:0, blue:0, alpha:1000 })
//             }
        
//     }
// }
console.log(`Topx: ${topx}
TopY: ${topy}
LowX: ${lowx}
Lowy: ${lowy}`)
image.setAt(topx[0],topx[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(topy[0],topy[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(lowx[0],lowx[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(lowy[0],lowy[1], { red:0, green:255, blue:5, alpha:1000 })

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
