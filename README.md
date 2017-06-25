# cullet.js #
浏览器端加载

	<script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="http://apps.bdimg.com/libs/underscore.js/1.7.0/underscore-min.js"></script>
	<script src='js/class/commentCellManager-7.0.0.js'></script>
	<script src='js/class/commentCell-7.0.0.js'></script>
	<script>
		$(function () {
			    //弹幕............................................................
                var ccm = new CommentCellManager('#cullet',
                    {
                        serverUrl:  'json/culletSelect.json',
                        closeable: false,
                        pnameable: false,
                        topBlank: 0,
                        bottomBlank: 1,
                        startDelay: 1,
                        pushALG: 'top-down',
                    }
                );

                //根据产品id加载弹幕...........................................................
                ccm.load(searchJson.pid);

		})
	</script>


后端返回的弹幕数据demo（暂无时间轴）

	{"data":[
	  {"txt":"【成龙】Duang！"},
	  {"txt":"这个bgm不是极乐净土"},
	  {"txt":"求雷军的心理面积"},
	  {"txt":"前方高能 非战斗人员紧急撤离"},
	  {"txt":"233333333333"},
	  {"txt":"妈妈问我为什么跪着看电脑_(:_」∠)_"},
	  {"txt":"哈哈开口跪"},
	  {"txt":"不就是要膝盖吗 给你好了！！！"},
	  {"txt":"掺了金坷垃 一袋能顶两袋撒"}
	]}