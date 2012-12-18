(function () {
    module("Foreach tests");


    var foreachTest = function (items, test) {
        prep = function (element) {
            element.html("<div>Row</div>");
        }

        ko.test("div", "$data", items, test, prep);
    };

    test("When binding a foreach against a observable array", function () {
        foreachTest(ko.observableArray(["1", "2", "3"]), function (element) {
            equal(element.find("div").length, 3, "It should bind all rows");
        });
    });

    test("When binding a foreach against a observable array and adding a row", function () {
        var model = ko.observableArray();
        foreachTest(model, function (element) {
            equal(element.find("div").length, 0, "It have zero rows from start");
            model.push("1");
            equal(element.find("div").length, 1, "It should add a row");
        });
    });
})();