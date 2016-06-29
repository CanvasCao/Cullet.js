/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v2.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-5-31 14:45:10
 */

/*!
 4.0.0
 弹幕清除内存
 样式改变
 VIP 头像 普通用户表情
 加入fastClick.js
 加入likedList对象保存是否点赞

 */

;
(function (w, d, $, undefined) {

    //弹幕CommentCell与dom有关 因为dom是他的表现层
    function CommentCell(container, json) {
        var that = this;
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;

        this.txt = json.txt || Math.random();
        this.txt = (json.txt.length > 18) ? json.txt.substr(0, 18) + '..' : json.txt;
        this.lineNum = json.lineNum;//不能不给
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）

        this.imgUrl = json.imgUrl;
        this.id = new Date().getTime().toString() + parseInt(Math.random() * 10000);//时间戳+随机数
        this.commentsPK = json.commentsPK; //数据库comments表的主键 作为id

        this.speed = json.speed;

        this.userType = json.userType || 0;//普通是0 女王是12
        this.expression = json.expression || 1;//表情是1-5
        this.ccm = json.ccm;//不能不给


        this.occupied = true; //是否占据屏幕右侧
        this.liked = false; //是否点赞了 ajax后应该是后台返
        if (that.ccm.likedObject[that.commentsPK] == 1) {
            that.liked = true;
        }


        this.winH = $(window).height();
        this.winW = $(window).width();
        this.JM = this.jqueryMap = {};


        this.uid = json.uid;//这个版本没用了
        this.config = {};


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
            var that = this;
            that.config.commentImg = (that.userType != 0) ? '<img src="' + that.imgUrl + '" />' : '<img src="img/expression/' + that.expression + '.png" />';
            that.config.vipBg = (that.userType != 0) ? '<img src="img/vip' + that.userType + '.png" />' : '';
            if (that.userType == 0) {
                that.config.normalColor = 'rgba(0,0,0,0.45)';
                that.config.likedColor = 'rgba(56,129,224,0.9)';
            } else if (that.userType == 1) {
                that.config.normalColor = that.config.likedColor = 'rgba(255,0,42,0.45)';
            } else if (that.userType == 2) {
                that.config.normalColor = that.config.likedColor = 'rgba(238,162,0,0.55)';
            }
        },
        createDom: function () {
            var that = this;

            //我给每一个cell一个id值 cell+时间戳+随机数
            $(this.C).find('.commentCon').append('<div class="comment" id=cell' + that.id + '>' +
                '<div class="commentVipBg">' + that.config.vipBg + '</div>' +
                '<div class="commentImg">' + that.config.commentImg + '</div>' +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '<div class="commentLike"><img src="img/like.png"/></div>' +
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
                'padding': '4px 22px',
                'border-radius': '30px',
                //'border': '1px solid white',
                'background-color': that.config.normalColor,
                opacity: 1,
            });


            this.JM.$cell.find('.commentVipBg').css({
                'position': 'absolute',
                top: -9,
                left: -10,
            }).find('img').css({
                width: '30px',
            });

            this.JM.$cell.find('.commentImg').css({
                'position': 'absolute',
                'border-radius': '50%',
                top: -2,
                left: -8,
                //'margin-top': '2px',
            }).find('img').css({
                width: '28px',
                height:'28px',
                'border-radius': '50%'
            });

            this.JM.$cell.find('.commentTxt').css({
                color: '#fff',
                'font-size': '12px'
            });

            this.JM.$cell.find('.commentLike').css({
                'position': 'absolute',
                'top': -15,
                left: '50%',
                transform: 'translateX(-50%)',
                'border-radius': '50%',
                'border':'1px solid white',
                background: that.config.likedColor,
                'opacity': 0,
                width: 20,
                height: 20,
            }).find('img').css({
                'margin-left': 2,
            });


            //that.config.ifUser保存了当前的弹幕是否是用户发送的 现在没有了
            if (that.config.ifUser) {
            };
            //that.json.ifCurrent 保存了当前弹幕是否是在当前inputbox发送的 现在也没有了
            if (!that.commentsPK) { //本地发送
                this.JM.$cell.css({border: '5px solid #3881e0'});
            };
            if (that.liked) {
                this.JM.$cell.css('background', that.config.likedColor);
                this.JM.$cell.find('.commentLike').css({'top': -15, 'opacity': 1});
            };

        },
        bindEvent: function () {
            var that = this;
            this.JM.$cell.click(function () {
                //点赞样式
                if (that.liked) {//已经赞了
                    that.liked = false;
                    that.ccm.likedObject[that.commentsPK] = 0;
                    $(this).css({backgroundColor: that.config.normalColor});
                    $(this).find('.commentLike').stop().animate({'opacity': 0}, 0);
                } else {//还没点赞
                    that.liked = true;
                    that.ccm.likedObject[that.commentsPK] = 1;
                    $(this).css({backgroundColor: that.config.likedColor});
                    $(this).find('.commentLike').css({'top': 0}).stop().animate({'top': -15, 'opacity': 1}, 100);

                };

                //ajax
                if (!that.commentsPK) {//没有服务器主键说明不用ajax
                    return;
                };

                //给服务器发ajax点赞
                if (!that.ccm.ajaxedObject.hasOwnProperty(that.commentsPK)) {//没有
                    that.ccm.ajaxedObject[that.commentsPK] = 1;

                    $.ajax({
                        type: "get",
                        url: jimiHost + '/culletSupport.php',
                        data: {
                            commentId: that.commentsPK
                        },
                        dataType: "jsonp",
                        jsonp: "callback",
                        jsonpCallback: "jsonpcallback",
                        success: function (data) {
                            console.log(JSON.stringify(data));
                        },
                        error: function (err) {
                            console.log('LOAD ERROR!')
                            console.log(err);
                        }
                    })
                };

                //加速
                that.speed += 1;
            })

        },
        move: function () {
            var that = this;


            var cellLeft = that.cssCell('left');
            var cellWidth = that.cssCell('width');


            this.cssCell('left', (cellLeft - that.speed));

            //一开始一定占据屏幕右侧 一旦开始不占据屏幕右侧就让occupied=false

            if (that.occupied) {
                cellLeft = that.cssCell('left');
                cellWidth = that.cssCell('width');


                if ((cellLeft + cellWidth + 20) < $(window).width()) {
                    that.occupied = false;
                };
            };

            //如果移动出屏幕就停止
            if (this.cssCell('left') < -cellWidth) {
                that.die();
            }
            ;
        },
        die: function () {
            var that = this;
            //删除分两步 一个是ccm数组里删除自己 另一个是 删除dom节点

            that.jqueryMap.$cell.remove(); //维护dom
            that.ccm.commentCellArr = _.without(that.ccm.commentCellArr, that); //维护ccm数组
            that = null;
            delete(that);

        },
        cssCell: function (property, value) {
            var that = this;
            if (arguments.length == 1) {
                return (parseFloat(that.jqueryMap.$cell.css(property))); //Math.floor就不会出现弹幕偶然卡住的情况了
            }
            else {
                this.jqueryMap.$cell.css(property, value);
            };
        },
    };

    //管理类与dom无关 容器只能加这里 写在弹幕类里有延迟
    function CommentCellManage(container, json) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;
        this.closeable = json.closeable;
        this.pnameable = json.pnameable;
        this.topBlank = json.topBlank;
        this.bottomBlank = json.bottomBlank;

        this.ccmH = $(this.C).height();//可能是半屏
        this.winW = $(window).width();
        this.cellH = 20;
        this.cellPaddingTop = 15;

        this.lineNumber = Math.floor(this.ccmH / (this.cellH + this.cellPaddingTop)); //弹幕应该有的行数

        this.lineResArr = [];//保存了所有行的数组 一开始是空

        this.serverCommentArr = [];//服务器的数据 json {"commentsPK":"708","uid":null,"txt":"好东东","expression":"2"},
        this.commentIndex = 0;//索引值
        this.commentCellArr = [];//commentCell对象
        this.commentLimit = 10;


        //维护的弹幕是否点赞列表
        //cellid  liked ajaxed

        this.likedObject = {};
        this.ajaxedObject = {};


        //弹幕速度属性
        this.speedHash = {
            slow: 1,
            normal: 2,
            fast: 3,
            superfast: 4,
        };
        this.speedKey = 'normal';


        //定时器相关属性
        this.moveFPS = 100;
        this.moveTimer = null;
        this.pushFPS = 2;
        this.pushTimer = null; //push严格来说是 又是push的意思了


        //产品属性
        this.pid = '';
        this.pname = '';

        //初始化...
        this.init();

    };

    CommentCellManage.prototype = {
        init: function () {
            w.ccm = this; //调试用
            this.createDom();
            this.initCSS();
            this.bindEvent();

        },
        createDom: function () {
            var pnameStr = this.pnameable ? "<div class='commentPname'></div>" : '';
            var closeStr = this.closeable ? "<div class='commentClose'>×</div>" : '';
            $(this.C).append("<div class='commentCon'></div>" + pnameStr + closeStr);

        },
        initCSS: function () {
            $(this.C).find('.commentCon').css({
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                'box-sizing': 'border-box',
                'background-color': 'rgba(0,0,0,0)',
                opacity: 1,
            });

            $(this.C).find('.commentPname').css({
                position: 'absolute',
                height: 40,
                width: $(window).width(),
                left: 0,
                top: 0,
                'font-size': '12px',
                'line-height': '40px',
                color: '#555',
                'padding-left': 20,
                'border-bottom':'1px solid #ddd'
            });

            $(this.C).find('.commentClose').css({
                position: 'absolute',
                top: 0,
                left: $(window).width() - 25,
                color: '#555',
                'font-size': '25px',
                'line-height': '40px',

            });
        },
        bindEvent: function () {
            var that = this;

            $(this.C).find('.commentClose').click(function () {
                that.pause();
                $(that.C).fadeOut();
            });

        },
        push: function () { //push是makeReady的意思了
            var that = this;

            if (that.commentCellArr.length >= that.serverCommentArr.length || that.commentCellArr.length > that.commentLimit) {
                return;
            };

            function GetRandom(begin, end) {
                return Math.floor(Math.random() * (end - begin)) + begin;
            };

            function GetTop(lineIndex) { //静态方法 根据行号返回top值
                return (lineIndex * (that.cellH + that.cellPaddingTop) + that.cellPaddingTop);
            };

            function GetLineNum() {
                that.lineResArr = [];
                for (i = 0 + that.topBlank; i < that.lineNumber - that.bottomBlank; i++) { //第一行和最后一行不能有弹幕
                    that.lineResArr.push(i);
                };

                if (that.commentCellArr.length) {
                    for (i = 0; i < that.commentCellArr.length; i++) {
                        if (that.commentCellArr[i].occupied) {
                            that.lineResArr = _.without(that.lineResArr, that.commentCellArr[i].lineNum);
                        }
                    };
                };


                //lineResArr里面存了哪几行可以插弹幕
                if (that.lineResArr.length) {
                    return that.lineResArr[GetRandom(0, that.lineResArr.length)];
                }
                else {
                    return null;
                };
            };


            //给json赋值 决定弹幕出现的行数
            var lineNum = GetLineNum(); //随机行数

            if (lineNum == null) {
                return; //说明每一行都有弹幕了
            }
            var top = GetTop(lineNum);


            var json = that.serverCommentArr[that.commentIndex];
            json.ccm = that;
            json.top = top;
            json.lineNum = lineNum;
            json.speed = that.speedHash.normal;
            that.commentCellArr.push(new CommentCell(that.C, json));

            //下标验收
            that.commentIndex = (that.commentIndex + 1) >= that.serverCommentArr.length ? 0 : (that.commentIndex + 1);
            //console.log(that.commentIndex);

        },
        move: function () {//所有弹幕动一下
            var that = this;
            //console.log(that.commentCellArr.length);
            //console.log(that.likedList);
            [].forEach.call(that.commentCellArr, function (e, i, arr) {
                if (e)e.move();
            });
        },
        //开启定时器
        start: function () {
            //循环移动
            var that = this;

            $(that.C).fadeIn();

            if (that.moveTimer) {
                console.log('Timer already exists');
                return;
            } else {
                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

                var moveStartTime = new Date().getTime();

                function innerMove() {
                    var curTime = new Date().getTime();
                    var diff = curTime - moveStartTime;

                    if (diff >= 1000 / that.moveFPS) {
                        moveStartTime = new Date().getTime();
                        that.move();
                    }
                    that.moveTimer = requestAnimationFrame(innerMove);
                };

                innerMove();


                var pushStartTime = new Date().getTime();

                function innerPush() {
                    var curTime = new Date().getTime();
                    var diff = curTime - pushStartTime;

                    if (diff >= 1000 / that.pushFPS) {
                        pushStartTime = new Date().getTime();
                        that.push()
                    };
                    that.pushTimer = requestAnimationFrame(innerPush);
                }

                innerPush();

            }
            ;

        },
        pause: function () {//关闭定时器
            var that = this;
            window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame;
            cancelAnimationFrame(that.moveTimer);
            delete(that.moveTimer);//删除定时器id
            cancelAnimationFrame(that.pushTimer);
            delete(that.pushTimer);

        },
        changeSpeed: function (speedKey) {
            var that = this;

            that.speedKey = that.speedHash.hasOwnProperty(speedKey) ? speedKey : 'normal';

            [].forEach.call(that.commentCellArr, function (e, i, arr) {
                if (e)
                    e.speed = that.speedHash[that.speedKey];
            });

        },

        //接受伪造的服务器参数
        add: function (json) {
            var that = this;
            that.serverCommentArr.splice(that.commentIndex, 0, json);//在弹幕数组中间插入
        },
        load: function (pid) { //传入php问号后面的查询参数
            var that = this;
            if (pid == that.pid) {
                that.start(); //加载完成以后开始播放
                return; //加载过了
            }

            $.ajax({
                type: "get",
                url: jimiHost + '/culletSelect.php?pid=' + pid,
                //url: 'package.json',
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "jsonpcallback",
                success: function (data) {
                    console.log(JSON.stringify(data));

                    that.pid = pid;//记录一下 没什么用
                    that.pname = data.pname;//记录一下 产品id和名字 没什么用
                    that.clear(); //清除arr列表和dom树
                    that.changePname(data.pname);
                    that.serverCommentArr = data.data;

                    setTimeout(function () {
                        that.start(); //加载完成以后开始播放
                    }, that.json.startDelay||0);
                },
                error: function (err) {
                    console.log('LOAD ERROR!')
                    console.log(err);
                }
            });
        },
        clear: function () {
            var that = this;
            that.commentCellArr = [];
            that.serverCommentArr = [];
            $(that.C).find('.commentCon').html('');
            that.commentIndex = 0;
            that.pause();
        },
        changePname: function (pname) {
            var that = this;
            $(that.C).find('.commentPname').html(pname);
        }
    };

    w.CommentCell = CommentCell;
    w.CommentCellManage = CommentCellManage;
})(window, document, jQuery);



