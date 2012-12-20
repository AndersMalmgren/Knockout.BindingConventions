(function () {
    module("With tests");

    WithTestViewModel = function () {
        this.value = "TestValue";
    };

    var innerContent = "<span data-name='value'></span>";

    test("When 'with' binding a ViewModel to a virtual element with content", function () {
        var model = new WithTestViewModel();
        ko.virtualElementTest("with", innerContent, { "with": model }, function (element) {
            equal(element.text(), model.value, "It should bind the model");
        });
    });

    test("When 'with' binding a ViewModel to a virtual element without content", function () {
        var innerContent = "";
        var model = new WithTestViewModel();
        try {
            ko.virtualElementTest("with", innerContent, { "with": model }, function (element) {
            });
        }
        catch (err) {
            ok(true, "It should try to do a template binding not a with binding");
        }
    });

    var elementTest = function (insertTemplate, test, nullModel) {
        var withTemplate = $(innerContent);
        var model = nullModel ? null : new WithTestViewModel();

        var prepElement = function (element) {
            if (insertTemplate) {
                withTemplate.appendTo(element);
            }
        }

        ko.test("div", "with", { "with": ko.observable(model) }, function (element) {
            test(element, model);
        }, prepElement);
    }

    test("When 'with' binding a ViewModel to a element with content", function () {
        elementTest(true, function (element, model) {
            equal(element.text(), model.value, "It should bind the model");
        });
    });

    test("When 'with' binding a ViewModel to a element without content", function () {
        try {
            elementTest(false, function (element, model) {
                equal(element.text(), model.value, "It should bind the model");
            });
        }
        catch (err) {
            ok(true, "It shoudl try to use the template binding");
        }
    });

    test("When 'with' binding null to a element with content", function () {
        elementTest(true, function (element, model) {
            ok(element[0].__withBound, "It should use the withg binding");
        }, true);
    });
})();