
/* Simple JavaScript Inheritance
* By John Resig http://ejohn.org/
* MIT Licensed.
*/
// Inspired by base2 and Prototype
(function () {
    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () { };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function (name, fn) {
            return function () {
                var tmp = this._super;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
            };
        })(name, prop[name]) :
        prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();


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

    MyApp.OOExtendedViewModel = Class.extend({
      init: function(){
      }
    });

    MyApp.OOExtendedTwoViewModel = MyApp.OOExtendedViewModel.extend({
      init: function(){
      }
    });

    MyApp.NestedNameSpace = {};    
    MyApp.NestedNameSpace.NestedViewModel = MyApp.OOExtendedViewModel.extend({
      init: function(){
      }
    });

    var templateTest = function (model, name, convention, assert, prepElement) {
        var template = $("<script id='" + name + "' type='text/html'>Bound</script>");

        $("body").append(template);

        var test = function (element) {
            assert ? assert(element) : equal(element.html(), "Bound", "It should be able to bind template to model");
            template.remove();
        };

        ko.test("div", convention || "$data", model, test, prepElement);
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

    test("When binding a template against a undefined data and then setting model", function () {
        var model = { nullModel: ko.observable() };
        templateTest(model, "MyView", "nullModel", function (element) {
            equal("", element.text(), "The view should reflect null value");
            model.nullModel(new MyApp.MyViewModel());
            equal(element.text(), "Bound", "The view should reflect bound value");
        });
    });

    test("When binding a template against null data when a ViewModel is allready bound", function () {
        var model = { model: ko.observable(new MyApp.MyViewModel()) };
        templateTest(model, "MyView", "model", function (element) {
            equal("Bound", element.text(), "The view should reflect bound value");
            model.model(null);
            equal(element.text(), "", "The view should reflect null value");
        });
    });

    test("When binding a template against a null data and then setting model", function () {
        var model = { nullModel: ko.observable(null) };
        templateTest(model, "MyView", "nullModel", function (element) {
            equal("", element.text(), "The view should reflect undefined value");
            model.nullModel(new MyApp.MyViewModel());
            equal(element.text(), "Bound", "The view should reflect bound value");
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

    test("When binding a template against a OO extended ViewModel", function () {
        ko.bindingConventions.init({ roots: [MyApp] });
        templateTest(new MyApp.OOExtendedViewModel(), "OOExtendedView");
        ko.bindingConventions.init({ roots: [window] });
    });

    test("When prechecking constructor names with a nested namespace",function() {
        ko.bindingConventions.init({ roots: [MyApp] });
        equal(MyApp.NestedNameSpace.NestedViewModel.__fcnName, "NestedViewModel", "It should add the constuctor name to the object");
        ko.bindingConventions.init({ roots: [window] });        
    });

    test("When binding a template to a empty element but with newline and whitespace", function() {
        
        templateTest(new MyApp.MyViewModel(), "MyView", undefined, undefined, function(element) {
            element.html("  \r\n");
        });
    });
})();