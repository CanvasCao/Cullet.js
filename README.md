# cullet.js API

	<script src='js/jquery-1.8.3.min.js'></script>
	<script src='js/underscore.js'></script>
	<script src='js/cullet-1.0.0.min.js'></script>
	<script>
		$(function () {

			    var ccm = new CommentCellManage('#cullet', {serverUrl: 'http://n1.jimi.la/apps_T1/culletSelect.php'});

				var inputBox = new InputBox('#cullet', null, ccm);

				ccm.load();


		})
	</script>

API：天天变懒得写 请留言