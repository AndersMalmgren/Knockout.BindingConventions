(function () {
    module("Input tests");

    InputViewModel = function (canClick) {
        this.checked = ko.observable(false);
        this.value = ko.observable();
    };

    test("When binding against a input", function () {
        var model = new InputViewModel();
        ko.test("input", "value", model, function (input) {
            input.val("test");
            input.change();

            equal(model.value(), "test", "it should reflect the change on model");
        });
    });

    if (ko.utils.ieVersion === undefined) {
        test("When binding a boolean against a input", function () {
            var model = new InputViewModel();
            ko.test("input", "checked", model, function (input, args) {
                input.attr("checked", true)
                input.click();

                equal(model.checked(), true, "it should reflect the change on model");
            });
        });
    }

    test("When binding against a input and setting value on viewmodel", function () {
        var model = new InputViewModel();
        ko.test("input", "value", model, function (input) {
            model.value("test");

            equal(input.val(), "test", "it should reflect the change on the input");
        });
    });

    test("When binding against a input and guard denies", function () {
        var model = new InputViewModel();
        model.canChangeValue = ko.observable(false);

        ko.test("input", "value", model, function (input) {
            equal($(input).is(":disabled"), true, "Textbox should be disabled");
        });
    });

    test("When binding against a input and guard accept changes", function () {
        var model = new InputViewModel();
        model.canChangeValue = ko.observable(true);

        ko.test("input", "value", model, function (input) {
            equal($(input).is(":disabled"), false, "Textbox should be enabled");
        });
    });
})();