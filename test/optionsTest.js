(function () {
    module("Options tests");

    OptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOption = ko.observable();
    };

    MultiOptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOptions = ko.observable();
    };

    var optionsTest = function (assert, model, multi) {
        var model = model !== undefined ? new model() : new OptionsViewModel();
        ko.test("select", { coc: model.options }, function (select, args) {
            select.attr("multiple", multi !== undefined);
            assert(select, model);
        }, model);
    };

    test("When binding a array against a select element", function () {
        optionsTest(function (select, model) {
            equal(3, select.find("option").length, "It should bind the options");
        });
    });

    test("When selecting an option", function () {
        optionsTest(function (select, model) {
            select.val("3");
            select.change();
            equal(model.selectedOption(), "3", "It should be reflected on model");
        });
    });

    test("When selecting multiple options", function () {
        optionsTest(function (select, model) {
            var selected = ["3", "2"]
            select.val(selected);
            select.change();
            equal(model.selectedOptions().length, selected.length, "It should be reflected on model");
        }, MultiOptionsViewModel, true);
    });
})();