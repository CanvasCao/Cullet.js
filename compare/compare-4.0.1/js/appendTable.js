function appendTable(ifshare) {

    //initParas
    var srcH = $(window).height();
    var srcW = $(window).width();

    var leftW = srcW * 0.24;
    var mainW = srcW * 0.38; //(100-24)/2

    //createDom..........................................................................
    $('#con').append('<div id="realdiv"></div>');
    $('#realdiv').html('<table id="real" border="0" cellspacing="0" cellpadding="0"></table>');

    $('#con').append('<div id="fakeLdiv"></div>');
    $('#fakeLdiv').html('<table id="fakeL" border="0" cellspacing="0" cellpadding="0"></table>');

    $('#con').append('<div id="fakeTdiv"></div>');
    $('#fakeTdiv').html('<table id="fakeT" border="0" cellspacing="0" cellpadding="0"></table>');

    $('#con').append('<table id="fixLT" border="0" cellspacing="0" cellpadding="0"></table>');
    $('#fixLT').html(' <tr><td>' + '<div class="hideSame">显示相同</div>' + '</td></tr>')


    //jQueryMap...........................................................................
    var JM = jqueryMap = {};
    JM.$con = $('#con');
    JM.$realdiv = $('#realdiv');
    JM.$real = $('#real');
    JM.$fakeLdiv = $('#fakeLdiv');
    JM.$fakeL = $('#fakeL');
    JM.$fakeTdiv = $('#fakeTdiv');
    JM.$fakeT = $('#fakeT');
    JM.$fixLT = $('#fixLT');
    JM.$line2 = $('#line2');
    JM.$rocket = $('#rocket');
    JM.$cullet = $('#cullet');


    $.ajax({
        type: "get",
        url: jimiHost + '/compare.php' + '?' + 'pids=' + searchJson.pids + '&cate=' + searchJson.cate,
//            url: 'r.json',
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "jsonpcallback",
        success: function (data) {
            console.log(JSON.stringify(data));
            console.log(new Date().getTime())

            var headerArr = data.header;
            var mainArr = data.table;
            var rowNum = mainArr.length;
            var colNum = mainArr[0].length;
            var totalRowLen;//不需要计算高度  宽度才要撑出来
            var totalColLen = leftW + ((colNum - 1) * mainW);//总宽 一个20%+n个40%


            //bindEvent........................................................................
            //mainData..........................................................................
            //第一行是header参数
            JM.$real.append('<tr></tr>');
            JM.$real.find('tr').eq(0).append('<td></td>'); //第一行第一格是空
            [].forEach.call(headerArr, function (e, i, arr) {
                var url = e.pic || 'img/logo.jpg';
                JM.$real.find('tr').eq(0).append('<td>' + '<img src=' + url + ' />' + e.title + '</td>');
            })


            //第二行是基本参数
            JM.$real.append('<tr></tr>')
            for (i = 0; i < headerArr.length + 1; i++) {
                JM.$real.find('tr').eq(1).append('<td>' + 'line2' + '</td>');
            }

            ////第三行弹幕
            JM.$real.append('<tr></tr>')
            JM.$real.find('tr').eq(2).append('<td></td>')//第一个不绑定打开弹幕
            for (i = 0; i < headerArr.length; i++) {//+1是因为第一行一定要少一行
                JM.$real.find('tr').eq(2).append('<td data-pid=' + headerArr[i].pid + ' >' + '<span class="openCullet">打开弹幕</span>' + '</td>');//i-1 为了第一格是undefined
            }

            //第四行开始正常绑定
            for (i = 0; i < mainArr.length; i++) {
                var row = mainArr[i];
                JM.$real.append('<tr></tr>');

                for (j = 0; j < row.length; j++) {
                    var cellData = mainArr[i][j] || '-'
                    JM.$real.find('tr').eq(i + 3).append('<td>' + cellData + '</td>'); //find('tr').eq(i + 2) 一定要+2
                }
            }
            JM.$realdiv.css({height: srcH, width: srcW});//容器
            JM.$real.css({width: totalColLen});//real必须设宽 不然table不管多宽自动宽度100%


            //mainData需要一个数组判断重复项........................................................................
            var repeatLineArr = [];
            for (i = 3; i < $('#real tr').length; i++) {//从第三行开始遍历 因为前两行不是数据
                var $tds = $('#real tr').eq(i).find('td:gt(0)');//不要第一列
                var allDataArr = [];
                $tds.each(function (index, ele) {
                    allDataArr.push($tds.eq(index).html());
                })

                if (_.unique(allDataArr).length == 1) {
                    repeatLineArr.push(i);
                }
            }


            //fakeL 绑定第一列数据..........................................................................
//                fakeL第一行是header 的第一个数据
            JM.$fakeL.append('<tr></tr>');
            JM.$fakeL.find('tr').eq(0).append('<td data="unclicked">' + '<div class="hideSame">显示相同</div>' + '</td>');

//                fakeL第二行是'line2'以后会盖掉
            JM.$fakeL.append('<tr></tr>');
            JM.$fakeL.find('tr').eq(1).append('<td data="unclicked">' + 'line2' + '</td>');

            //fakeL第三行是'line3'以后会盖掉
            JM.$fakeL.append('<tr></tr>');
            JM.$fakeL.find('tr').eq(2).append('<td data="unclicked">' + '用户弹幕' + '</td>');


            for (i = 0; i < mainArr.length; i++) {
                JM.$fakeL.append('<tr></tr>');
                JM.$fakeL.find('tr').eq(i + 3).append('<td data="unclicked">' + mainArr[i][0] + '</td>');
            }
            JM.$fakeLdiv.css({height: srcH, width: leftW});//fakeLdiv是个容器 宽度20% 高度必须是屏幕高


            //fakeTop 绑定数据............................................................................
            $('#fakeT').append('<tr></tr>');
            //第一行第一格是空
            $('#fakeT').find('tr').eq(0).append('<td>' + '</td>')
            //第一行第二格开始绑定数据
            for (i = 0; i < headerArr.length; i++) {
                $('#fakeT').find('tr').append('<td>' + headerArr[i]['title'] + '</td>');
            }
            $('#fakeTdiv').css({width: srcW});//fakeTdiv是个容器
            $('#fakeT').css({width: totalColLen});


            //td设宽度.....................................................................................
            $('td').each(function (i, e) {
                $(e).index() == 0 ? $(e).css({width: leftW}) : $(e).css({width: mainW});
                //如果是左一列就是总宽的20%否则就是总宽的40%
            });

            //同步左右表高度 fakeL里面每一个td的高度要根据mainData的每个td的高度来决定.............................
            $('#fakeLdiv td').each(function (i, e) {
                var height = $('#real tr').eq(i).css('height');
                $(e).css({height: height});
            })

            //同步line2 高度和top值
            var line2Height = $('#real tr').eq(1).css('height');
            $('#line2').css({height: line2Height})

            var line2Top = $('#real tr').eq(0).css('height');
            $('#line2').css({top: line2Top})

            $('#line2>div').css({'height': '100%', 'line-height': line2Height, 'display': 'inline-block'});
            $('#line2col1').css({'width': (leftW), 'float': 'left'});


            if (!ifshare) {
                $('#line2col2').css({
                    'width': (mainW * 2),
                    'float': 'right',
                    'box-sizing': 'border-box',
                    'padding-right': 20,
                    'text-align': 'right'
                })
            } else {
                $('#line2col2').css({
                    'width': mainW,
                    'float': 'left',
                    'box-sizing': 'border-box',
                    'text-align': 'right'
                })
            }


            // 同步完左右表高度 同步fixLT高度................................................................
            var realLine1Height = $('#real tr').eq(0).height();
            var fakeTLine1Height = $('#fakeT tr').eq(0).height();
            JM.$fixLT.css({height: fakeTLine1Height});


            //滚动跟随效果..................................................................................
            var scrollTopValue;//scrollTopValue就是往上Scroll多少就开始hide和show了
            scrollTopValue = realLine1Height - fakeTLine1Height;
            //滚动跟随效果
            JM.$realdiv.scroll(function () {
                var curScrollTop = $(this).scrollTop();
                var curScrollLeft = $(this).scrollLeft();


                JM.$fakeLdiv.scrollTop(curScrollTop);
                JM.$fakeTdiv.scrollLeft(curScrollLeft);

                if (curScrollTop >= scrollTopValue) {
                    JM.$fakeTdiv.css({opacity: 1});
                    JM.$fixLT.css({opacity: 1});
                    JM.$line2.css('top', fakeTLine1Height);
                    JM.$rocket.show();
                }
                else {
                    JM.$fakeTdiv.css({opacity: 0});
                    JM.$fixLT.css({opacity: 0});

                    JM.$line2.css('top', realLine1Height - curScrollTop);
                    JM.$rocket.hide();
                }
            })


            //点击变换shadow....................................................................
            JM.$fakeL.find('td').click(function () {
                var index = $(this).parent().index()
                if (index >= 3) {
                    ChangeShadow(index);
                }

            })

            JM.$realdiv.find('td').click(function () {
                var index = $(this).parent().index()
                if (index >= 3) {
                    ChangeShadow(index);
                }
            })


            function ChangeShadow(index) {
                if (JM.$fakeL.find('td').eq(index).attr('data') == 'unclicked') {
                    JM.$fakeL.find('td').eq(index).css({
                        'box-shadow': 'inset 0px 5px 10px rgba(113,187,230,0.3)',
                        'background-color': '#e7f4ff',
                        'color': '#3982e1'
                    });
                    JM.$realdiv.find('tr').eq(index).find('td').css({
                        'background-color': '#e7f4ff'
                    });

                    JM.$fakeL.find('td').eq(index).attr('data', 'clicked');
                }
                else {
                    JM.$fakeL.find('td').eq(index).css({
                        'box-shadow': 'inset -10px 0px 10px rgba(0, 0, 0, 0.1)',
                        'backgroundColor': 'white',
                        'color': '#666',
                    });
                    JM.$fakeL.find('td').eq(index).attr('data', 'unclicked');
                    JM.$realdiv.find('tr').eq(index).find('td').css({
                        'background-color': 'white'
                    })
                }
            }

            //火箭点击上升...........................................................
            JM.$rocket.click(function () {
                JM.$realdiv.animate({'scrollTop': 0}, 'normal');
            })


            //隐藏相同...............................................................
            //初始化先toggleSame一次
            toggleSame();
            JM.$hideSame = $('.hideSame');
            JM.$hideSame.parent().click(function () {
                JM.$hideSame.html() == '隐藏相同' ? JM.$hideSame.html('显示相同') : JM.$hideSame.html('隐藏相同');
                toggleSame();
            })

            function toggleSame() {
                [].forEach.call(repeatLineArr, function (e, i, arr) {
                    JM.$realdiv.find('tr').eq(e).toggle();
                    JM.$fakeL.find('tr').eq(e).toggle();
                })
            }


            //干他妈方辉的a标签.............................................................
            //第一行第二格开始添加a标签并且绑定事件 需要跳转
            var aCssJSON = {
                'position': 'absolute',
                'width': '100%',
                'height': '100%',
                'top': 0,
                'left': 0,
            };
            JM.$real.find('tr').eq(0).find('td:gt(0)').each(function (i, e) {
                $(e).append('<a></a>');
            })
            JM.$real.find('a').css(aCssJSON).each(function (i, e) {
                $(e).attr('href', headerArr[i]['pidHref']);
            })


            //第二格开始绑定手机内跳转事件...............................................................
            $('#fakeT').find('td:gt(0)').each(function (i, e) {
                $(e).append('<a></a>');
            })
            $('#fakeT').find('a').css(aCssJSON).each(function (i, e) {
                $(e).attr('href', headerArr[i]['pidHref']);
            })


            //弹幕..................................................................................
            var ccm = new CommentCellManage('#cullet',
                {
                    serverUrl: jimiHost + '/culletSelect.php',
                    closeable: true,
                    pnameable: true,
                    topBlank: 1,
                    bottomBlank: 2
                }
            );

            if (!ifshare) {
                var jimiInputBox = new JimiInputBox('.jimiInputBox',
                    {ccm: ccm});
            }

            JM.$cullet[0].addEventListener('touchmove', function (e) {
            }, false)


            //加载弹幕....................................................................
            JM.$real.find('tr').eq(2).find('td').click(function () {
                var pid = ($(this).attr('data-pid'));
                ccm.load(pid);
            })

            console.log(new Date().getTime());


        },
        error: function (err) {
            console.log('ERROR!')
            console.log(err);
        }
    });
}