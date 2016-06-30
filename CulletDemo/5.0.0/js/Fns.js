function twoDmsToOneDms(twoDmsArr) {
    var resArr = [];
    [].forEach.call(twoDmsArr, function (e, i, arr) {
        [].forEach.call(e, function (e2, i2, arr2) {
            resArr.push(e2);
        })
        resArr.push(null);
        resArr.push(null);
        resArr.push(null);
    })
    return resArr;
}