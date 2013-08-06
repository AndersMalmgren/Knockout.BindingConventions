(function () {
    module("Image tests");

    test("When binding a img", function () {
        var src = "https://i.chzbgr.com/maxW500/1626320640/hE08E9A22/";

        ko.test("img", "src", { src: src }, function (img) {
            equal(img.attr("src"), src);
        });
    });
})();