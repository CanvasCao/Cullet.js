/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v1.0.1
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-5-10 09:47:53
 */

/*!
 1.0.1
 changeSpeed方法接受字符串
 加入字符数量限制25个字符
 .comment 增加一个容器 弹幕消失的时候其实消失的是这个容器
 cell和manger灵魂绑定
 */

;
(function (w, d, $, undefined) {

    //弹幕CommentCell与dom有关 因为dom是他的表现层
    function CommentCell(container, json) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.txt = json.txt;
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）
        this.id = json.id;
        this.speed = json.speed;
        this.imgUrl = json.imgUrl;
        this.backgroundColor = json.backgroundColor || 'white';

        this.ccm = json.ccm;
        //console.log(this.ccm);

        this.winH = $(window).height();
        this.winW = $(window).width();
        this.JM = this.jqueryMap = {};
        this.init();
    };

    CommentCell.prototype = {
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

            //我给每一个cell一个id值 cell+时间戳
            $(this.C).find('.commentCon').append('<div class="comment" id=cell' + that.id + '>' +
                '<div class="commentImg">' + '<img src="' + that.imgUrl + '" alt=""/>' + '</div>' +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '</div>');

            //setJqMap
            this.JM.$cell = $(this.C).find('#cell' + that.id);

        },
        initCSS: function () {
            var that = this;


            //设置当前弹幕本身的css
            this.JM.$cell.css({left: that.winW});
            this.JM.$cell.css({top: that.top});

            this.JM.$cell.css({
                position: 'absolute',
                display: 'block',
                'box-sizing': 'border-box',
                'font-size': '16px',
                'padding': '3px 10px',
                'border-radius': '30px',
                'background-color': that.backgroundColor,
                opacity: '0.8',
            });

            this.JM.$cell.find('.commentImg').css({
                float: 'left',
                'border-radius': '50%',
                'margin-top': '2px',
                'margin-right': '10px',
            }).find('img').css({
                width: '24px',
                'border-radius': '50%'
            });

            this.JM.$cell.find('.commentTxt').css({
                'margin-top': '4px',
                float: 'right',
            });


        },
        bindEvent: function () {
            var that = this;

        },
        move: function () {
            var that = this;
            var cellLeft = this.cssCell('left');
            this.cssCell('left', (cellLeft - that.speed));


            if (this.cssCell('left') <= (-this.cssCell('width'))) {
                that.die();
            }
            ;


        },
        die: function () {
            var that = this;
            //删除分两步 一个是ccm数组里删除自己 另一个是 删除dom节点

            that.jqueryMap.$cell.remove(); //维护dom
            that.ccm.commentArr = _.without(that.ccm.commentArr, that); //维护数组
            //that.showLength();
        },
        cssCell: function (property, value) {
            if (!value) {
                //return Math.floor(parseFloat(this.jqueryMap.$cell.css(property))); //Math.floor就不会出现弹幕偶然卡住的情况了
                return (parseFloat(this.jqueryMap.$cell.css(property))); //Math.floor就不会出现弹幕偶然卡住的情况了
            }
            else {
                this.jqueryMap.$cell.css(property, value);
            }
        },


        showLength: function () {
            var that = this;
            console.log("dom树  " + $('.comment').length);
            console.log("ccm列表  " + that.ccm.commentArr.length);

        },

    };

    //管理类与dom无关 容器只能加这里 写在弹幕类里有延迟
    function CommentCellManage(container) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.commentArr = [];//维护的弹幕列表 还是要不能只用dom树维护节点
        this.commentArrLimit = 50;

        this.winH = $(window).height();
        this.winW = $(window).width();
        this.cellH = 30;
        this.cellPaddingTop = 15;

        this.lineNumber = Math.floor(this.winH / (this.cellH + this.cellPaddingTop)); //弹幕应该有的行数
        this.lineResArr = [];//保存了所有行的数组 一开始是空
        this.lineResArrFixed = [];//保存了所有行的数组 不能动
        for (i = 1; i < this.lineNumber - 2; i++) { //第一行和最后两行不能有弹幕
            this.lineResArr.push(i);
            this.lineResArrFixed.push(i);
        }
        ;


        this.speedHash = {
            slow: 1.1,
            normal: 2.1,
            fast: 3.1,
        };
        this.speedKey = 'normal';

        this.moveFPS = 60;
        this.moveTimer = null;
        this.pushFPS = 2;
        this.pushTimer = null;
        this.init();

    };

    CommentCellManage.prototype = {
        init: function () {
            w.ccm = this; //调试用
            this.createDom();
            this.bindEvent();
        },
        createDom: function () {
            $(this.C).append("<div class='commentCon'></div>")
            $(this.C).find('.commentCon').css({
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                'box-sizing': 'border-box',
                'background-color': 'rgba(0,0,0,0.2)',
                opacity: 1,
            });

        },
        bindEvent: function () {
            var that = this;

        },
        push: function (newJson) {
            var that = this;

            function GetRandom(begin, end) {
                return Math.floor(Math.random() * (end - begin)) + begin;
            };

            function GetTop(lineIndex) { //静态方法 根据行号返回top值
                return (lineIndex * (that.cellH + that.cellPaddingTop) + that.cellPaddingTop);
            };

            function GetLineNum() {
                var res = that.lineResArr[GetRandom(0, that.lineResArr.length)];
//                    var res = that.lineResArr[0];
                that.lineResArr = _.without(that.lineResArr, res);
                if (that.lineResArr.length == 0) {
                    for (i = 1; i < that.lineNumber - 2; i++) {
                        that.lineResArr.push(i);
                    }
                }
                return res;
            };

            if (this.commentArr.length >= this.commentArrLimit) {
                console.log('Too Many Comments');
                return;
            }
            ;


            //原json
            var json = {
                txt: '弹幕 ' + new Date().getTime(),
                id: new Date().getTime(),
                lineNum: 1,
                top: GetTop(1),
                imgUrl: 'img/logo.jpg',
                speed: that.speedHash[that.speedKey],
                backgroundColor: 'white',
                ccm: that,
            };

            //适配器
            for (var k in newJson) {
                json[k] = newJson[k];
            }
            ;

            //给json赋值 决定弹幕出现的行数
            var lineNum = GetLineNum(); //随机行数
            var top = GetTop(lineNum);
            json.lineNum = lineNum;
            json.top = top;
            var cc = new CommentCell(that.C, json);

            this.commentArr.push(cc);
        },
        move: function () {
            var that = this;
            for (i = 0; i < that.commentArr.length; i++) {
                if (that.commentArr[i]) {
                    that.commentArr[i].move();
                    //console.log(that.commentArr[i].speed)
                }
                ;
            }
            ;
        },


        start: function () {
            //循环移动
            var that = this;

            if (that.moveTimer) {
                console.log('Timer already exists');
                return;
            } else {
                that.moveTimer = setInterval(function () {
                    that.move();
                }, 1000 / that.moveFPS);

                that.pushTimer = setInterval(function () {
                    that.push();
                }, 1000 / that.pushFPS);
            }
            ;

        },
        pause: function () {
            var that = this;
            clearInterval(that.moveTimer);
            delete(that.moveTimer); //原来moveTimer要delete

            clearInterval(that.pushTimer);
            delete(that.pushTimer);
        },
        changeSpeed: function (speedKey) {
            var that = this;

            that.speedKey = that.speedHash.hasOwnProperty(speedKey) ? speedKey : 'normal';
            //旧的也改变速度
            for (i = 0; i < that.commentArr.length; i++) {
                if (that.commentArr[i]) {
                    that.commentArr[i].speed = that.speedHash[that.speedKey];
                }
            }
        }
    };

    function InputBox(container, data, ccm) {
        this.C = this.container = container;
        this.data = data;
        this.ccm = ccm;
        this.config = {};
        this.init();
    };

    InputBox.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            this.bindEvent();
        },
        initConfig: function () {

        },
        createDom: function () {

            $(this.C).append("<div class='input'></div>");

            $(this.C).find('.input').html(
                "<div class='imgCon'></div>" +
                "<div class='txtCon'></div>"
            );

            $(this.C).find('.imgCon').html('<img src="img/logo.jpg" alt=""/>');
            $(this.C).find('.txtCon').html('<input type="text" maxlength="25" value="随便说点什么"/>' +
                '<div class="submit">发布</div>');


        },
        initCSS: function () {
            var that = this;
            var winH = $(window).height();
            var winW = $(window).width();


            $(this.C).find('.input').css({
                position: 'absolute',
                bottom: '0px',
                width: winW,
                height: '40px',
                'box-sizing': 'border-box',
                padding: '5px',
                'background-color': '#4b85fd',
//                    opacity: '0.6',
                'font-size': '16px',
            });


            $(this.C).find('.imgCon').css({
                float: 'left',
            })

            $(this.C).find('.imgCon img').css({
                width: '30px',
                display: 'block',
                'border-radius': '50%',
            });

            $(this.C).find('.txtCon').css({
                float: 'right',
                'background-color': '#e6efff',
                'border-radius': '20px',
                width: '100px',
                height: '30px',
                position: 'relative',
            });


            $(this.C).find('.txtCon input').css({
                'background-color': '#bcc3d0',
                'background-color': '#e6efff',

                color: 'gray',
                height: '30px',
                'margin-left': '15px',

            });

            $(this.C).find('.txtCon .submit').css({
                position: 'absolute',
                right: '10px',
                top: '5px',
                border: '1px solid #000',
                'border-radius': '30px',
                'font-size': '12px',
                'box-sizing': 'border-box',
                padding: '1px 5px',
            });


        },
        bindEvent: function () {
            var that = this;

            var winH = $(window).height();
            var winW = $(window).width();

            //reset左右两段的宽度
            $(this.C).find('.imgCon').css({width: 30});
            $(this.C).find('.txtCon').css({width: (winW - 10 - 30 - 5)});

            //input的focus和blur事件
            $(this.C).find('.txtCon input').focus(function () {
                if ($(this).val() == '随便说点什么') {
                    $(this).val('').css({color: 'black'});
                }
            }).blur(function () {
                if ($(this).val() == '') {
                    $(this).val('随便说点什么').css({color: 'gray'});
                }
            });

            //发送按钮的事件
            $(this.C).find('.submit').click(function () {
                var txt = $('.txtCon input').val();
                that.ccm.push({
                    txt: txt,
                    backgroundColor: 'lightblue'
                });

            });

        }
    };

    w.CommentCell = CommentCell;
    w.CommentCellManage = CommentCellManage;
    w.InputBox = InputBox;
})(window, document, jQuery);



