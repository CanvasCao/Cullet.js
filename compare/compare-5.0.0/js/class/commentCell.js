/**
 * Created by Administrator on 2016/7/1.
 */
;
(function (w, d, $, undefined) {

//弹幕CommentCell与dom有关 因为dom是他的表现层
    function CommentCell(container, json) {
        var that = this;
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.json = json;

        this.txt = (json.txt.length > 18) ? json.txt.substr(0, 18) + '..' : json.txt;
        this.lineNum = json.lineNum;//不能不给
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）
        this.speed = json.speed;
        this.commentIndex = json.commentIndex || -1;//索引

        this.imgUrl = json.imgUrl;
        this.id = new Date().getTime().toString() + parseInt(Math.random() * 10000);//时间戳+随机数
        this.commentsPK = json.commentsPK; //数据库comments表的主键 作为id
        this.reid = json.reid;

        this.userType = json.userType || 0;//普通是0 女王是12
        this.expression = json.expression || 1;//表情是1-5

        this.occupied = true; //是否占据屏幕右侧
        this.liked = false; //是否点赞了 ajax后应该是后台返
        if (GM.ccm.likedObject[that.commentsPK] == 1) {
            that.liked = true;
        }

        this.JM = this.jqueryMap = {};

        this.config = {};

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

            //不等于0 就是 表情 否则1 2 10 就是头像
            that.config.commentImg = (that.userType != 0) ? '<img class="commentImg" src="' + that.imgUrl + '" />' : '<img class="commentImg" src="img/expression/' + that.expression + '.png" />';

            //vip的背景只有1 2有
            that.config.vipBg = (that.userType == 1 || that.userType == 2) ? '<img class="commentVipBg" src="img/vip' + that.userType + '.png" />' : '';
            if (that.userType == 0) {
                that.config.normalColor = 'rgba(0,0,0,0.45)';
                that.config.likedColor = 'rgba(56,129,224,0.9)';
            } else if (that.userType == 1) {
                that.config.normalColor = that.config.likedColor = 'rgba(255,0,42,0.45)';
            } else if (that.userType == 2) {
                that.config.normalColor = that.config.likedColor = 'rgba(238,162,0,0.55)';
            } else if (that.userType == 10) {
                that.config.normalColor = that.config.likedColor = 'rgba(56,129,224,0.9)';
            }
        },
        createDom: function () {
            var that = this;

            //我给每一个cell一个id值 cell+时间戳+随机数
            $(this.C).find('.commentCon').append('<div class="comment" id=cell' + that.id + '>' +
                that.config.vipBg +
                that.config.commentImg +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '<img class="commentLike" src="img/like.png"/>' +
                '<img class="commentReply" src="img/reply.png"/>' +
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
                //'border': '1px solid white',
                'background-color': that.config.normalColor,
                opacity: 1,
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

            this.JM.$cell.find('.commentLike,.commentReply,.commentCenterLike').css({
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

            this.JM.$cell.find('.commentReply').css({
                left: '-15px',
            })
            this.JM.$cell.find('.commentLike').css({
                left: '7px',
            });

            this.JM.$cell.find('.commentCenterLike').css({
                left: '50%',
                transform: 'translateX(-50%)'
            })

            if (that.liked) {
                this.JM.$cell.css('background', that.config.likedColor);
                this.JM.$cell.find('.commentCenterLike').show().css({
                    'top': -GM.ccm.config.earMoveDistance,
                    'opacity': 1
                });
            }
            ;

        },
        bindEvent: function () {
            var that = this;

            //初次点击 出现 喜欢和回复的选项图片.......................................
            //ccm的是否在移动state改变...............................................
            this.JM.$cell.click(function () {
                GM.changeState('add');

                if (GM.ccm.moveState) {
                    GM.ccm.pause();

                    //暂停附加动作 是让当前弹幕的 选项显示............................
                    GM.ccm.imgsUp(that.JM.$cell.find('.commentLike,.commentReply'));
                } else {
                    GM.ccm.start();
                }
            });


            //点赞逻辑.......................................
            this.JM.$cell.find('.commentLike').click(function (e) {
                e.stopPropagation();

                //恢复回复弹幕到添加弹幕的状态........................
                GM.changeState('add');


                if (that.liked) {
                    GM.ccm.likedObject[that.commentsPK] = 0;
                    that.JM.$cell.css({backgroundColor: that.config.normalColor});
                    GM.ccm.imgsDown(that.JM.$cell.find('.commentCenterLike'));
                } else {
                    GM.ccm.likedObject[that.commentsPK] = 1;
                    that.JM.$cell.css({backgroundColor: that.config.likedColor});
                    GM.ccm.imgsUp(that.JM.$cell.find('.commentCenterLike'));
                }
                that.liked = !that.liked;
                GM.ccm.start();

                //ajax........................................................
                if (!that.commentsPK) {//没有服务器主键说明不用ajax
                    return;
                }
                ;

                //给服务器发ajax点赞
                //if (!GM.ccm.ajaxedObject.hasOwnProperty(that.commentsPK)) {//没有
                //    GM.ccm.ajaxedObject[that.commentsPK] = 1;
                //
                //    controller.cullectSupport({commentId: that.commentsPK}, null);
                //}
                //;
            });


            //回复逻辑..........................................................
            this.JM.$cell.find('.commentReply').click(function (e) {
                e.stopPropagation();
                GM.changeState('reply');

                //记录被回复弹幕..................................
                GM.beReplyedCommentCell = that;

                //jsBridge不使用本行..............................
                GM.inputBox.C.find('input').focus();

            });

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

                if ((cellLeft + cellWidth + 20) < $(w).width()) {
                    that.occupied = false;
                }
                ;
            }
            ;

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
            GM.ccm.commentCellArr = _.without(GM.ccm.commentCellArr, that); //维护ccm数组
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
            }
            ;
        },
        getJqueryDom: function () {
            var that = this;
            return that.JM.$cell;
        }
    };

    w.CommentCell = CommentCell;
})
(window, document, jQuery);



