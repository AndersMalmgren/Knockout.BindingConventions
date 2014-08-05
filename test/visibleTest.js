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

    test("WHen binding against a virtual element", function() {
        ko.virtualElementTest("visible", "<div>Bar</div>", new VisibleViewModel(), function(element) {
            ok(element.html().indexOf("Bar") === -1, "It should hide the content inside the virtual element");
        });
    });
})();