autoARS
=======

auto select the options the submit the file distribution system

每次发布文件的时候，有没有觉得经常要重复点击很多次同样的内容？
今天抽时间完成了ars自动化发布chrome插件；用法说明：
        a. 用户点击免测版本发布， 
        b. 启动ars auto selection chrome 插件，启动后会在用户第一次点击后将用户输入的信息写入到localStorage；
            第二次进入同样的页面，会自动填充上次用户输入的信息；
            
            
* 页面与页面之间通讯相关的内容




* 页面与扩展之间的通讯
> 先通过扩展popup.js的下面方法和chrome的page页面进行通讯；
```javascript
    window.addEventListener('DOMContentLoaded', function () {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            // ...and send a request for the DOM info...
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'DOMInfo'},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                setDOMInfo);
        });
    })    
```    
> chrome的page页面收到popup的通讯请求之后，进行处理
```javascript
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(function (msg, sender, response) {
        // First, validate the message's structure
        if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
            // Collect the necessary data
            // (For your specific requirements `document.querySelectorAll(...)`
            //  should be equivalent to jquery's `$(...)`)
    
            // Directly respond to the sender (popup),
            // through the specified callback */
            response({
                desc : localStorage.getItem('autoARSdesc'),
                formStr : encodeURIComponent(localStorage.getItem('autoARSFormStr')),
            });
        } else if (msg.from === 'popup' && msg.subject === 'insert') {
            insertFormInput(JSON.parse(msg.data));
            setTimeout(function () {
                $("#btnPreRelease").click();
            }, 500);
        }
    });
```
> popup.js收到了page返回的response数据；对返回的数据进行处理；更新chrome插件的展示内容；
```javascript
    // Update the relevant fields with the new data
    function setDOMInfo(info) {
        if (info) {
            var newItem = addNewTr(info.desc, info.formStr);
            $("#title").after(newItem)
        }
    }
```

> 2016-11-8 autoARS的基本流程：
* 1. 只要是打开相关的页面，如果启动autoARS，会在popup.js中发送chrome.tabs.sendMessage，参数：{from: 'popup', subject: 'initLocalStorageArsData'}，通知相应的
        页面，页面收到通知后，会将localStorage.getItem('autoARSData')返回给popup.js，在popup.html弹出页面初始化所有的ars单据列表；
        
* 2. 如果进入的是ars系统首页，没启动autoARS的发布功能；用户自己填写了部分数据，可以保存导入到autoARS；
     如果启动了autoARS的发布功能，则会定义localStorage.setItem('needAutoInsert', ...)；保存了用户需要处理的数据，包括网络发布的环境，和form的数据；
    
* 3. 如果进入的是ars发布页面，启动autoARS，选择某个item，点击导入，会在popup.js中发送chrome.tabs.sendMessage，参数：{from: 'popup', subject: 'autoInsertForm', data : JSON.stringify(data)}
        在ars页面会收到data，将用户选择的发布单据数据写入form页面；

* 4. 进入到发布页面，支持了各种排序合并处理；

