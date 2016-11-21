/**
 * Created by jackqqxu on 2016/9/20.
 */
var stat = {};
var _imgId = 1;
var mIcon = {
    succ: 'hook',
    fail: 'cancel',
    info: 'info',
    loading: 'loading',
    noicon : 'noicon'
};

var timeId,tips_css;

/**
 * 插入页面inline样式块
 * @param {string} sheetId 样式表style Element的ID
 * @param {string} [rules=""] 样式表规则内容
 * @returns {object} 返回样式表style Element对象

 * @example QZFL.css.insertStyleSheet("cssid", "body {font-size: 75%;}");
 */
var insertStyleSheet = function (sheetId, rules) {
    var node = document.createElement("style");
    node.type = 'text/css';
    sheetId && (node.id = sheetId);
    document.getElementsByTagName("head")[0].appendChild(node);
    if (rules) {
        if (node.styleSheet) {
            node.styleSheet.cssText = rules;
        } else {
            node.appendChild(document.createTextNode(rules));
        }
    }
    return node.sheet || node;
};

var msg = function(type, content, delay, options){
    var self = this;
    //提示前，如果有另外一个提示框存在，清除定时器，立即销毁
    timeId && clearTimeout(timeId);
    $('#q_Msgbox').remove();

    if(arguments.length == 1){ //只有一个参数时，默认为内容，info提示
        content = type;
        type = undefined;
    }

    options = options || {};

    delay = delay || 2000;

    var params = {
        icon: mIcon[type] || mIcon['info'],
        content: content || ''
    };
    $('body').append('<div class="gb-tips" id="q_Msgbox"  ><div class="gb-tips-layer"><i class="icon-hook"></i>' + params.content + '</div></div>');
    var tipDom = $('#q_Msgbox');
    var top = 200;
    if(options && options.middle) {
        try{
            top = $(window).height() / 2 - 38;
        }catch(e){};
    }
    tipDom.css('top',top);
    //var currentHeight = tipDom.css('top');
    //tipDom.css('top',-50);
    //tipDom.animate({top:currentHeight},300);
    timeId = setTimeout(function () {
        $('#q_Msgbox').remove();
    }, delay);
};

/**
 * 上报函数
 * @param url
 * @param rate 默认100，全上报
 * @param timeout  默认0，立即上报
 * @private
 */
stat._send = function(url, rate, timeout, opt) {
    rate = rate || 100;
    timeout = timeout || 0;
    if(opt && typeof opt.callback == "function") {
        timeout = timeout || 500;
    }
    if(rate < 100 && Math.random() * 100 > rate) {
        return;
    }
    var img = new Image();
    //避免函数执行后img马上被销毁，需要保存在window下，但需要手动销毁
    img.g_stat_reportId = _imgId;
    window.g_stat_report = window.g_stat_report || {};
    window.g_stat_report[_imgId] = img;
    _imgId++;
    img.onload = img.onerror = img.ontimeout = function() {
        if(opt && typeof opt.callback == "function") {
            opt.callback();
        }
        delete window.g_stat_report[this.g_stat_reportId];
    };
    if(timeout) {
        setTimeout(function() {
            img.src = url;
        }, timeout);
    } else {
        img.src = url;
    }
};


/**
 *
 * @returns {string}
 * @private
 */
stat._pgvGetUserInfo = function() {
    var m = document.cookie.match(/(^|;|\s)*pvid=([^;]*)(;|$)/);
    if(m && m.length > 2) {
        pvid = m[2];
    } else {
        var pvid = (Math.round(Math.random() * 2147483647) * (new Date().getUTCMilliseconds())) % 10000000000;
        document.cookie = "pvid=" + pvid + "; path=/; domain=qq.com; expires=Sun, 18 Jan 2038 00:00:00 GMT;";
    }
    return "&pvid=" + pvid;
};

/**
 *
 * @param {string} [sDomain = location.hostname] 请求pv统计主虚域名
 * @param {string} [path = location.pathname] 请求pv统计虚路径
 * @param {object} [opts = {
					referURL: "http://xxxxxxxx", //你需要统计的来源URL，可以随便写，合法的URL即可，这里多说一句，有与qzone这样的域名是 号码.qzone.qq.com的情况，来源会非常多，为了不压垮PGV的存储，这里最好能归类来源域名，虚拟化，下同
					referDomain: "xxxx.xxx.com", //如果你想分开写，那么可以直接写个来源URL的虚域名
					referPath: "/xxxxx", //如果你想分开写，那么可以直接写个来源URL的虚路径
					timeout: 500, 统计请求发出时延，默认500ms
				}] 可选参数
 *
 */
stat.reportPV = function(domain, pathname, opt) {
    domain = domain || 'h5.qzone.qq.com';
    pathname = pathname || (window.location && window.location.pathname) || '/';
    opt = $.extend({
        timeout: 500,
        referURL: document.referrer,
        referDomain: domain
    }, opt);
    try {
        var cgi;
        if(location.protocol === 'https:' || (window.HYB && window.HYB.jsHttps)) {
            cgi = 'https://h5.qzone.qq.com/proxy/domain/pingfore.qq.com/pingd';
        } else {
            cgi = 'http://pingfore.qq.com/pingd';
        }

        var Url = [cgi, "?dm=", domain, "&url=", pathname, "&tt=-&rdm=", opt.referDomain, "&rurl=", escape(opt.referURL), this._pgvGetUserInfo(),
            "&scr=-&scl=-&lang=-&java=1&cc=-&pf=-&tz=-8&ct=-&vs=3.3"].join('');
        stat._send(Url + "&emu=" + Math.random(), 100, opt.timeout, opt);
    } catch(e) {
        stat._send("http://219.133.51.97/pingd?err=" + escape(e.message) + "&url=" + escape(location.href) + "&stone=" + Math.random());
    }
};

var insertFormInput = function (formDataObj) {
    var formDataObjStr = decodeURIComponent(formDataObj.str);
    var formDataObjArr = formDataObjStr.split('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    // console.error(formDataObjArr.length);
    // var hasOpen = false;
    var totalArsItems = formDataObjArr.length;
    for(var i = 0; i < totalArsItems; i++) {   //这里可能有多条记录的情况；
        var formDataArr = JSON.parse(formDataObjArr[i]);
        for(var j = 0; j < formDataArr.length; j++) {
            var formObj = formDataArr[j];
            var type = formObj.type,
                id = formObj.id,
                val = formObj.val;
            if (type == 'select') {
                $("#" + id).html(formObj.html).val(val);
                if (id == 'svnproject') {
                    $("#svnproject").next('span').find('input').val(val)
                }
            } else {        //这里需要考虑异步和直出的情况
                var oldVal = $("#" + id).val();
                // var syncArr, asyncArr;  //分别记录异步和直出
                // if (!hasOpen) {
                //     hasOpen = true;
                //     setTimeout(function () {
                //         window.open('http://www.qq.com');
                //     }, 1000);
                // }
                if (id == 'txtContentDescription') {
                    $("#" + id).val(val + "<br />" + oldVal);
                } else if (id == 'txtContent') {    //代码url地址；
                    if (oldVal) {
                        var oldValArr = oldVal.split("\n");
                        // console.error(oldValArr);
                        var newValArr = val.split("\n");
                        var finalValArr = [];
                        $.each(newValArr, function (t,v) {
                            if (v) {
                                if ($.inArray(v, oldValArr) == -1) {    //不存在才需要增加进去
                                    oldValArr.push(v);
                                }
                            }
                        })
                        $("#" + id).val(oldValArr.join("\n"));
                    } else {
                        if (totalArsItems > 1) {
                            var newValArr = val.split("\n");
                            var finalValArr = [];
                            $.each(newValArr, function (s,v) {
                                if (v) {
                                    finalValArr.push(v);
                                }
                            })
                            $("#" + id).val(finalValArr.join("\n"));
                        } else {
                            $("#" + id).val(val);
                        }
                    }
                } else {
                    $("#" + id).val(val);
                }


                if (id == 'txtReleaseCode') {
                    $("#txtReleaseCode").val($("#copyReleaseTag_1").data('clipboard-text'));
                }
                var nowDate = new Date();
                nowDate.setDate(nowDate.getDate()+1);

                Date.prototype.Format = function(date)
                {
                    var o = {
                        "M+" : this.getMonth()+1,  //月份
                        "d+" : this.getDate(),     //日
                        "h+" : this.getHours(),    //小时
                        "m+" : this.getMinutes(),  //分
                        "s+" : this.getSeconds(),  //秒
                        "q+" : Math.floor((this.getMonth()+3)/3), //季度
                        "S" : this.getMilliseconds() //毫秒
                    };

                    if(/(y+)/.test(date))
                    {
                        date = date.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
                    }

                    for(var k in o)
                    {
                        if(new RegExp("("+ k +")").test(date))
                        {
                            date = date.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                        }
                    }

                    return date;
                }

                var newTime = nowDate.Format('yyyy-MM-dd hh:mm');
                if (id == 'txtReleaseTime') {
                    $("#txtReleaseTime").val(newTime);
                }
                if (id == 'txtLimitTime') {
                    $("#txtLimitTime").val(newTime);
                }
                if (id == 'txtApplicantTime') {
                    $("#txtApplicantTime").val(newTime);
                }
            }
        }
    }

}
