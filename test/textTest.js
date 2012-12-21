(function () {
    module("Text tests");

    TextViewModel = function () {
        this.text = ko.observable("Test");
    };

    var textTest = function (tag, isExcludedTag, assert) {
        var model = new TextViewModel();
        ko.test(tag, "text", model, function (element) {
            if (isExcludedTag === true) {
                equal(element.html(), "", "It should not add the text to the " + tag);
            } else {
                equal(element.html(), model.text(), "It should reflect the text on model");
            }
            if (assert !== undefined) {
                assert(element, model);
            };
        });
    };

    test("When binding against a div", function () {
        textTest("div");
    });

    test("When binding against a span", function () {
        textTest("span");
    });

    test("When binding against a input", function () {
        textTest("input", true);
    });

    test("When binding a div and then rebind again", function () {
        textTest("div", false, function(element, model) {
            model.text("Test2");
            equal(element.html(), "Test2", "It update text");
        });
    });
})();