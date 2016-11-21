
// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
    from:    'content',
    subject: 'showPageAction'
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    // First, validate the message's structure
    if ((msg.from === 'popup') && (msg.subject === 'initLocalStorageArsData')) {
        // Collect the necessary data
        // Directly respond to the sender (popup),
        // through the specified callback */
        var url = location.href;
        // if (url.indexOf('http://ars.sng.local/arsphp/index.php/release?tag=') != -1) {
        response(localStorage.getItem('autoARSData'));
        // } else {
        //     response('302');
        // }
    } else if (msg.from === 'popup' && msg.subject === 'autoInsertForm') {
        var url = location.href;
        if (url.indexOf('http://ars.sng.local/Rel_FileTestRequest.htm?noTest=1&selectMenuId=59') != -1) {
            //这里msg.data包括：
            /*
            var data = {
                str : $(check).data('str'),
                netType : netType.join(',')
            }
            */
            stat.reportPV('m.qzone.com', 'autoARS');
            insertFormInput(JSON.parse(msg.data));
            setTimeout(function () {
                $("#btnPreRelease").click();
            }, 500);

        } else {
            location.href = 'http://ars.sng.local/Rel_FileTestRequest.htm?noTest=1&selectMenuId=59';
            localStorage.setItem('needAutoInsert', msg.data);   //为了证明是从其他页面跳转需要发布的文件
        }
    } else if (msg.from === 'popup' && msg.subject === 'orderChange') {
        localStorage.setItem('autoARSData', msg.data);
    }
});

var registerArsPageFormEvent = function () {
    var arsObj;
    $("#selCcs_TextBoxValue").parent().parent().after('<tr style="color:red;font-weight:bold;"><td>autoARS描述：' +
        '</td><td colspan=3><input type="text" placeholder="该描述会生成autoARS插件的一条单独记录，默认发布描述类容" id="autoARSdesc" ' +
        'value="" size="100" class="txt-user-chooser"><input type="button" class="btn-b btn-info btn-small" ' +
        'style="margin-left:20px;backgroundColor:green;" id="copyToARS" value="保存到autoARS"></td></tr><style>' +
        '.gb-tips {position:fixed;width:100%;top:30%;text-align:center;z-index:9999;font-size:14px}'+
    '.gb-tips .gb-tips-layer{position:relative;display:inline-block;max-width:54%;padding:8px 10px 8px 38px;text-align:left;line-height:22px;background:rgba(0,0,0,.7);color:#fff;border-radius:5px;max-width:220px}'+
    '.gb-tips .gb-tips-layer.no-icon{padding:8px 10px}'+
    '.gb-tips .gb-tips-layer .icon-hook{position:absolute;top:12px;left:12px;width:17px;height:12px;background-image:url(http://qzonestyle.gtimg.cn/qz-act/public/mobile/img/tick-white.png?max_age=19830212&d=20130918105242);background-size:17px 12px}'+
    '.gb-tips .gb-tips-layer .icon-info{position:absolute;top:7px;left:7px;width:24px;height:24px;background-image:url(http://qzonestyle.gtimg.cn/qz-act/public/mobile/img/info-white.png?max_age=19830212&d=20130918105242);background-size:24px 24px}'+
    '.gb-tips .gb-tips-layer .icon-cancel{position:absolute;left:12px;top:11px;width:16px;height:16px;background-image:url(http://qzonestyle.gtimg.cn/qz-act/public/mobile/img/close-white.png?max_age=19830212&d=20130918105242);background-size:16px 16px}'+
    '.gb-tips .gb-tips-layer .icon-loading{position:absolute;top:3px;left:3px;height:32px;width:32px;background:url(http://qzonestyle.gtimg.cn/qz-act/public/mobile/img/loading.png?max_age=19830212&d=20130918105242) center center no-repeat;background-size:20px 20px;-webkit-animation:mask 600ms infinite step-start;-moz-animation:mask 600ms infinite step-start;-ms-animation:mask 600ms infinite step-start;-o-animation:mask 600ms infinite step-start;animation:mask 600ms infinite step-start}'+
    '</style>'
    );


    // $("#btnPreRelease").click(function(){
    //     localStorage.setItem('arsObj', JSON.stringify({
    //         'selProduct' : $("#selProduct").val(),
    //         'selModule'	:	$("#selModule").val(),
    //         'selModuleHtml' : $("#selModule").html(),
    //         'selReasonType'	: $("#selReasonType").val(),
    //         'idTestcaseUpdate' : $("#idTestcaseUpdate").val(),
    //         'isTestcaseUpdate'	: $("#isTestcaseUpdate").val(),
    //         'svnproject'	:	$("#svnproject").val(),
    //         'svnprojectHtml'	:	$("#svnproject").html(),
    //         'txtContent'	:	$("#txtContent").val()
    //     }));
    // });

    //用户点击保存到ars的时候操作；
    $("#copyToARS").click(function(){
        var formObjArr = [];
        $("input[type='text'], textarea, input[type='hidden']").each(function(i, textDom){
            var id = $(textDom).attr('id'),
                val = $(textDom).val();

            var obj = {
                type : 'text',
                id : id,
                val : val
            };
            formObjArr.push(obj);
        })
        $("select").each(function (i, selectDom) {
            var id = $(selectDom).attr('id'),
                selectHtml = $(selectDom).html(),
                selectVal = $(selectDom).val();
            var obj = {
                type : 'select',
                id : id,
                html : selectHtml,
                val : selectVal
            };
            formObjArr.push(obj);
        })

        var autoARSdesc = encodeURIComponent($("#autoARSdesc").val() || $("#txtContentDescription").val());
        var formObjStr = encodeURIComponent(JSON.stringify(formObjArr));


        //因为涉及到要排序，还是用数组方便；
        var savedLocalStorageArsObj = JSON.parse(localStorage.getItem('autoARSData') || null) || [];

        // if (savedLocalStorageArsObj[autoARSdesc]) {
        //     if (!window.confirm('描述对应的ARS单据已经存在，确认替换老的记录？')) {
        //         return false;
        //     }
        // }

        // savedLocalStorageArsObj[autoARSdesc] = formObjStr;

        var newItemObj = {};
        newItemObj[autoARSdesc] = formObjStr;

        //console.info(newItemObj);

        savedLocalStorageArsObj.push(newItemObj);

        localStorage.setItem('autoARSData', JSON.stringify(savedLocalStorageArsObj));

        msg('info', 'autoARS记录添加成功~');

        //通知autoARS有新的描述
        chrome.runtime.sendMessage({
            from:    'content',
            subject: 'addNewItem',
            desc : autoARSdesc,
            formStr : formObjStr
        });

    })
}

$(document).ready(function(){
    //console.error(location.href);
    var url = location.href,
        tag = localStorage.getItem('tagRelease');   //发布的id

    if (url.indexOf('http://ars.sng.local/Rel_FileTestRequest.htm?noTest=1&selectMenuId=59') != -1) {    //表单输入页面
        registerArsPageFormEvent();
        var lastTaskData = localStorage.getItem('needAutoInsert');
        if (lastTaskData) {   //有其他页面的任务
            insertFormInput(JSON.parse(lastTaskData));
            setTimeout(function () {
                localStorage.setItem('needAutoInsert', ''); //清空insert的数据
                $("#btnPreRelease").click();
            }, 500);
        }
    } else if (url.indexOf('http://ars.sng.local/arsphp/index.php/release?tag=') != -1) {   //发布处理页
        // var tmpTag = url.match(/tag=(.*?)$/)[1];
        //console.error(tmpTag)
        //console.error(tag)
        // if (tag == tmpTag) {
        //     return;
        // }

        // $("#testreleasebtn").click(function () {
        //     //console.error(tmpTag + '已经点击了');
        //     localStorage.setItem('tagRelease', tmpTag);
        // })

        // $("#testreleasebtn").click();
    } else if (url.indexOf('http://ars.sng.local/Default.htm') != -1) {    //列表页
        // setTimeout(function () {
        //     if ($("#loadingdone tr").length > 1) {  //需要有发布指令才可以发布呢；
        //         //console.error('准备发布到测试环境');
        //         var tmpTag = $($("#loadingdone tr").get(1)).find('td:eq(1) a').html();
        //         if (tmpTag) {
        //             //console.error('2s后开发准备发布到测试环境')
        //             if (localStorage.getItem('tagRelease') != tmpTag) {
        //                 // $($("#loadingdone tr").get(1)).find('a').get(0).click();
        //             }
        //         }
        //     }
        // }, 2000);
    } else if (url.indexOf('http://ars.sng.local/Rel_ShowLogs.htm?type=1&orderid=') != -1) {  //测试环境发布的页面
        var checkFinish = setInterval(function () {
            // if (jQuery("#loadingdone tbody:eq(1) td:eq(2) div>div").html() == '完成！') {
            // if($($($($("#loadingdone tr").get(1)).find('td').get(2)).find('div').get(1)).html() == '完成！') {
            if ($("#lblTotal").html() > 0 && $("#lblTotal").html() == $("#lblSuccess").html()){
                //console.error('finish');
                $(".btn-success").click();
            }
        }, 1000);
    }

});
