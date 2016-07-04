/**
 * Created by Administrator on 2016/6/17.
 */
(function (w, d, $, undefined) {
    var controller = {};

    controller.ifAjaxing = false;

    controller.culletSelect = function (pid, callback) {
        $.ajax({
            type: "get",
            url: jimiHost + '/culletSelect.php?pid=' + pid,
            //url: 'package.json',
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "jsonpcallback",
            success: function (data) {
                console.log('SUCCESS!')
                console.log(JSON.stringify(data));

                GM.ccm.pid = pid;//记录一下 没什么用
                GM.ccm.pname = data.pname;//记录一下 产品id和名字 没什么用
                GM.ccm.clear(); //清除arr列表和dom树....................
                GM.ccm.changePname(data.pname);

                //data.data是二维数组我需要把它转成1维
                GM.ccm.serverCommentArr = twoDmsToOneDms(data.data);

                setTimeout(function () {
                    GM.ccm.start(); //加载完成以后开始播放
                }, GM.ccm.json.startDelay || 1);
            },
            error: function (err) {
                console.log('ERROR!');
                console.log(err);
            }
        });
    };

    controller.cullectSupport = function (data, callback) {
        $.ajax({
            type: "get",
            url: jimiHost + '/culletSupport.php',
            data: data,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "jsonpcallback",
            success: function (data) {
                //console.log('SUCCESS!');
                //console.log(JSON.stringify(data));
            },
            error: function (err) {
                //console.log('ERROR!');
                //console.log(err);
            }
        });
    };

    controller.culletInsert = function (data, callback) {

        console.log(JSON.stringify(data));
        $.ajax({
            type: "post",
            url: jimiHost + '/culletInsert.php',
            data: data,
            dataType: "jsonp",
            jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
            jsonpCallback: "jsonpcallback",
            success: function (data) {
                console.log('SUCCESS!');
                console.log(JSON.stringify(data));

                callback(data);

            },
            error: function (err) {
                console.log('ERROR!')
                console.log(err);
                GM.ccm.start();
            }
        });
    };


    w.controller = controller;
})(window, document, $)
