function twoDmsToOneDms(twoDmsArr) {
    var resArr = [];
    [].forEach.call(twoDmsArr, function (e, i, arr) {
        [].forEach.call(e, function (e2, i2, arr2) {
            resArr.push(e2);
        });

        //空三条弹幕..............
        for (i = 0; i <2; i++) {
            resArr.push(null);
        }

    })
    return resArr;
}