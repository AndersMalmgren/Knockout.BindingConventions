(function () {
    module("Visible tests");

    VisibleViewModel = function () {
        this.visible = ko.observable(false);
    };

    var visibleTest = function (tag, isExcludedTag) {
        var model = new VisibleViewModel();
        ko.test(tag, "visible", model, function (element) {
            if (isExcludedTag === true) {
                equal(element.is(":hidden"), false, "It should not hide the " + tag);
            } else {
                equal(element.is(":hidden"), true, "It should hide the " + tag);
            }
        });
    };

    test("When binding against a div", function () {
        visibleTest("div");
    });

    test("When binding against a span", function () {
        visibleTest("span");
    });

    test("When binding against a input", function () {
        visibleTest("input", true);
    });
})();