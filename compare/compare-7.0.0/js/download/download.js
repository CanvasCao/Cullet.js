/*!
 * downloadBtn, a JavaScriptPlugIn v1.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-6-11 17:06:52
 */

;
(function (w, d, $, undefined) {

    'use strict';


    function Download(container, data) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.data = data;
        this.config = {};
        this.init();
    }

    Download.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            this.bindEvent();
        },
        initConfig: function () {

        },
        createDom: function () {
            $(this.C).html("<div class='downloadBtn'>下载肌秘APP</div>")
        },
        initCSS: function () {
            var that = this;

            $(this.C).find('.downloadBtn').css({
                float: 'right',
                display: 'inline-block',
                height: '28px',
                'line-height': '28px',
                'border-radius': '28px',
                'background-color': '#3881e0',
                'box-sizing': 'border-box',
                padding: '0 8px',
                color: 'white',
                'margin': '10px 0px 10px 0',
                'font-size':'12px',
            })


        },
        bindEvent: function () {
            var that = this;

            //给按钮不同的链接
            var ua = navigator.userAgent;
            if (ua.charAt('iphone') != -1 && ua.charAt('Mac') != -1) {//说明不是IPHONE
                $('.downloadBtn').click(function () {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.jimi.skinsecret#opened';
                })
            }
            else {
                $('.downloadBtn').click(function () {
                    window.location.href = 'https://itunes.apple.com/us/app/id1074206874';
                })
            }

        }
    }
    w.Download = Download;
})(window, document, jQuery)


