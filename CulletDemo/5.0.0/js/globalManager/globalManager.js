/**
 * Created by Administrator on 2016/6/30.
 */

(function (w, d, $, undefined) {
    var globalManager = {};
    var GM = globalManager;

    globalManager.JM = globalManager.jQueryMap = {};
    globalManager.beReplyedCommentCell = null;

    w.GM = w.globalManager = globalManager;
})(window, document, $);