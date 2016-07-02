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

    //add代表插入 reply代表回复
    globalManager.state = 'add';
    globalManager.changeState = function (state) {
        GM.state = state;
        if(GM.inputBox){
            GM.inputBox.changeState(state);
        }

    }

    w.GM = w.globalManager = globalManager;
})(window, document, $);