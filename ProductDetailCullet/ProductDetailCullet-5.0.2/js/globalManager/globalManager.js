/**
 * Created by Administrator on 2016/6/30.
 */

(function (w, d, $, undefined) {
    var globalManager = {};
    var GM = globalManager;

    GM.JM = GM.jQueryMap = {};

    //globalManager.ccm = null;
    //globalManager.inputBox = null;
    GM.beReplyedCommentCell = null;

    //add代表插入 reply代表回复 是增加弹幕还是回复弹幕的状态 //原来是状态机
    GM.state = 'add';
    GM.changeState = function (state) {
        GM.state = state;
        if (GM.inputBox) {
            GM.inputBox.changeState(state);
        }

    }

    w.GM = w.globalManager = globalManager;
})(window, document, $);