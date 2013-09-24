(function () {
    module("Options tests");

    OptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOption = ko.observable();
    };
    
    OptionsNonObservableViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOption = null;
    };

    MultiOptionsNonObserViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOptions = null;
    };

    MultiOptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOptions = ko.observable();
    };

    CompanyViewModel = function () {
        this.companies = ko.observableArray(["1", "2", "3"]);
        this.selectedCompany = ko.observable();
    };

    GuardOptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOption = ko.observable();
        this.canChangeSelectedOption = ko.observable(false);
    };

    GuardOptionsNameIssueViewModel = function () {
        this.pages = ko.observableArray(["A", "B", "C"]);
        this.selectedPage = ko.observable();
    };

    GuardMultiOptionsViewModel = function () {
        this.options = ko.observableArray(["1", "2", "3"]);
        this.selectedOptions = ko.observable();
        this.canChangeSelectedOptions = ko.observable(false);
    };

    var optionsTest = function (assert, model, multi, convention) {
        var model = model ? new model : new OptionsViewModel();
        convention = convention || "options";

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
            var selected = ["3", "2"];
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

    test("When items are named pages (s not es)", function () {
        optionsTest(function (select, model) {
            select.val("C");
            select.change();
            equal(model.selectedPage(), "C", "It should be reflected on model");
        }, GuardOptionsNameIssueViewModel, false, "pages");
    });

    test("When guard denies input", function () {
        optionsTest(function (select, model) {
            equal(select.is(":disabled"), true, "It should deny input");
        }, GuardOptionsViewModel);
    });

    test("When guard accpects input", function () {
        optionsTest(function (select, model) {
            model.canChangeSelectedOption(true);
            equal(select.is(":disabled"), false, "It should accept input");
        }, GuardOptionsViewModel);
    });

    test("When guard is undefined", function () {
        optionsTest(function (select, model) {
            equal(select.is(":disabled"), false, "It should accept selection");
        });
    });

    test("When guard protects multiple selection", function () {
        optionsTest(function (select) {
            equal(select.is(":disabled"), true, "It should deny selection");
        }, GuardMultiOptionsViewModel, true);
    });
    
    test("When selecting an option on a non observable model", function () {
        optionsTest(function (select, model) {
            select.val("3");
            select.change();
            equal(model.selectedOption, "3", "It should be reflected on model");
        }, OptionsNonObservableViewModel, false);
    });
    
    test("When selecting multiple options on a non observable model", function () {
        optionsTest(function (select, model) {
            var selected = ["3", "2"];
            select.val(selected);
            select.change();
            equal(model.selectedOptions.length, selected.length, "It should be reflected on model");
        }, MultiOptionsNonObserViewModel, true);
    });
})();