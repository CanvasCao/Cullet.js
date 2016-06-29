//只能渲染颜色块  类对象
function TableBlock(json, ctx, data) {
    this.ctx = ctx;
    this.columnNum = json.columnNum;//columnNum
    this.rowNum = json.rowNum;//rowNum
    this.locX = json.locX; //数据块起始位置 以后会移动
    this.locY = json.locY;
    this.cellX = json.cellX;
    this.cellY = json.cellY;
    this.strokeStyle = json.strokeStyle || "#bbb";
    this.data = data || [[""]]; //保存数据的二维数组
    this.Render();
}

TableBlock.prototype = {

    FixLocation: function (dx, dy) {
        this.locX += dx;
        this.locY += dy;
    },
    Render: function (dx, dy) { //dxdy是手指滑动中的修正值
        this.ctx.fillStyle = this.fillStyle;
        dx = dx === undefined ? 0 : dx;
        dy = dy === undefined ? 0 : dy;//这两行只在忘记传值的时候有用(构造函数简写有用)

        //画网格
        for (i = 0; i <= (this.rowNum - 1); i++) { //rowNum就是几行的意思 遍历行
            for (j = 0; j <= (this.columnNum - 1); j++) {
                this.ctx.save();

                //画矩形
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.strokeStyle;
                //X+偏移量+ 几个j就偏移了几个cellX
                this.ctx.strokeRect(this.locX + dx + j * this.cellX, this.locY + dy + i * this.cellY, this.cellX, this.cellY);
                //矩形填充白色背景
                this.ctx.beginPath();
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(this.locX + dx + j * this.cellX, this.locY + dy + i * this.cellY, this.cellX, this.cellY)

                //写字
                this.ctx.beginPath();
                this.ctx.fillStyle = 'black';

                var textHeight = parseInt(this.ctx.font);
                var txtValue = this.data[i][j];
                var textWidth = this.ctx.measureText(txtValue).width;
                var cellX = this.cellX;

                //不一样的宽度文字画的行数还不一样
                if (textWidth > cellX) {
                    //算出是哪一个字符开始溢出的
                    var res = 0; //res是溢出的哪一个字符
                    for (i = 0; i < txtValue.length; i++) {
                        var subTxt = txtValue.substring(0, i);
                        var subTxtWidth = this.ctx.measureText(subTxt).width;
                       // console.log(subTxt+"   "+subTxtWidth)
                        if (subTxtWidth > cellX) {
                            //res = i;
                            //alert(subTxtWidth);
                            //return;
                        }
                    }
                }
                else {
                    this.ctx.fillText(txtValue, this.locX + dx + j * this.cellX + this.cellX / 2, this.locY + dy + i * this.cellY + this.cellY / 2);
                }

                this.ctx.restore();
            }
        }
    }

}
