/**
 * Created by Administrator on 2016/3/10.
 */
var CC={}

//输入鼠标在屏幕的xy 返回canvas画布的xy
CC.windowToCanvas=function windowToCanvas(canvas, clientX, clientY) {
    var boundingRect = canvas.getBoundingClientRect();

    return {
        //鼠标的x-boundingRect的x
        x: (clientX - boundingRect.left) / (boundingRect.width / canvas.width), //boundingRect.width/canvas.width就是放大的倍数
        y: (clientY - boundingRect.top) / (boundingRect.height / canvas.height)
    }

}
