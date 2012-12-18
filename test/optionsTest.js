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

    CompanyViewModel = function () {
        this.companies = ko.observableArray(["1", "2", "3"]);
        this.selectedCompany = ko.observable();
    };

    var optionsTest = function (assert, model, multi, convention) {
        var model = model ? new model : new OptionsViewModel();
        convention = convention || "options"

        ko.test("select", convention, model, function (select, args) {
            select.attr("multiple", multi !== undefined);
            assert(select, model);
        });
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

    test("When collection name ends with compan(ies)", function () {
        optionsTest(function (select, model) {
            select.val("3");
            select.change();
            equal(model.selectedCompany(), "3", "It should be reflected on model");
        }, CompanyViewModel, false, 'companies');
    });
})();