/* JimiInputBox, a JavaScriptPlugIn v2.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-5-24 11:31:08
 */

;
(function (w, d, $, undefined) {
    function JimiInputBox(container, data) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;//主页自己写容器
        this.data = data;
        this.ccm = data.ccm;
        this.config = {
            winW: $(window).width(),
            winH: $(window).height(),
        };
        this.JM = this.jqueryMap = {};

        this.hasFocused = false;
        this.btnDisable = false;


        this.init();
    }

    JimiInputBox.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            this.bindEvent();
        },
        initConfig: function () {

        },
        createDom: function () {
            var that = this;


            //上面是表情
            $(this.C).html('<div class="jimiInputBoxExpression"></div><div class="jimiInputBoxImgAndText"></div>');
            $(this.C).find('.jimiInputBoxImgAndText').html('<div class="jimiInputBoxImg"></div><div class="jimiInputBoxText"></div>')
            $(this.C).find('.jimiInputBoxImg').html('<img src="img/expression/1.png" data-index="1"/></div>')
            $(this.C).find('.jimiInputBoxText').html(' <input type="text" maxlength="40" value="随便说点什么"/>' +
                '<div class="jimiInputBoxSubmit">吐槽</div>');


            //加表情
            var imgNum = 5;
            var str = '';
            for (i = 1; i <= imgNum; i++) {
                str += '<div class="imgDiv"><img src="img/expression/' + i + '.png" data-index=' + i + '  /></div>'
            }
            $(this.C).find('.jimiInputBoxExpression').html(str);

            $(this.C).find('.imgDiv').css({
                'text-align': 'center',
                display: 'inline-block',
                width: ($(window).width() - 10) / imgNum,
            });
        },
        initCSS: function () {
            var that = this;


            $(this.C).css({ //这个盒子在屏幕底部定位
                position: 'absolute',
                height: '40px',
                width: that.config.winW,
                bottom: 0,
                'background-color': 'white',
                'font-size': '16px',
                'z-index': 2
            })

            $(this.C).find('.jimiInputBoxExpression').css({
                position: 'absolute',
                bottom: 0,
                padding: 5,
                width: that.config.winW,
                height: '40px',
                'box-sizing': 'border-box',
                display: 'none'
            })

            $(this.C).find('.jimiInputBoxImgAndText').css({
                position: 'absolute',
                width: that.config.winW,
                bottom: 0,
                padding: '5px 10px 5px 40px',
                'box-sizing': 'border-box',
            })

            $(this.C).find('.jimiInputBoxImg').css({
                position: 'absolute',
                left: '0',
                width: '40px',
                height: '40px',
                /*border: 1px solid #000;*/
                'box-sizing': 'border-box',
                padding: '0 5px',
            })


            $(this.C).find('img').css({
                width: '30px',
                'border-radius': '50%',
            })

            $(this.C).find('.jimiInputBoxText').css({
                'box-sizing': 'border-box',
                'border-radius': '20px',
                width: '100%',
                height: '30px',
                'background-color': '#eee',
                position: 'relative',
            })


            $(this.C).find('.jimiInputBoxText input').css({
                'background-color': '#eee',
                color: 'gray',
                height: '30px',
                width: 2 / 3 * that.config.winW,
                'margin-left': '15px',
            })


            $(this.C).find('.jimiInputBoxSubmit').css({
                position: 'absolute',
                right: '10px',
                top: '5px',
                'border-radius': '30px',
                'font-size': '12px',
                'box-sizing': 'border-box',
                padding: '2px 6px',
                color: 'white',
                'background-color': '#3982e1',
            })

        },
        bindEvent: function () {
            var that = this;


            //input的focus和blur事件
            $(this.C).find('input').focus(function () {
                if (that.hasFocused == false) {
                    that.hasFocused = true;
                    $(this).val('').css({color: 'black'});
                }

            }).blur(function () {

            });

            //发送按钮的事件
            $(this.C).find('.jimiInputBoxSubmit').click(function () {
                var txt = $(that.C).find('input').val();
                if (txt == '' || that.hasFocused == false) {
                    alert(1)
                    return;
                }
                else {

                    if (this.btnDisable == true) {
                        return;
                    }
                    else {
                        that.btnDisabled();
                        setTimeout(function () {
                            that.btnAbled();
                        }, 2000);


                        var txt = $(that.C).find('input').val();
                        var expression = $(that.C).find('.jimiInputBoxImg img').attr('data-index');


                        //假数据......................
                        var json = {
                            "imgUrl": searchJson.uimg,
                            "commentsPK": -1,
                            "uid": searchJson.uid,
                            "userType": searchJson.usertype,
                            "txt": txt,
                            "expression": expression,
                        };

                        that.ccm.add(json);


                        //ajax..............................
                        var data = {
                            pid: that.ccm.pid,
                            uid: searchJson.uid,
                            comment: txt,
                            expression: expression,
                        };
                        controller.culletInsert(data, null);


                        //clearInput
                        $(that.C).find('input').val("");

                    }

                }

                //发送以后清空

            });


            $(this.C).find('.jimiInputBoxImg').click(function () {
                $(that.C).find('.jimiInputBoxExpression').fadeIn();
                $(that.C).find('.jimiInputBoxImgAndText').fadeOut();
            });

            $(this.C).find('.jimiInputBoxExpression img').click(function () {
                var index = $(this).attr('data-index');
                $(that.C).find('.jimiInputBoxImg img').attr('src', 'img/expression/' + index + '.png').attr('data-index', index);
                $(that.C).find('.jimiInputBoxExpression').fadeOut();
                $(that.C).find('.jimiInputBoxImgAndText').fadeIn();
            })
            //,.jimiInputBoxExpression
        },

        fresh: function () {
            var that = this;
            $(that.C).find('input').css({color: 'gray'}).val('随便说点什么');
            that.hasFocused = false;
        },
        btnDisabled: function () {
            var that = this;

            $(that.C).find('.jimiInputBoxSubmit').css('background', 'gray');
            that.btnDisable = true;
        },
        btnAbled: function () {
            var that = this;

            $(that.C).find('.jimiInputBoxSubmit').css('background', '#3982e1');
            that.btnDisable = false;
        },

    }

    w.JimiInputBox = JimiInputBox;
})(window, document, jQuery)


