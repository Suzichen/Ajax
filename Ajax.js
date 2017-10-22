var _ = (function() {
    return {
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
            for (var name in data) {
                if (!data.hasOwnProperty(name)) continue;
                if (typeof data[name] === 'function') continue;
                var value = data[name].toString();
                name = encodeURIComponent(name);
                value = encodeURIComponent(value);
                url += (url.indexof("?") == -1 ? "?" : "&");
                url += name + "=" + value;
            }
            return url;
        },
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
        },
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
                xhr.open(options.method.toUpperCase(), url, true);
                this.setRequestHeader(xhr, options.header);
                xhr.send(null);

            } else if (options.method.toUpperCase() === 'POST' || 'PATCH') {

                xhr.open(options.method.toUpperCase(), options.url, true);
                this.setRequestHeader(xhr, options.header);
                xhr.send(JSON.stringify(options.data));

            } else {
                console.log('不识别的方法:' + options.method);
                return fasle;
            }
        }
    }
})()


/*
加*为必传的参数，其它都是可选的
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
*/