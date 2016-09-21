/* JimiInputBoxCullet, a JavaScriptPlugIn
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-8-25 14:25:32
 */

;
(function (w, d, $, undefined) {
    function JimiInputBox(container, data) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;//主页自己写容器
        this.data = data;
        this.config = {};

        this.JM = this.jqueryMap = {};

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
            $(this.C).find('.jimiInputBoxText').html(' <input type="text" maxlength="40"/>' +
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
                width: ($(w).width() - 10) / imgNum,
            });
        },
        initCSS: function () {
            var that = this;

            //这个盒子在屏幕底部定位........................
            $(this.C).css({
                position: 'absolute',
                height: '40px',
                width: $(w).width(),
                bottom: 0,
                'background-color': 'white',
                'font-size': '16px',
                'z-index': 2
            })

            $(this.C).find('.jimiInputBoxExpression').css({
                position: 'absolute',
                bottom: 0,
                padding: 5,
                width: $(w).width(),
                height: '40px',
                'box-sizing': 'border-box',
                display: 'none'
            })

            $(this.C).find('.jimiInputBoxImgAndText').css({
                position: 'absolute',
                width: $(w).width(),
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
                width: '80%',
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
            $(this.C).find('input')
                .focus(function () {
                })
                .blur(function () {
                });

            //发送按钮的事件
            $(this.C).find('.jimiInputBoxSubmit').click(function () {

                var txt = $(that.C).find('input').val().trim();
                if (txt == '') {
                    return;
                }
                else {
                    var expression = $(that.C).find('.jimiInputBoxImg img').attr('data-index');

                    //如果是回复..........................................................
                    if (GM.state == 'reply') {
                        //reid 回话组id  recid被回复弹幕主键 reuid被回复用户id
                        var reid = (GM.beChoosedComment.reid == 0) ? GM.beChoosedComment.commentsPK : GM.beChoosedComment.reid;
                        var recid = GM.beChoosedComment.commentsPK;
                        var reuid = GM.beChoosedComment.uid;

                        controller.culletInsert({
                            pid: GM.ccm.pid,
                            uid: searchJson.uid,
                            comment: txt,
                            expression: expression,
                            reid: reid,
                            recid: recid,
                            reuid: reuid,
                            jsonpcallback: 1,
                        }, function (data) {
                            var commentsPK = data.cid;
                            var json = {
                                "imgUrl": searchJson.uimg,
                                "commentsPK": commentsPK,
                                "uid": searchJson.uid,
                                "userType": searchJson.usertype,
                                "reid": reid,
                                "txt": txt,
                                "expression": expression,
                            };
                            GM.ccm.reply(json);
                            GM.ccm.start();
                        });

                    }
                    //如果是增加..........................................................
                    else {
                        //reid 回话组id  recid被回复弹幕主键 reuid被回复用户id
                        var reid = 0;
                        var recid = 0;
                        var reuid = 0;

                        controller.culletInsert({
                            pid: GM.ccm.pid,
                            uid: searchJson.uid,
                            comment: txt,
                            expression: expression,
                            reid: reid,
                            recid: recid,
                            reuid: reuid,
                            jsonpcallback:1,
                        }, function (data) {
                            var commentsPK = data.cid;
                            var json = {
                                "imgUrl": searchJson.uimg,
                                "commentsPK": commentsPK,
                                "uid": searchJson.uid,
                                "userType": searchJson.usertype,
                                "reid": reid,
                                "txt": txt,
                                "expression": expression,

                            };
                            GM.ccm.add(json);
                        });
                    }


                    $(that.C).find('input').val('');
                    that.changeState('add');

                }
            });


            //点击表情出现表情选择框..................................................
            $(this.C).find('.jimiInputBoxImg').click(function () {
                $(that.C).find('.jimiInputBoxExpression').stop().fadeIn();
                $(that.C).find('.jimiInputBoxImgAndText').stop().fadeOut();
            });

            //选择表情方法............................................................
            $(this.C).find('.jimiInputBoxExpression img').click(function () {
                var index = $(this).attr('data-index');
                $(that.C).find('.jimiInputBoxImg img').attr('src', 'img/expression/' + index + '.png').attr('data-index', index);
                $(that.C).find('.jimiInputBoxExpression').stop().fadeOut();
                $(that.C).find('.jimiInputBoxImgAndText').stop().fadeIn();
            })
        },


        changeState: function (state) {
            var that = this;

            if (state == 'add') {
                $(that.C).find('input').removeAttr('placeholder')
            } else if (state == 'reply') {
                $(that.C).find('input').attr({'placeholder': '回复 :'});
            }
        },

    }

    w.JimiInputBox = JimiInputBox;
})(window, document, jQuery)


