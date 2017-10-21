# 原生Js实现delet和patch方法的封装


> Ajax通信技术是前端非常重要的技能之一，它的出现使网页的使用体验发生了翻天覆地的变化。其中GET和POST方法是Ajax的主流，而如DELETE,PATCH方法却少有人使用，虽然Jquery等库支持这些东西，但如果离开第三方库甚至有很多新手不懂怎么用。其实很简单，这里就封装一个可以实现这些方法的Ajax组件

## 封装组件
*实现一个组件，首先需要设计一个封装型还算靠谱的方案，闭包是主流选择。*
```javascript
// 这里的_作为输出的接口，可以随意起名(注意与其它组件兼容就好)
var _ = (function() {
    return {
    // 这里是内容区
    }
})()
```
然后封装可能用到的方法
```javascript
// 为了兼容所有浏览器，封装一个获取XMLHttpRequest的方法
getXhr: function() {
    // 适配IE各版本
    if(!new XMLHttpRequest()) {
        XMLHttpRequest = function() {
            try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
            catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
            catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) {}
            return false;
        }
    }
    // 适配主流浏览器
    return new XMLHttpRequest();
},
// 参数序列化
serialize: function(url,data) {
    if(!data) return url;
    url += (url.indexof("?") == -1 ? "?" : "&");
    for (var name in data) {
        if (!data.hasOwnProperty(name)) continue;
        if (typeof data[name] === 'function') continue;
        var value = data[name].toString();
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        url += name + "=" + value;
    }
    return url;
}
```
材料准备好了，开始上主菜
```javascript
ajax: function(options) {
    var xhr = this.getXhr();
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                options.callback(xhr.responseText);
            } else {
                if(options.error)  options.error(xhr.responseText);
                console.log('错误代码：' + xhr.responseText);
            }
        }
    }
    if (options.method.toUpperCase() === 'GET' || 'DELETE') {

        var url = this.serialize(options.url,options.data)
        xhr.open(options.method, url, true);
        this.setRequestHeader(xhr, options.header);
        xhr.send(null);

    } else if (options.method.toUpperCase() === 'POST' || 'PATCH') {

        xhr.open(options.method, options.url, true);
        this.setRequestHeader(xhr, options.header);
        xhr.send(JSON.stringify(options.data));

    } else {
        console.log('不识别的方法:' + options.method);
        return fasle;
    }
}
```
如上。
`setRequestHeader`比较常用，所以单独拎出来封装了：
```javascript
setRequestHeader: function(xhr, headers) {
    if(!headers) {
        xhr.setRequestHeader(
            'Content-Type', 'application/x-www-form-urlencoded'
        );
        return;
    }
    for (var name in headers) {
        xhr.setRequestHeader(
            name.toString(), headers[name].toString()
        );
    }
}
```
## 调用方法
调用方法如下，除了url和method的值是必选的，其它都是可选的
```javascript
_.ajax({
    url: '/api/test',                   // *
    method: 'GET/POST/DELETE/PATCH',    // *
    data: {
        name: 'xxx',
        id: 001
    },
    header: {
        contenttype: 'application/json'
    },
    callback: function(data) {
        console.log('ok')
    },
    error: function(data) {
        console.log('falser' + data)
    }
})
```
## 总结
通过以上代码，可以看出各种方法其实都大同小异，但在这里我要特别说一下：

由于一些冷门方法不常用，因此可能很多人认为Ajax调用method时是不区分大小写的。但其实并不是的，比如PATCH方法

**实现PATCH方法时一定要注意用大写**

这也是今天用patch调用后端接口时发现的，由于之前全用的小写，所以一开始就没注意，导致连不上服务器。耗费了两个小时的时间找bug

因此我这里封装的方法中直接`toUpperCase()`转成了大写。