# cullet.js API

	<script src='js/jquery-1.8.3.min.js'></script>
	<script src='js/underscore.js'></script>
	<script src='js/cullet-1.0.0.min.js'></script>
	<script>
		$(function () {

			var ccm = new CommentCellManage('#cullet', null); //ccm.push已经和cc灵魂绑定了 所以不用再实例化 cc
			var inputBox = new InputBox('#cullet', null);
			//循环加载弹幕
			setInterval(function () {
				ccm.push();
			}, 1000)

			ccm.start();


		})
	</script>

API：
ccm.push();添加弹幕
ccm.start();开始
ccm.pause();暂停