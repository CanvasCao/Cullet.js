/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v7.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-9-20 11:13:16
 */


;
(function (w, d, $, undefined) {

    //管理类与dom无关 容器只能加这里 写在弹幕类里有延迟
    function CommentCellManager(container, json) {

        //记录AnimationFrame..........................
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame;

        this.C = this.container = (typeof container == 'string') ? $(container) : container;

        this.closeable = json.closeable;
        this.pnameable = json.pnameable;
        this.topBlank = json.topBlank || 0;
        this.bottomBlank = json.bottomBlank || 0;
        this.startDelay = json.startDelay || 1;
        this.pushALG = json.pushALG || 'stick'//默认黏连

        this.ccmH = $(this.C).height();//可能是半屏
        this.cellH = 20;
        this.cellPaddingTop = 15;

        this.lineNumber = Math.floor(this.ccmH / (this.cellH + this.cellPaddingTop)); //弹幕应该有的行数
        this.allLineNumArr = [];//保存了所有行的数组 一开始是空..................................
        this.occupiedLineArr = [];//占据的行数的维护列表...........................................


        this.serverCommentArr = [];//服务器的数据 json {"commentsPK":"708","uid":null,"txt":"好东东","expression":"2"},
        this.commentIndex = 0;//索引值
        this.commentCellArr = [];//commentCell对象 的数组
        this.commentLimit = 15;

        //最后一行的行数为了之后的弹幕能连起来 pushALG==stick用.................
        this.lastLineNum = 0;


        //维护的弹幕是否点赞列表
        //cellid  liked ajaxed
        this.likedObject = {};
        this.ajaxedObject = {};//暂时用不到


        //弹幕速度属性.............................
        this.speedHash = {
            slow: 1,
            normal: 2,
            fast: 3,
            superfast: 4,
        };
        this.speedKey = 'normal';


        //定时器相关属性.............................
        this.moveState = null;//标记位
        this.moveFPS = 1000;
        this.moveTimer = null;
        this.pushFPS = 2.8;
        this.pushTimer = null;


        //产品属性
        this.pid = '';
        this.pname = '';

        //配置文件...............................
        this.config = {
            //两个像耳朵一样的东西上下移动的距离
            earMoveDistance: 16,
        }
        //初始化.................................
        this.init();

    };

    CommentCellManager.prototype = {
        init: function () {
            this.createContainerAndInitCss();
            this.createMenuAndInitCss();
            this.bindEvent();

            if (!GM.ifShare) {
                this.bindCommentCellDelegate();
            }
        },
        createContainerAndInitCss: function () {
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
                width: $(w).width(),
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
                right: 15,
                color: '#555',
                'font-size': '25px',
                'line-height': '40px',
            });
        },
        createMenuAndInitCss: function () {
            //全局的点击回复 点赞.................................
            $(this.C).append('<div id="commentMenu"><img class="commentLike" src="img/like.png"/>' +
                '<img class="commentReply" src="img/reply.png"/></div>');


            $(this.C).find('#commentMenu').css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                display: 'none',
                'white-space': 'nowrap',
                'z-index': 999,
            });
            $(this.C).find('.commentLike,.commentReply').css({
                'border-radius': '50%',
                'border': '1px solid white',
                background: 'black',
                width: 15,
                height: 15,
                padding: 2,

            });
        },
        bindEvent: function () {
            var that = this;

            $(this.C).find('.commentClose').click(function () {
                that.pause();
                $(that.C).fadeOut();
            });


            //点赞逻辑.......................................
            $(this.C).find('.commentLike').click(function (e) {
                e.stopPropagation();

                //恢复回复弹幕到添加弹幕的状态........................
                GM.changeState('add');

                var bchc = GM.beChoosedComment;
                if (bchc.liked) {
                    GM.ccm.likedObject[bchc.commentsPK] = 0;
                    bchc.support('down');
                } else {
                    GM.ccm.likedObject[bchc.commentsPK] = 1;
                    bchc.support('up');
                }
                bchc.liked = !bchc.liked;
                GM.ccm.start();

            });


            console.log(GM.version);
            ////回复逻辑..........................................................
            if (GM.version == 'Android') {
                $(that.C).find('.commentReply').click(function (e) {
                    e.stopPropagation();
                    GM.changeState('reply');

                    var reid = (GM.beChoosedComment.reid == 0) ? GM.beChoosedComment.commentsPK : GM.beChoosedComment.reid;
                    var retxt = GM.beChoosedComment.txt;
                    var reuid = GM.beChoosedComment.uid;
                    var recid = GM.beChoosedComment.commentsPK;
                    var json = {
                        inputBoxFocus: {
                            reid: reid,
                            reuid: reuid,
                            recid: recid,
                            retxt: retxt,
                        }
                    };
                    androidJsBridge.webToAndroid(JSON.stringify(json));
                    ;
                })

            }
            else if (GM.version == 'IOS') {
                setupWebViewJavascriptBridge(function (bridge) {
                    //回复逻辑
                    $(that.C).find('.commentReply').click(function (e) {
                        e.stopPropagation();
                        GM.changeState('reply');
                        var reid = (GM.beChoosedComment.reid == 0) ? GM.beChoosedComment.commentsPK : GM.beChoosedComment.reid;
                        var retxt = GM.beChoosedComment.txt;
                        var reuid = GM.beChoosedComment.uid;
                        var recid = GM.beChoosedComment.commentsPK;
                        bridge.callHandler('testObjcCallback', {
                            inputBoxFocus: {
                                reid: reid,
                                reuid: reuid,
                                recid: recid,
                                retxt: retxt,
                            }
                        }, function (response) {
                        })
                    })
                })

            }


            else if (GM.version == 'web') {
                $(that.C).find('.commentReply').click(function (e) {
                    e.stopPropagation();
                    GM.changeState('reply');
                    GM.inputBox.C.find('input').focus();

                })
            }


        },
        bindCommentCellDelegate: function () {
            var that = this;
            $(document).click(function (e) {
                var target = e.target;
                var $comment = $(target).closest(".comment")
                if ($comment.length > 0) {
                    GM.changeState('add');
                    if (GM.ccm.moveState) {
                        GM.$beChoosedComment = $comment;
                        GM.beChoosedComment = that._GetObjCellFromJqCell($comment);
                        GM.clickPosition = {x: e.clientX, y: e.clientY};
                        GM.ccm.pause();
                    } else {
                        GM.ccm.start();
                        GM.$beChoosedComment = null;
                        GM.beChoosedComment = null;
                    }
                }
            })
        },
        push: function () {
            var that = this;

            //服务器的弹幕全部显示了 或者 显示数量超过limit值了 这一次就不push........................
            if (that.commentCellArr.length >= that.serverCommentArr.length || that.commentCellArr.length > that.commentLimit) {
                return;
            }
            ;

            //给json赋值 决定弹幕出现的行数 //随机行数
            var lineNum = that._GetLineNum();

            //说明每一行都有弹幕了...................................
            if (lineNum == null) {
                return;
            }
            var top = that._GetTop(lineNum);


            var adaptedJson = that.serverCommentArr[that.commentIndex];

            //如果是null 为了会话组间隔 当前发送ifFake弹幕....................
            if (!adaptedJson) {
                adaptedJson = {
                    txt: '',
                    ifFake: true,
                };
            }

            adaptedJson.top = top;
            adaptedJson.lineNum = lineNum;
            adaptedJson.speed = that.speedHash[that.speedKey];
            adaptedJson.commentIndex = that.commentIndex;
            that.commentCellArr.push(new CommentCell(that.C, adaptedJson));

            //push以后记录一下最后一行的行数..............................
            that.lastLineNum = adaptedJson.lineNum;

            //行数列表维护............................................
            that.occupiedLineArr.push(adaptedJson.lineNum);


            //下标验收...................................................
            that.commentIndex = (that.commentIndex + 1) >= that.serverCommentArr.length ? 0 : (that.commentIndex + 1);

        },

        _GetRandom: function (begin, end) {
            return Math.floor(Math.random() * (end - begin)) + begin;
        }
        ,
        _GetTop: function (lineIndex) { //静态方法 根据行号返回top值
            var that = this;
            return (lineIndex * (that.cellH + that.cellPaddingTop) + that.cellPaddingTop);
        }
        ,
        _GetLineNum: function () {
            var that = this;
            that.allLineNumArr = [];
            for (i = 0 + that.topBlank; i < that.lineNumber - that.bottomBlank; i++) {
                that.allLineNumArr.push(i);
            }
            ;

            if (that.pushALG == 'stick') {

                if (that.commentCellArr.length) {
                    that.allLineNumArr = _.difference(that.allLineNumArr, that.occupiedLineArr);
                    //上一步计算出了所有的没有occupy的行数 现在我去并上上一条的+-1的行数 计算出最后可以随机的行数
                    that.allLineNumArr = _.intersection(that.allLineNumArr, [that.lastLineNum - 1, that.lastLineNum, that.lastLineNum + 1]);
                }
                ;
                //allLineNumArr里面存了哪几行可以插弹幕
                var res = (that.allLineNumArr.length) ? that.allLineNumArr[GetRandom(0, that.allLineNumArr.length)] : null;
                return res;
            } else if (that.pushALG == 'top-down') {
                that.allLineNumArr = _.difference(that.allLineNumArr, that.occupiedLineArr);
                //allLineNumArr里面存了哪几行可以插弹幕...........................................
                var res = (that.allLineNumArr.length) ? that.allLineNumArr[0] : null;
                return res;
            }
        }
        ,
        move: function () {//所有弹幕动一下
            var that = this;
            [].forEach.call(that.commentCellArr, function (e, i, arr) {
                if (e)e.move();
            });
        }
        ,


        //start 就是一边move一边push
        start: function () {
            //循环移动
            var that = this;
            that.moveState = true;

            that.menuHide();

            $(that.C).fadeIn();

            if (that.moveTimer) {
                console.log('Timer already exists');
                return;
            } else {

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

        }
        ,
        pause: function () {//关闭定时器
            var that = this;
            that.moveState = false;


            that.menuShow();

            cancelAnimationFrame(that.moveTimer);
            delete(that.moveTimer);//删除定时器id
            cancelAnimationFrame(that.pushTimer);
            delete(that.pushTimer);

        }
        ,

        //只在控制台调用..........................................................
        changeSpeed: function (speedKey) {
            var that = this;

            that.speedKey = that.speedHash.hasOwnProperty(speedKey) ? speedKey : 'normal';

            [].forEach.call(that.commentCellArr, function (e, i, arr) {
                if (e)
                    e.speed = that.speedHash[that.speedKey];
            });

        }
        ,

        //add只在serverCommentArr下一条 插入一条数据 定时器的push方法会自动插入这一条.................
        add: function (json) {
            var that = this;
            //在弹幕数组中间插入....................................................
            that.serverCommentArr.splice(that.commentIndex, 0, json);
        }
        ,

        //回复弹幕方法.................................................................
        reply: function (adaptedJson) {
            var that = this;

            var replyedtTranslateX = GM.beChoosedComment.translateX;

            var replyedWidth = parseInt(GM.$beChoosedComment.css('width'));

            adaptedJson.top = GM.beChoosedComment.top;
            adaptedJson.lineNum = GM.beChoosedComment.lineNum;
            adaptedJson.speed = GM.beChoosedComment.speed;
            ////adaptedJson.commentIndex = GM.beChoosedComment.commentIndex;//? 不写也行的
            var newCommentCell = new CommentCell(that.C, adaptedJson);
            var $dom = newCommentCell.getJqueryDom();
            $dom.velocity({translateX: 0}, 0).velocity({translateX: replyedtTranslateX + replyedWidth - 30}, 'fast', 'linear', function () {

                GM.changeState('add');
                newCommentCell.translateX = replyedtTranslateX + replyedWidth - 30;
                that.commentCellArr.push(newCommentCell);
                //console.log("============" + GM.beChoosedComment.commentIndex);
                that.serverCommentArr.splice(GM.beChoosedComment.commentIndex + 1, 0, adaptedJson);
            });
        }
        ,

        load: function (pid) { //传入php问号后面的查询参数
            var that = this;
            if (pid == that.pid) {
                that.start(); //加载完成以后开始播放
                return; //加载过了
            }
            controller.culletSelect(pid);
        }
        ,
        clear: function () {
            var that = this;
            that.commentCellArr = [];
            that.serverCommentArr = [];
            that.occupiedLineArr = [];
            $(that.C).find('.commentCon').html('');
            that.commentIndex = 0;
            that.pause();
        }
        ,
        changePname: function (pname) {
            var that = this;
            $(that.C).find('.commentPname').html(pname);
        }
        ,

        menuShow: function () {
            var that = this;
            if (!GM.beChoosedComment) {
                return;
            }
            $(that.C).find('#commentMenu .commentLike,.commentReply').css({
                background: GM.beChoosedComment.config.likedColor,
            })


            $(this.C).find('#commentMenu').show()
                .css({
                    //top: GM.clickPosition.y,
                    top: that._GetTop(GM.beChoosedComment.lineNum),
                    left: GM.clickPosition.x,
                    transform: 'translateX(-50%)',
                    opacity: 0,
                })
                .stop()
                .animate({
                    top: that._GetTop(GM.beChoosedComment.lineNum) - that.config.earMoveDistance,
                    opacity: 1,
                }, 100, 'swing');
        }
        ,
        menuHide: function () {
            var that = this;
            if (!GM.beChoosedComment) {
                return;
            }
            $(this.C).find('#commentMenu')
                .stop()
                .animate({
                    top: that._GetTop(GM.beChoosedComment.lineNum),
                    opacity: 0,
                }, 100, 'swing', function () {
                    $(this.C).find('#commentMenu').hide();
                })
        }
        ,
        _GetObjCellFromJqCell: function ($dom) {
            var that = this;

            var id = $dom[0].id;

            for (i = 0; i < that.commentCellArr.length; i++) {
                if ('cell' + that.commentCellArr[i].id == id) {
                    return that.commentCellArr[i];
                }
            }
            ;

        }
    };
    w.CommentCellManager = CommentCellManager;
})
(window, document, jQuery);



