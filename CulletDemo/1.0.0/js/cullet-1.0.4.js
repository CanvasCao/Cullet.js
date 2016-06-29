/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v1.0.3
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-5-26 10:32:21
 */

/*!
 1.0.4 加入弹幕点赞（WithoutAjax） 重写弹幕出现算法 现在弹幕不会重叠
 */

;
(function (w, d, $, undefined) {

    //弹幕CommentCell与dom有关 因为dom是他的表现层
    function CommentCell(container, json) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;

        this.txt = (json.txt.length > 15) ? json.txt.substr(0, 15) + '..' : json.txt;
        this.lineNum=json.lineNum;
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）
        this.id = json.id;
        this.speed = json.speed;
        this.expression = json.expression;
        this.config = {
            ifUser: false
        };
        this.ccm = json.ccm;
        //console.log(this.ccm);

        this.occupied = true;
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
            this.config.ifUser = (this.json.uid == searchJson.uid) ? true : false; //这不是后台传的 我需要自己判断
        },
        createDom: function () {
            var that = this;

            //我给每一个cell一个id值 cell+时间戳
            $(this.C).find('.commentCon').append('<div class="comment" id=cell' + that.id + '>' +
                '<div class="commentImg">' + '<img src="img/expression/' + that.expression + '.png" />' + '</div>' +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '<div class="commentLike">赞</div>' +
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
                'padding': '3px 25px',
                'border-radius': '30px',
                'border': '1px solid white',
                'background-color': 'transparent',
                opacity: 1,
            });

            this.JM.$cell.find('.commentImg').css({
                'position': 'absolute',
                'border-radius': '50%',
                top: -5,
                //'margin-top': '2px',
            }).find('img').css({
                width: '40px',
                'border-radius': '50%'
            });

            this.JM.$cell.find('.commentTxt').css({
                color: 'white',
                'font-size': '18px'
            });

            this.JM.$cell.find('.commentLike').css({
                'position': 'absolute',
                'top': -15,
                left: '50%',
                color: 'white',
                'font-size': '16px',
                'opacity': 0
            })


            //用户发送的css要稍微变一下
            if (that.config.ifUser) {
                that.JM.$cell.css({
                    'border': '1px solid blue',
                    //'background-color': 'lightblue',
                    'z-index': 2
                });
                that.JM.$cell.find('.commentImg').css({
                    right: -15,
                    //left: 'none',
                    //'margin-top': '2px',
                })
                that.JM.$cell.find('.commentTxt').css({
                    //color: 'black',
                });
            } else {
                that.JM.$cell.find('.commentImg').css({
                    left: -15,
                })
            }

            //当前一条显示红色
            if (that.json.ifCurrent) {
                that.JM.$cell.css({
                    'border': '5px solid blue',
                    //'background-color': 'lightblue',
                    'z-index': 2
                });
            }

        },
        bindEvent: function () {
            var that = this;
            this.JM.$cell.click(function () {
                $(this).css({backgroundColor: 'blue'})
                $(this).find('.commentLike').css({'top': 0}).animate({'top': -15, 'opacity': 1});

            })

        },
        move: function () {
            var that = this;
            var cellLeft = this.cssCell('left');
            this.cssCell('left', (cellLeft - that.speed));

            //一开始一定占据屏幕右侧 一旦开始不占据屏幕右侧就让occupied=false
            if (that.occupied) {
                //console.log('left   '+that.cssCell('left'));
                //console.log('width   '+that.cssCell('width'));

                if (that.occupied) {
                    var cellLeft = that.cssCell('left');
                    var cellWidth = that.cssCell('width');
                    if (cellLeft + cellWidth+20 < $(window).width()) {
                        that.occupied = false;
                    }

                }
            }

            //如果移动出屏幕就杀死自己
            if (this.cssCell('left') <= (-this.cssCell('width'))) {
                that.die();
            }
            ;


        },
        die: function () {
            var that = this;
            //删除分两步 一个是ccm数组里删除自己 另一个是 删除dom节点

            that.jqueryMap.$cell.remove(); //维护dom
            that.ccm.commentArr = _.without(that.ccm.commentArr, that); //维护ccm数组
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


        //showLength: function () {
        //    var that = this;
        //    console.log("dom树  " + $('.comment').length);
        //    console.log("ccm列表  " + that.ccm.commentArr.length);
        //
        //},

    };

    //管理类与dom无关 容器只能加这里 写在弹幕类里有延迟
    function CommentCellManage(container, json) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;
        this.commentArr = [];//维护的弹幕dom的列表 不能只用dom树维护节点
        this.commentArrLimit = 20;

        this.ccmH = $(this.C).height();
        this.winW = $(window).width();
        this.cellH = 30;
        this.cellPaddingTop = 15;

        this.lineNumber = Math.floor(this.ccmH / (this.cellH + this.cellPaddingTop)); //弹幕应该有的行数

        this.lineResArr = [];//保存了所有行的数组 一开始是空
        for (i = 1; i < this.lineNumber - 1; i++) { //第一行和最后两行不能有弹幕
            this.lineResArr.push(i);
        }


        this.serverCommentArr = [];//ajax加载的弹幕
        this.serverCommentIndex = 0;

        this.speedHash = {
            slow: 1.1,
            normal: 2.1,
            fast: 3.1,
        };
        this.speedKey = 'normal';

        this.moveFPS = 60;
        this.moveTimer = null;
        this.pushFPS = 3;
        this.pushTimer = null;


        this.pid = '';
        this.pname = '';
        this.init();

    };

    CommentCellManage.prototype = {
        init: function () {
            w.ccm = this; //调试用
            this.createDom();
            this.bindEvent();
        },
        createDom: function () {
            $(this.C).append("<div class='commentCon'></div><div class='commentPname'></div><div class='commentClose'>×</div>")
            $(this.C).find('.commentCon').css({
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                'box-sizing': 'border-box',
                'background-color': 'rgba(0,0,0,0.8)',
                opacity: 1,
            });

            $(this.C).find('.commentPname').css({
                position: 'absolute',
                height: 40,
                width: $(window).width() * 0.8,
                left: 0,
                top: 0,
                'font-size': '16px',
                'line-height': '40px',
                color: 'white',
                'padding-left': 20
            });

            $(this.C).find('.commentClose').css({
                position: 'absolute',
                top: 0,
                left: $(window).width() - 40,
                color: 'white',
                'font-size': 40,
                'line-height': '40px',

            })
        },
        bindEvent: function () {
            var that = this;

            $(this.C).find('.commentClose').click(function () {
                that.pause();
                $(that.C).fadeOut();
            })

        },
        push: function (newJson) {
            var that = this;


            if (!newJson) {//没有弹幕参数 不要push了 本来会push假弹幕
                return;
            }

            function GetRandom(begin, end) {
                return Math.floor(Math.random() * (end - begin)) + begin;
            };

            function GetTop(lineIndex) { //静态方法 根据行号返回top值
                return (lineIndex * (that.cellH + that.cellPaddingTop) + that.cellPaddingTop);
            };

            function GetLineNum() {
                that.lineResArr=[];
                for (i = 1; i < that.lineNumber - 1; i++) { //第一行和最后两行不能有弹幕
                    that.lineResArr.push(i);
                }
                for (i = 0; i < that.commentArr.length; i++) {
                    if (that.commentArr[i].occupied) {
                        that.lineResArr = _.without(that.lineResArr,that.commentArr[i].lineNum);
                    }
                }
                //lineResArr里面存了哪几行可以插弹幕
                if(that.lineResArr.length){
                    return that.lineResArr[GetRandom(0,that.lineResArr.length)]
                }
                else{
                    return null;
                }
            };

            if (this.commentArr.length >= this.commentArrLimit) {
                console.log('Too Many Comments');
                return;
            }


            //原json
            var json = {
                txt: '弹幕 ' + new Date().getTime(),
                id: new Date().getTime(),
                lineNum: 1,
                top: GetTop(1),
                expression: 1,
                speed: that.speedHash[that.speedKey],
                uid: 0,
                ccm: that,
            };

            //适配器
            for (var k in newJson) {
                json[k] = newJson[k];
            }
            ;

            //给json赋值 决定弹幕出现的行数
            var lineNum =GetLineNum(); //随机行数
            if(!lineNum){
                return;
            }
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

            $(that.C).fadeIn();

            if (that.moveTimer) {
                console.log('Timer already exists');
                return;
            } else {
                that.moveTimer = setInterval(function () {
                    that.move();
                }, 1000 / that.moveFPS);

                that.pushTimer = setInterval(function () {

                    that.push(that.serverCommentArr[that.serverCommentIndex]);
                    that.serverCommentIndex = (that.serverCommentIndex + 1) >= that.serverCommentArr.length ? 0 : (that.serverCommentIndex + 1);

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
        },

        load: function (pid) { //传入php问号后面的查询参数
            var that = this;
            if (pid == that.pid) {
                that.start(); //加载完成以后开始播放
                return; //加载过了
            }

            $.ajax({
                type: "get",
                url: 'http://n1.jimi.la/apps_T1/culletSelect.php?pid=' + pid,
//                url: 'package.json',
                dataType: "jsonp",
                jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
                jsonpCallback: "jsonpcallback",
                success: function (data) {
                    console.log(JSON.stringify(data));
                    that.pid = pid;//记录一下 没什么用
                    that.pname = data.pname;//记录一下 产品id和名字 没什么用
                    that.clear();
                    that.changePname(data.pname);
                    that.serverCommentArr = data.data;
                    that.start(); //加载完成以后开始播放
                },
                error: function (err) {
                    console.log('LOAD ERROR!')
                    console.log(err);
                }
            });
        },
        clear: function () {
            var that = this;
            that.commentArr = [];
            $('.commentCon').html('');
        },
        changePname: function (pname) {
            $('.commentPname').html(pname);
        }
    };

    w.CommentCell = CommentCell;
    w.CommentCellManage = CommentCellManage;
})(window, document, jQuery);



