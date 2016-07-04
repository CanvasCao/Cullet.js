/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v5.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-6-30 22:57:31
 */

/*!
 5.0.0 加入弹幕回复 点击弹幕 弹出窗口决定点赞或评论
 */

;
(function (w, d, $, undefined) {

    //管理类与dom无关 容器只能加这里 写在弹幕类里有延迟
    function CommentCellManager(container, json) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;
        this.closeable = json.closeable;
        this.pnameable = json.pnameable;
        this.topBlank = json.topBlank;
        this.bottomBlank = json.bottomBlank;

        this.ccmH = $(this.C).height();//可能是半屏
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
        this.moveState;
        this.moveFPS = 100;
        this.moveTimer = null;
        this.pushFPS = 2.2;
        this.pushTimer = null;


        //产品属性
        this.pid = '';
        this.pname = '';

        //配置文件.............................
        this.config = {
            //两个像耳朵一样的东西上下移动的距离
            earMoveDistance: 16,
        }
        //初始化...
        this.init();

    };

    CommentCellManager.prototype = {
        init: function () {
            this.createDomAndInitCss();
            this.bindEvent();
        },
        createDomAndInitCss: function () {
            //增加弹幕容器............................................................
            var pnameStr = this.pnameable ? "<div class='commentPname'></div>" : '';
            var closeStr = this.closeable ? "<div class='commentClose'>×</div>" : '';
            $(this.C).append("<div class='commentCon'></div>" + pnameStr + closeStr);

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
                'border-bottom': '1px solid #ddd'
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
        push: function () {
            var that = this;

            //服务器的弹幕全部显示了 或者 显示数量超过limit值了........................
            if (that.commentCellArr.length >= that.serverCommentArr.length || that.commentCellArr.length > that.commentLimit) {
                return;
            }
            ;

            //给json赋值 决定弹幕出现的行数 //随机行数
            var lineNum = GetLineNum();

            //说明每一行都有弹幕了
            if (lineNum == null) {
                return;
            }
            var top = GetTop(lineNum);


            var adaptedJson = that.serverCommentArr[that.commentIndex];

            //如果是null 为了会话组间隔 当前发送轮空
            if (!adaptedJson) {
                that.commentIndex = (that.commentIndex + 1) >= that.serverCommentArr.length ? 0 : (that.commentIndex + 1);
                return;
            }
            adaptedJson.top = top;
            adaptedJson.lineNum = lineNum;
            adaptedJson.speed = that.speedHash[that.speedKey];
            adaptedJson.commentIndex = that.commentIndex;
            that.commentCellArr.push(new CommentCell(that.C, adaptedJson));

            //下标验收
            that.commentIndex = (that.commentIndex + 1) >= that.serverCommentArr.length ? 0 : (that.commentIndex + 1);


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
                }
                ;

                if (that.commentCellArr.length) {
                    for (i = 0; i < that.commentCellArr.length; i++) {
                        if (that.commentCellArr[i].occupied) {
                            that.lineResArr = _.without(that.lineResArr, that.commentCellArr[i].lineNum);
                        }
                    }
                }
                ;


                //lineResArr里面存了哪几行可以插弹幕
                if (that.lineResArr.length) {
                    return that.lineResArr[GetRandom(0, that.lineResArr.length)];
                }
                else {
                    return null;
                }
                ;
            };
        },
        move: function () {//所有弹幕动一下
            var that = this;
            [].forEach.call(that.commentCellArr, function (e, i, arr) {
                if (e)e.move();
            });
        },


        //start 就是一边move一边push
        start: function () {
            //循环移动
            var that = this;
            that.moveState = true;

            //开始的附加动作
            //所有选项图片隐藏 当前容器显示..................
            that.imgsDown($(that.C).find('.commentCon').find('.commentLike,.commentReply'));
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
                    }
                    ;
                    that.pushTimer = requestAnimationFrame(innerPush);
                }

                innerPush();

            }
            ;

        },
        pause: function () {//关闭定时器
            var that = this;
            that.moveState = false;

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

        //add只在serverCommentArr下一条 插入一条数据 定时器的push方法会自动插入这一条.................
        add: function (json) {
            var that = this;
            //在弹幕数组中间插入....................................................
            that.serverCommentArr.splice(that.commentIndex, 0, json);
        },

        //回复弹幕.................................................................
        reply: function (adaptedJson) {
            var that = this;

            var $replyedDom = GM.beReplyedCommentCell.getJqueryDom();
            var replyedLeft = parseInt($replyedDom.css('left'));
            var replyedWidth = parseInt($replyedDom.css('width'));

            adaptedJson.top = GM.beReplyedCommentCell.top;
            adaptedJson.lineNum = GM.beReplyedCommentCell.lineNum;
            adaptedJson.speed = GM.beReplyedCommentCell.speed;
            //adaptedJson.commentIndex = GM.beReplyedCommentCell.commentIndex;//? 不写也行的
            var newCommentCell = new CommentCell(that.C, adaptedJson);
            var $dom = newCommentCell.getJqueryDom();
            $dom.css({left: 2 * $(w).width()}).animate({left: replyedLeft + replyedWidth - 40}, 'normal', 'linear', function () {
                that.commentCellArr.push(newCommentCell);
                that.serverCommentArr.splice(GM.beReplyedCommentCell.commentIndex + 1, 0, adaptedJson);
            });

        },

        load: function (pid) { //传入php问号后面的查询参数
            var that = this;
            if (pid == that.pid) {
                that.start(); //加载完成以后开始播放
                return; //加载过了
            }
            controller.culletSelect(pid);
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
        },
        imgsUp: function ($dom) {
            var that = this;
            $dom.css({'top': 0, 'display': 'block', 'opacity': 0}).stop().animate({
                'top': -that.config.earMoveDistance,
                'opacity': 1
            }, 100);
        },
        imgsDown: function ($dom) {
            var that = this;
            $dom.stop().animate({'top': 0, 'opacity': 0}, 100, function () {
                $dom.hide();
            });
        },
    };
    w.CommentCellManager = CommentCellManager;
})
(window, document, jQuery);



