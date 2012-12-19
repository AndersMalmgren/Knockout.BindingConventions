(function () {
    module("Template tests");

    function HoistedFunctionViewModel() {
    }

    window.MyApp = {
        MyViewModel: function () {
        }
    }

    MyApp.MyViewModel.prototype = {
        constructor: MyApp.MyViewModel,
        test: function () {
        }
    };

    var templateTest = function (model, name, convention, assert) {
        var template = $("<script id='" + name + "' type='text/html'>Bound</script>");

        $("body").append(template);

        var test = function (element) {
            assert ? assert(element) : equal(element.html(), "Bound", "It should be able to bind template to model");
            template.remove();
        };

        ko.test("div", convention || "$data", model, test);
    };

    test("When binding a template against a Hoisted function ViewModel", function () {
        templateTest(new HoistedFunctionViewModel(), "HoistedFunctionView");
    });

    test("When binding a template against a local variabel ViewModel", function () {
        templateTest(new MyApp.MyViewModel(), "MyView");
    });

    test("When binding a template against a null data", function () {
        templateTest({ nullModel: ko.observable(null) }, "MyView", "nullModel", function () {
            ok(true, "It should not crash due to null value");
        });
    });

    test("When binding a template against a null data and then setting model", function () {
        var model = { nullModel: ko.observable(null) };
        templateTest(model, "MyView", "nullModel", function (element) {
            equal("", element.text(), "The view should reflect null value");
            model.nullModel(new MyApp.MyViewModel());
            equal("Bound", element.text(), "The view should reflect bound value");
        });
    });

    test("When binding a template against a local variabel ViewModel when root is set", function () {
        ko.bindingConventions.init({ roots: [MyApp] });
        templateTest(new MyApp.MyViewModel(), "MyView");
        ko.bindingConventions.init({ roots: [window] });
    });

    test("When binding a template against a array of models", function () {
        var model = { items: ko.observableArray([new MyApp.MyViewModel(), new MyApp.MyViewModel()]) };
        templateTest(model, "MyView", "items", function (element) {
            equal(element.text(), "BoundBound", "It should bind all items");
        });
    });
})();