# 如何处理图片加载失败

## 引子

在我们的实际工作中，不可避免的会在页面中加载大量图片，但可能由于网络问题，或者图片文件缺失等问题，导致图片不能正常展示

我们希望有一种降级处理的方式，可以在图片加载失败后显示一张我们预先设定好的默认图片



## 监听图片的 error 事件

由于图片加载失败后，会抛出一个 error 事件，我们可以通过监听 error 事件的方式来对图片进行降级处理

```html
<img id="img" src="//xxx.xxx.xxx/img.png">
```
```javascript
let img = document.getElementById('img');
img.addEventListener('error',function(e){
	e.target.str = '//xxx.xxx.xxx/default.png'; // 为当前图片设定默认图
})
```

这种方式，确实实现了对异常图片的降级处理，但每张图片都需要通过 JS 进行获取，并且监听 error 事件，对于大量图片的情况并不适用

为此，我们可以使用内联事件来监听 error 事件
```html
<img src="//xxx.xxx.xxx/img.png" onerror="this.src = '//xxx.xxx.xxx/default.png'">
```

我们可以看到，完全不需要单独去写 JS 的监听，我们就实现了异常图片的降级处理

但这种方式还不够好，因为我们仍然需要手动的向 img 标签中添加内联事件，在实际开发过程中，很难保证每张图片都不漏写

那么我们思考，是否可以不写内联事件，通过在全局监听的方式，来对异常图片做降级处理呢


## 全局监听

我们希望的是，能够在全局监听 error 事件，在实际实现之前，先来看一下浏览器中的事件流

DOM2级事件规定事件流包含三个阶段：
+ 事件捕获阶段
+ 处于目标阶段
+ 事件冒泡阶段

首先发生的是事件捕获，为截获事件提供了机会。然后是实际的目标接收到的事件。最后一个阶段是冒泡阶段。

我们上文中的监听图片自身的 error 事件，实际上在事件流中是处于目标阶段。

对于 img 的 error 事件来说，是无法冒泡的，但是是可以捕获的，我们的实现如下:

```javascript
window.addEventListener('error',function(e){
	// 当前异常是由图片加载异常引起的
	if( e.target.tagName.toUpperCase() === 'IMG' ){
		e.target.src = '//xxx.xxx.xxx/default.jpg';
	}
},true)
```

最后，我们在思考一个问题，当网络出现异常的时候，必然会出现什么网络图片都无法加载的情况，这样就会导致我们监听的 error 事件
被无限触发，所以我们可以设定一个计数器，当达到期望的错误次数时停止对图片赋予默认图片的操作，改为提供一个Base64的图片

实现起来也很简单，如下：
```javascript
window.addEventListener('error',function(e){
    let target = e.target, // 当前dom节点
        tagName = target.tagName,       
        times = Number(target.dataset.times) || 0, // 以失败的次数，默认为0
        allTimes = 3; // 总失败次数，此时设定为3
	// 当前异常是由图片加载异常引起的
	if( tagName.toUpperCase() === 'IMG' ){
	    if(times >= allTimes){
	        target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
	    }else{
	        target.dataset.times = times + 1;
	        target.src = '//xxx.xxx.xxx/default.jpg';
	    }
	}
},true)
```


