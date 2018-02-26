const fs = require('fs')
var PNGImage = require('pngjs-image');
fs.readFile('input.txt','utf8', (err, file) => {
    var image = PNGImage.createImage(160, 120);
    let data = file.split('\n')
    
    data = data[2].split(' ')
    
	
	
	
	

var chunk=function (arr, len) {
    
      var chunks = [],
          i = 0,
          n = arr.length;
    
      while (i < n) {
        chunks.push(arr.slice(i, i += len));
      }
    
      return chunks; 
    }
// var prpix=function(p){
	
	
// 	for(var i=0;i<p.length;i+=2){
// 		var t=[];
// 		for(var j=0;j<p[i].length;j+=2){
// 			if(p[i][j]==255){
// 				t + ;
// 			}else{
// 				t.push(255);
// 			}
// 		}
// 		return t
// 	}
// }
var threshold=function(pix){
	te=[];
	for(var i=0;i<pix.length;i++){
		if(getWhite(pix[i])>mean){
			te[i]=0
		}else{
			te[i]=255;
		}
		if(i%160<10){
			te[i]=0;
		}
	}
	return te;
	
}

var getMean=function(pix){
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

var getRed=function(pix){
	return ((pix & 0xff0000)>>16);
}
var getGreen=function(pix){
	return ((pix & 0xff00)>>8);
}
var getBlue=function(pix){
	return (pix & 0xff);
}
var getWhite=function(pix){
	return getRed(pix)+getGreen(pix)+getBlue(pix);
}

var getTopRight=function(p){
    var xy = [0,0]
    for (var i = 0; i <p.length; i++) {
        var ti=i;
        for (var j = p[ti].length-1; j >= 0&&(ti>0); j--) {
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
var getTopLeft=function(p){
    var xy = [0,0]
    
            for (var i = 0; i <p.length; i++) {
                var ti=i;
                for (var j = 0; j < p[ti].length&&(ti>0); j++) {
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
var getBotRight=function(p){
    var xy = [0,0]
    
            for (var i = p.length-1; i >=0; i--) {
                var ti=i;
                for (var j = p[ti].length-1; j >=0&&(ti<p.length-1); j--) {
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
var getBotLeft=function(p){
    var xy = [0,0]    
    for (var i = p.length-1; i >=0;i--) {
        var ti=i;
        for (var j = 0; j < p[ti].length&&(ti<p.length-1); j++) {
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

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
data = data.map(cv => parseInt(cv))
// console.log(data)
mean=getMean(data)-70;
var p=threshold(data);
data = p
console.log(p.length)

// console.log(p)
// console.log(data)
    // console.log(data.length)
    kek = data.reduce(add,0)/data.length
    // data = data.map(function(cv, ...a){
    //     return  cv < parseInt(kek) ? 255 : 0 // первое - черный, второе - белый
    // })
    // 
    data = chunk(data, 160)
    console.log(data.toString())
    data = rotate2d(data)
 
    function fromDecToRGB(c){
        var r = Math.floor(c / (256*256));
        var g = Math.floor(c / 256) % 256;
        var b = c % 256;
        return (r+g+b)/3 > 10 ? 255 : 0
    }
    // data = rotate2d(data)
    // data = rotate2d(data)
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
    data = rotate2d(data)
    c11 = data[lefttop[0]+parseInt(cwidth*2.7)][lefttop[1]+parseInt(cheight*2.2)] == 255 ? 0 : 1
    c31 = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*2.4)] == 255 ? 0 : 1
    c13 = data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*8)] == 255 ? 0 : 1
    c33 = data[lefttop[0]+parseInt(cwidth*7.88)][lefttop[1]+parseInt(cheight*8)] == 255 ? 0 : 1
    // c43 = data[lefttop[0]+parseInt(cwidth*9)][lefttop[1]+parseInt(cheight*7)] == 255 ? 0 : 1
    console.log(c11,c31,c13,c33)

    //nice
    // let first = findSq(data, 5, 3)
    // let second = findSq(data, 3,5)
    // let third = findSq(data, 7.4, 5)
    // let fourth = findSq(data, 5,7)

    /*
    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*3), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })

    image.setAt(lefttop[0]+parseInt(cwidth*2.7),lefttop[1]+parseInt(cheight*2.2), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*2.4), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*8),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })

    */
    let first = data[lefttop[0]+parseInt(cwidth*5)][lefttop[1]+parseInt(cheight*3)] == 255 ? '1' : '0'
    let second = data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*5)]  == 255 ? '1' : '0'
    let third = data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*5)]  == 255 ? '1' : '0'
    let fourth = data[lefttop[0]+parseInt(cwidth*5)][lefttop[1]+parseInt(cheight*8)]  == 255 ? '1' : '0'
    console.log('ha',first,second,third,fourth)
    var huah = 0
    if (c33 == 1){
        huah = first.toString() + second.toString() + third.toString() + fourth.toString()
    }else if(c13 == 1){
        huah = second + fourth + first + third
    }else if(c11 == 1){
        huah = fourth + third + second + first
    }else if(c31 == 1){ 
        huah = second + first + fourth + third 
    }
    console.log(huah)
    console.log(parseInt(huah,2))
    // console.log(data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*2)],
    // data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*2)],
    // data[lefttop[0]+parseInt(cwidth*3)][lefttop[1]+parseInt(cheight*7)],
    // data[lefttop[0]+parseInt(cwidth*7)][lefttop[1]+parseInt(cheight*7)])
    
    console.log(c11,c31,c13,c33)
    function findSq(data, m1, m2){
        vertical = 0
        for(var i = -5; i< 5; i++){
            vertical += data[lefttop[0]+parseInt(cwidth*m1)+i][lefttop[1]+parseInt(cheight*m2)] == 255 ? 0: 1
        }
        for(var i = -5; i< 5; i++){
            vertical += data[lefttop[0]+parseInt(cwidth*m1)][lefttop[1]+parseInt(cheight*m2)+i] == 255 ? 0: 1
        }
        return vertical > 10 ? '1' : '0'
        // data[lefttop[0]+parseInt(cwidth*5)+4][lefttop[1]+parseInt(cheight*3)+2] == 255 ? '0' : '1'
    }

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
    return parseInt(a) + parseInt(b);
}



    
    for(let x = 0; x<data.length;x++){
        for(let y = 0; y<data[0].length; y++){
            if (data[x][y] == 255){
            image.setAt(x,y, { red:255, green:0, blue:5, alpha:1000 })
        }else{
            image.setAt(x,y, { red:0, green:0, blue:0, alpha:1000 })
            }
        
    }
}


image.setAt(lefttop[0],lefttop[1], { red:0, green:255, blue:5, alpha:1000 })

image.setAt(leftbottom[0],leftbottom[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(righttop[0],righttop[1], { red:0, green:255, blue:5, alpha:1000 })
image.setAt(rightbottom[0],rightbottom[1], { red:0, green:255, blue:5, alpha:1000 })

    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*3), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*5), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*5),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })

    image.setAt(lefttop[0]+parseInt(cwidth*2.7),lefttop[1]+parseInt(cheight*2.2), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7),lefttop[1]+parseInt(cheight*2.4), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*3),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })
    image.setAt(lefttop[0]+parseInt(cwidth*7.88),lefttop[1]+parseInt(cheight*8), { red:0, green:255, blue:5, alpha:1000 })
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
