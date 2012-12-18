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

    var templateTest = function (model, name) {
        var template = $("<script id='" + name + "' type='text/html'>Bound</script>");

        $("body").append(template);

        ko.test("div", "$data", model, function (element) {
            equal("Bound", element.html(), "It should be able to bind template to model");
            template.remove();
        });
    };

    test("When binding a template against a Hoisted function ViewModel", function () {
        templateTest(new HoistedFunctionViewModel(), "HoistedFunctionView");
    });

    test("When binding a template against a local variabel ViewModel", function () {
        templateTest(new MyApp.MyViewModel(), "MyView");
    });

    test("When binding a template against a local variabel ViewModel when root is set", function () {
        ko.bindingConventions.init({ roots: [MyApp] });
        templateTest(new MyApp.MyViewModel(), "MyView");
        ko.bindingConventions.init({ roots: [window] });
    });
})();