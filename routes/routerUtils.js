var RouterUtils = function () {

};

RouterUtils.prototype = {
    indexOf_Id: function (array, id) {
        var index = -1;
        for (var i = 0; i < array.length; i++) {
            console.log(array[i].toString() + ':' + id.toString());
            if (array[i].toString() == id.toString()) {
                index = i;
                break;
            }
        }
        return index;
    }
};

module.exports = RouterUtils;