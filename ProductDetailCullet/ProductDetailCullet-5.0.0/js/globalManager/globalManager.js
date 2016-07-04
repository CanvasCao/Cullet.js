/**
 * Created by Administrator on 2016/6/30.
 */

(function (w, d, $, undefined) {
    var globalManager = {};
    var GM = globalManager;

    globalManager.JM = globalManager.jQueryMap = {};

    globalManager.ccm = null;
    globalManager.inputBox = null;
    globalManager.beReplyedCommentCell = null;

    //add代表插入 reply代表回复 是增加弹幕还是回复弹幕的状态
    globalManager.state = 'add';
    globalManager.changeState = function (state) {
        GM.state = state;
        if (GM.inputBox) {
            GM.inputBox.changeBtn(state);
        }

    }

    GM.version = '';

    w.GM = w.globalManager = globalManager;
})(window, document, $);