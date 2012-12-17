(function () {
    module("Button tests");

    ButtonTestViewModel = function (canClick) {
        if (canClick != null) {
            this.canClick = ko.observable(canClick);
        }
        this.clicked = 0;
    };

    ButtonTestViewModel.prototype = {
        click: function () {
            this.clicked++;
        }
    };

    var buttonTest = function (canClick, assert) {
        var model = new ButtonTestViewModel(canClick);
        ko.test("button", { coc: model.click }, function (button) {
            assert(model, button);
        }, model);
    }

    test("When clicking on a button and guard accecpts it", function () {
        buttonTest(true, function (model, button) {
            button.click();

            equal(button.is(":disabled"), false, "The guard should accept click");
            equal(model.clicked, 1, "The handler Should trigger");
        });
    });

    test("When clicking on a button and guard denies click", function () {
        buttonTest(false, function (model, button) {
            equal(button.is(":disabled"), true, "The guard should deny click");
        });
    });

    test("When clicking on a button without guard", function () {
        buttonTest(null, function (model, button) {
            button.click();

            equal(button.is(":disabled"), false, "The guard should accept click");
            equal(model.clicked, 1, "The handler Should trigger");
        });
    });
})();