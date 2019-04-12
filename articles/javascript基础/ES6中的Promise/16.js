// @flow Created by 陈其丰 on 2019/4/12.
let p1 = Promise.resolve(1);
let p2 = new Promise((resolve,reject)=>{
    setTimeout(function(){
        reject('p2 error')
    },1000)
})
let p3 = new Promise((resolve,reject)=>{
    setTimeout(function(){
        reject('p3 error')
    },500)
})
Promise.all([p1,p2,p3]).catch((error)=>{
    console.log(error); // print: p3 error
})