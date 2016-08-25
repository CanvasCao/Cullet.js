//jsBridge不使用本行..............................
if (GM.version == 'Android') {
    var reid = (GM.beReplyedCommentCell.reid == 0) ? GM.beReplyedCommentCell.commentsPK : GM.beReplyedCommentCell.reid;
    var retxt = GM.beReplyedCommentCell.txt;
    var reuid = GM.beReplyedCommentCell.uid;
    var recid = GM.beReplyedCommentCell.commentsPK;
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
}
else if (GM.version == 'IOS') {
    setupWebViewJavascriptBridge(function (bridge) {
        //回复逻辑
        that.JM.$cell.find('.commentReply').click(function (e) {
            e.stopPropagation();
            GM.changeState('reply');

            GM.beReplyedCommentCell = that;
            var reid = (GM.beReplyedCommentCell.reid == 0) ? GM.beReplyedCommentCell.commentsPK : GM.beReplyedCommentCell.reid;
            var retxt = GM.beReplyedCommentCell.txt;
            var reuid = GM.beReplyedCommentCell.uid;
            var recid = GM.beReplyedCommentCell.commentsPK;
            bridge.callHandler('testObjcCallback', {
                inputBoxFocus: {
                    reid: reid,
                    reuid: reuid,
                    recid: recid,
                    retxt: retxt,
                }
            }, function (response) {
            })
        });
    })
}
else {
    GM.inputBox.C.find('input').focus();
}