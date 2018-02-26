const fs = require('fs')
var PNGImage = require('pngjs-image');
fs.readFile('input.txt','utf8', (err, file) => {
    var image = PNGImage.createImage(160, 120);
    let data = file.split('\n')
    
    data = data[1].split(' ')
    mean = getMean(data)
    console.log(mean)
    data = data.map(function(cv, ...a){
        return  fromDecToRGB(cv) // первое - черный, второе - белый
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
    // data = data.map((cv,i,arr) => {
    //     if (i < 10){
    //         return cv.map((...args) => 0)
    //     }else{
    //         return cv
    //     }
    // })
    function decimalColorToHTMLcolor(number) {
        var intnumber = number - 0;
     
        var red, green, blue;
     
        var template = "#000000";
     
        red = (intnumber&0x0000ff) << 16;
        green = intnumber&0x00ff00;
        blue = (intnumber&0xff0000) >>> 16;
     
        intnumber = red|green|blue;
     
        var HTMLcolor = intnumber.toString(16);
    
        HTMLcolor = template.substring(0,7 - HTMLcolor.length) + HTMLcolor;
    
        return HTMLcolor;
    } 
    function getRed(pix){
        return ((pix & 0xff0000)>>16);
        }
       function getGreen(pix){
        return ((pix & 0xff00)>>8);
        }
        function getBlue(pix){
        return (pix & 0xff);
        }
        function getWhite(pix){
        return getRed(pix)+getGreen(pix)+getBlue(pix);
        }
   function getMean(pix){
        var min=100000;
        var max=0;//120x160
        
        for(var i=0;i<pix.length;i++){
        var t=getWhite(pix[i]);
        if(t<min){
        min=t;
        }
        if(t>max){
        max=t;
        }
        }
        
        return min+max/2;
        }
    function fromDecToRGB(c){
        
            r= (c & 0xff0000) >> 16, 
            g= (c & 0x00ff00) >> 8, 
            b= (c & 0x0000ff)
       
        return (r+g+b) > mean? 255 : 0
    }
    data = rotate2d(data)
    // data = rotate2d(data)
    
    
    let lefttop = [0,1555]
    let leftbottom = []
    let righttop = []
    let rightbottom = []
    lefttop = getTopLeft(data) //
    righttop = getTopRight(data)
    leftbottom = getBotLeft(data)
    rightbottom = getBotRight(data)
    // console.log(lefttop,righttop,leftbottom,rightbottom)
    let width = Math.abs(lefttop[0] - righttop[0])
    let height = Math.abs(lefttop[1] - leftbottom[1])    
    let cwidth = parseInt(width/10)
    let cheight = parseInt(height/10)

    c11 = 0
    c31 = 0
    c13 = 0
    c33 = 0
    // data = rotate2d(data)
    c11 = data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*2)] == 255 ? 0 : 1
    c31 = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*2)] == 255 ? 0 : 1
    c13 = data[lefttop[0]+parseInt(cwidth*3)-2][lefttop[1]+parseInt(cheight*7)-2] == 255 ? 0 : 1
    c33 = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*7)] == 255 ? 0 : 1
    // c43 = data[lefttop[0]+parseInt(cwidth*9)][lefttop[1]+parseInt(cheight*7)] == 255 ? 0 : 1
    console.log(c11,c31,c13,c33)

    //nice
    let first = data[lefttop[0]+parseInt(cwidth*5)+4][lefttop[1]+parseInt(cheight*3)+2] == 255 ? '0' : '1'
    let second = data[lefttop[0]+parseInt(cwidth*3)+2][lefttop[1]+parseInt(cheight*5)+2] == 255 ? '0' : '1'
    let third = data[lefttop[0]+parseInt(cwidth*7.4)+2][lefttop[1]+parseInt(cheight*5)+2] == 255 ? '0' : '1'
    let fourth = data[lefttop[0]+parseInt(cwidth*5)+2][lefttop[1]+parseInt(cheight*7)+2] == 255 ? '0' : '1'
    console.log('ha',first,second,third,fourth)
    var huah = 0
    if (c33 == 0){
        huah = first.toString() + second.toString() + third.toString() + fourth.toString()
    }else if(c13 == 0){
        huah = second + fourth + first + third
    }else if(c11 == 0){
        huah = fourth + third + second + first
    }else if(c31 == 0){
        huah = second + first + fourth + third 
    }
    console.log(parseInt(huah,2))
    // console.log(data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*2)],
    // data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*2)],
    // data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*7)],
    // data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*7)])
    
    console.log(c11,c31,c13,c33)
    
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
//         console.log(shit)
        // image4 = PNGImage.createImage(parseInt(cwidth)+1,parseInt(cheight)+1)
    //     for(let x = 0; x<shit.length;x++){
    //         for(let y = 0; y<shit[0].length; y++){
    //             if (shit[x][y] == 255){
    //             image4.setAt(x,y, { red:255, green:0, blue:5, alpha:1000 })
    //         }else{
    //             image4.setAt(x,y, { red:0, green:0, blue:0, alpha:1000 })
    //             }
            
    //     }
    // }
    
  
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
// console.log(`Topx: ${lefttop}
// TopY: ${leftbottom}
// LowX: ${righttop}
// Lowy: ${rightbottom}`)

image.setAt(lefttop[0],lefttop[1], { red:0, green:255, blue:5, alpha:1000 })

image.setAt(leftbottom[0],leftbottom[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(righttop[0],righttop[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(rightbottom[0],rightbottom[1], { red:0, green:255, blue:5, alpha:1000 })


// image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*2), { red:0, green:255, blue:5, alpha:1000 })
    // image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*2), { red:0, green:255, blue:5, alpha:1000 })
    //
    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*2.2), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7.4),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*7), { red:0, green:255, blue:5, alpha:1000 })

    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*2), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*2), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*7), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*7), { red:0, green:255, blue:5, alpha:1000 })
/*

    c11 = data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*2)] == 255 ? 0 : 1
    c31 = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*2)] == 255 ? 0 : 1
    c13 = data[lefttop[0]+parseInt(cwidth*3)-2][lefttop[1]+parseInt(cheight*7)-2] == 255 ? 0 : 1
    c33 = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*7)] == 255 ? 0 : 1
    c43 = data[lefttop[0]+parseInt(cwidth*9)][lefttop[1]+parseInt(cheight*7)] == 255 ? 0 : 1

    */
    // image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*7), { red:0, green:255, blue:5, alpha:1000 })
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
