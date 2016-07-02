/**
 * Created by Administrator on 2016/6/17.
 */
(function (w, d, $, undefined) {
    var controller = {};

    controller.ifAjaxing = false;

    controller.culletInsert = function (data, callback) {
        $.ajax({
            type: "post",
            url: jimiHost + '/culletInsert.php',
//                url: 'package.json',
            data: data,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "jsonpcallback",
            success: function (data) {
                console.log('Success!')
                console.log(JSON.stringify(data));
            },
            error: function (err) {
                console.log('ERROR!')
                console.log(err);
            }
        });
    };

    w.controller = controller;
})(window, document, $)
