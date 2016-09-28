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
    function CommentCell(container, json) {
        var that = this;

        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;


        this.txt = (json.txt.length > 40) ? json.txt.substr(0, 40) + '..' : json.txt;
        //this.txt =this.ifFake ?" ":'这款宝贝,真不知道该如何评价! 刚开始使用时,失望到极致~推不匀,有浮粉现象.遮瑕几乎没有,脸上的斑点依然狰狞!令我非常之抓狂! 好不容易上完妆,郁闷的出门.半小时后的聚会,女友居然夸容光焕发,气色好!暗爽之余跑到盥洗室一瞧,嘿!果然光彩照人!果然娇家的粉底和粉球都一个德性，蕴含贝母类,利用光线折射,提升肌肤光泽度,令妆感自然并且长效不掉妆。';

        this.lineNum = json.lineNum;
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）
        this.translateX = 0; //一开始translateX是0 移动到负windowW+cellW的时候 执行die函数
        this.cellWidth = 0;

        this.speed = json.speed;
        this.commentIndex = json.commentIndex;//索引

        this.imgUrl = json.imgUrl;
        this.id = new Date().getTime().toString();
        this.commentsPK = json.commentsPK; //数据库comments表的主键
        this.reid = json.reid;//会话id
        this.uid = json.uid;

        this.userType = json.userType || 0;//普通是0 女王是12 10是机密小秘书
        this.expression = json.expression || 1;//表情是1-5

        this.occupied = true; //是否占据屏幕右侧

        //假的不透明..................................
        this.ifFake = json.ifFake;


        this.liked = false; //是否点赞了 ajax后应该是后台返
        if (GM.ccm.likedObject[that.commentsPK] == 1) {
            that.liked = true;
        }


        this.JM = this.jqueryMap = {};

        //配置文件...........................................
        this.config = {
            $dom: null,
        };

        this.init();

    };

    CommentCell.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            if (!GM.ifShare) {
                this.bindEvent();
            }
        },
        initConfig: function () {
            var that = this;

            //不等于0 就是 表情 否则1 2 //10 就是肌秘小秘书
            that.config.commentImg = (that.userType != 0) ? '<img class="commentImg" src="' + that.imgUrl + '" />' : '<img class="commentImg" src="img/expression/' + that.expression + '.png" />';

            //vip的背景只有1 2有.................................
            that.config.vipBg = (that.userType == 1 || that.userType == 2) ? '<img class="commentVipBg" src="img/vip' + that.userType + '.png" />' : '';
            if (that.userType == 0) {
                that.config.normalColor = 'rgba(0,0,0,0.45)';
                that.config.likedColor = 'rgba(56,129,224,0.9)';
            } else if (that.userType == 1) {
                that.config.normalColor = that.config.likedColor = 'rgba(255,0,42,0.45)'; // 红
            } else if (that.userType == 2) {
                that.config.normalColor = that.config.likedColor = 'rgba(238,162,0,0.55)';// 黄
            } else if (that.userType == 10) {
                that.config.normalColor = that.config.likedColor = 'rgba(56,129,224,0.9)';// 小秘书 肌秘蓝
            }
        },
        createDom: function () {
            var that = this;

            //我给每一个cell一个id值 cell+时间戳+随机数
            $(this.C).find('.commentCon').append('<div class="comment" id=cell' + that.id + '>' +
                that.config.vipBg +
                that.config.commentImg +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '<img class="commentCenterLike" src="img/like.png"/>' +
                '</div>');

            //setJqMap
            this.JM.$cell = $(this.C).find('#cell' + that.id);
        },
        initCSS: function () {
            var that = this;

            //设置当前弹幕本身的css
            this.JM.$cell.css({left: $(w).width()});
            this.JM.$cell.css({top: that.top});
            this.JM.$cell.css({
                position: 'absolute',
                display: 'block',
                'box-sizing': 'border-box',
                'font-size': '16px',
                'padding': '4px 22px',
                'border-radius': '30px',
                'background-color': that.config.normalColor,
                //opacity: 1,
                'white-space': 'nowrap',
                'z-index': that.lineNum,
                'will-change':'transform'
            });


            //设置图片
            this.JM.$cell.find('img').css({display: 'block'});

            this.JM.$cell.find('.commentVipBg').css({
                'position': 'absolute',
                top: -9,
                left: -10,
                width: '30px',
            });

            this.JM.$cell.find('.commentImg').css({
                'position': 'absolute',
                top: -2,
                left: -8,
                width: '28px',
                height: '28px',
                'border-radius': '50%'
            })

            this.JM.$cell.find('.commentTxt').css({
                color: '#fff',
                'font-size': '12px'
            });

            this.JM.$cell.find('.commentCenterLike').css({
                'position': 'absolute',
                'top': -GM.ccm.config.earMoveDistance,
                'border-radius': '50%',
                'border': '1px solid white',
                background: that.config.likedColor,
                width: 15,
                height: 15,
                padding: 2,
                display: 'none',
            });

            this.JM.$cell.find('.commentCenterLike').css({
                left: '50%',
                transform: 'translateX(-50%)'
            });

            if (that.liked) {
                this.JM.$cell.css('background', that.config.likedColor);
                this.JM.$cell.find('.commentCenterLike').show().css({
                    'top': -GM.ccm.config.earMoveDistance,
                    'opacity': 1
                });
            }
            ;

            if (that.ifFake) {
                that.JM.$cell.css({opacity: 0});
            }


            //所有的css都设置好了以后读取宽度..................................
            that.config.$dom = that.getJqueryDom();
            that.cellWidth = parseFloat(that.config.$dom.css('width'));

        },
        bindEvent: function () {
            var that = this;
            //所有绑定的事件通过事件委托放在了ccm的bindCommentCellDelegate中
        },

        move: function () {
            var that = this;
            that.translateX = that.translateX - that.speed;
            //$dom.velocity({translateX: that.translateX}, 0);
            that.config.$dom[0].style.transform = 'translateX(' + that.translateX + 'px)';
            that.config.$dom[0].style['-webkit-transform'] = 'translateX(' + that.translateX + 'px)';


            //一开始一定占据屏幕右侧 一旦开始不占据屏幕右侧就让occupied=false
            if (that.occupied) {
                if (that.translateX < -that.cellWidth) {
                    that.occupied = false;
                    GM.ccm.occupiedLineArr = _.without(GM.ccm.occupiedLineArr, that.lineNum);
                }
            }
            //本来移出就清理内存是每次move检查 现在放进ccm 定时清理..................
            else if (that.translateX < -(GM.winW + that.cellWidth)) {
                that.die();
            }
        },
        die: function () {
            var that = this;
            that.jqueryMap.$cell.remove(); //维护dom
            GM.ccm.commentCellArr = _.without(GM.ccm.commentCellArr, that); //维护ccm数组
            that = null;
            delete(that);
        },

        getJqueryDom: function () {
            var that = this;
            return that.JM.$cell;
        },
        support: function (str) {
            var that = this;
            if (str == 'up') {
                that.JM.$cell.css({backgroundColor: that.config.likedColor});
                that.JM.$cell.find('.commentCenterLike').css({'top': 0, 'display': 'block', 'opacity': 0})
                    .stop().animate({
                        'top': -GM.ccm.config.earMoveDistance,
                        'opacity': 1
                    }, 100);

            } else if (str == 'down') {
                that.JM.$cell.css({backgroundColor: that.config.normalColor});
                that.JM.$cell.find('.commentCenterLike').stop().animate({'top': 0, 'opacity': 0}, 100, function () {
                    that.JM.$cell.find('.commentCenterLike').hide();
                });
            }
        }
    };

    w.CommentCell = CommentCell;
})
(window, document, jQuery);



