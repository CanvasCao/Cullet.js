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