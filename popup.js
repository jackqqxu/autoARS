/**
 * Update the relevant fields with the new data
 * 初始化展示ARS可以重新载入的单据
 *
 * @param info
 */
var arsObjArr = [];

function initLocalStorageArsData(arsStr) {
    if (!arsStr) {
        return;
    }
    // console.error('arsStr=' + arsStr);
    // if (arsStr == '302') {  //这个无法让location对应的页面进行跳转；
    //     $("#title").after('<tr><td><a href="http://ars.sng.local/Rel_FileTestRequest.htm?noTest=1&selectMenuId=59">跳转到免测发布页</a></td></tr>')
    //     return;
    // }
    arsObjArr = JSON.parse(arsStr);
    // console.error(arsObjArr);
    var newItem = [];
    $.each(arsObjArr, function (i, obj) {
        for(var key in obj) {
            newItem.push(addNewTr(key, obj[key]));
        }
    })
    $("#title").after(newItem.join(''))
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        // ...and send a request for the DOM info...
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'initLocalStorageArsData'},
            // ...also specifying a callback to be called
            //    from the receiving end (content script)
            initLocalStorageArsData);    //初始化的时候，先展示所有已知的desc描述和autoARSFormStr
    });

    /**
     * 这里就先区分需要的类型；简单做了；
     */
    $("#import").click(function () {
        if (!$("#items input[type='checkbox']").length) {
            alert('请先勾选某条记录');
            return;
        }
        if (!$("#netType input[type='checkbox']:checked").length) {
            alert('请选择需要发布的网络');
            return;
        }

        var filesArr = [];

        var typeArr = [];   //区分直出，异步，直出的模板，类别，svn目录

        $("#items input[type='checkbox']").each(function (i, check) {
            if ($(check).prop('checked')) {
                var tmp = '';
                var content = $(check).data('str');
                var formDataArr = JSON.parse(decodeURIComponent(content));
                for(var j = 0; j < formDataArr.length; j++) {
                    var formObj = formDataArr[j];
                    var type = formObj.type,
                        id = formObj.id,
                        val = formObj.val;

                    if (type == 'select') {
                        if (id == 'selProduct') {
                            // console.error('selProduct=' + val);
                            tmp += val;
                        } else if (id == 'selModule') {
                            // console.error('selModule=' + val);
                            tmp += val;
                        } else if (id == 'svnproject') {
                            // console.error('svnproject=' + val);
                            tmp += val;
                        }
                    }
                }
                if (!typeArr.length) {
                    typeArr.push(tmp);
                } else {
                    if ($.inArray(tmp, typeArr) == -1) {
                        // console.error(typeArr, tmp, $.inArray(tmp, typeArr));
                        alert('发布产品/模块/svn路径类型不同，无法在同一个单据中进行发布；只发布第一个');
                        return false;
                    }
                }
                filesArr.push(content);
            }
        })
        var netType = [];

        $("#netType input[type='checkbox']").each(function (j, dom) {
            if ($(dom).prop('checked')) {
                netType.push($(dom).val());
            }
        });

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var data = {
                str : filesArr.join('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'),
                netType : netType.join(',')
            }
            // ...and send a request for the DOM info...
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'autoInsertForm', data : JSON.stringify(data)},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                function(){

                }
            );
        });

    })


    $(document).on('click', '.down', function () {  //下移
        var index = $(this).parent().parent().index(),
            nextIndex = index + 1;

        var nextTrDom = $(this).parent().parent().parent().find('tr:eq(' + nextIndex + ')')[0];

        if (!nextTrDom) {
            alert('已经到底了~');
            return;
        }

        var nextTrDomStr = nextTrDom.outerHTML;
        // console.error(nextTrDomStr);
        $(this).parent().parent().before(nextTrDomStr);
        $(this).parent().parent().next().remove();
        var tmp = arsObjArr[index-1];
        arsObjArr[index-1] = arsObjArr[index];
        arsObjArr[index] = tmp;

        // console.error(arsObjArr.length);
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'orderChange', data : JSON.stringify(arsObjArr)},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                function(){

                }
            );
        });

    }).on('click', '.up', function () { //上移
        var index = $(this).parent().parent().index(),
            preIndex = index - 1;

        if (preIndex == 1) {
            alert('已经到顶了~');
            return;
        }

        var preTrDom = $(this).parent().parent().parent().find('tr:eq(' + preIndex + ')')[0];
        var preTrDomStr = preTrDom.outerHTML;
        // console.error(nextTrDomStr);
        $(this).parent().parent().after(preTrDomStr);
        $(this).parent().parent().prev().remove();

        var tmp = arsObjArr[index-1];
        arsObjArr[index-1] = arsObjArr[preIndex-1];
        arsObjArr[preIndex-1] = tmp;

        // console.error(arsObjArr.length);
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'orderChange', data : JSON.stringify(arsObjArr)},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                function(){

                }
            );
        });
    }).on('click', '.delete', function () { //删除
        var index = $(this).parent().parent().index();
        $(this).parent().parent().remove();
        // console.error(index-1);
        arsObjArr.splice(index-1, 1);
        // console.error(arsObjArr.length);
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'orderChange', data : JSON.stringify(arsObjArr)},
                // ...also specifying a callback to be called
                //    from the receiving end (content script)
                function(){

                }
            );
        });
    })
});



// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    // First, validate the message's structure
    if ((msg.from === 'content') && (msg.subject === 'addNewItem')) {
        // Collect the necessary data
        // (For your specific requirements `document.querySelectorAll(...)`
        //  should be equivalent to jquery's `$(...)`)
		console.error(msg);
		// console.error(sender);
        var newItem = addNewTr(msg.desc, decodeURIComponent(msg.formStr));
		$("#title").after(newItem)
    }
});


var addNewTr = function (desc, formStr) {
    var newItem = '<tr class="newItem" id="' + desc + '">' +
        '<td nowrap><input type="checkbox" data-str="' + formStr + '" id="checkbox_' + desc + '"></td>' +
        '<td style="text-align: left;"><label for="checkbox_' + desc + '">' + decodeURIComponent(desc) + '</label></td>' +
        '<td align="right" style=""><button class="up">上移</button><button class="down">下移</button><button class="delete">删除</button></td>' +
        '<td align="right" style="display: none;"><span class="newItem">' + formStr + '</span></td>' +
        '</tr>';

    // console.error(formStr);

    return newItem;
}

