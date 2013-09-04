(function () {
    module("Foreach tests");


    var foreachTest = function (items, test) {
        prep = function (element) {
            element.html("<div>Row</div>");
        };

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

    test("When binding a foreach against a observable array and an empty virtual element", function () {
        var model = ko.observableArray();
        var orgForeachApply = ko.bindingConventions.conventionBinders.foreach.apply;
        var orgTemplateApply = ko.bindingConventions.conventionBinders.template.apply;

        ko.bindingConventions.conventionBinders.foreach.apply = function () {
            ok(false, "It should not use foreach convention");
        };

        ko.bindingConventions.conventionBinders.template.apply = function () {
            ok(true, "It should use template convention");
        }

        ko.virtualElementTest("$data", "", model, function () {

        });

        ko.bindingConventions.conventionBinders.foreach.apply = orgForeachApply;
        ko.bindingConventions.conventionBinders.template.apply = orgTemplateApply;
    });
})();