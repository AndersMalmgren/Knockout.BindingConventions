module("Name attribute Binding provider tests");

var nameAtttributeTest = function (html, memberNameIsAutoinjected) {
    var template = $(html);
    template.appendTo($("body"));

    var member;
    var org = ko.bindingConventions.conventionBinders.button;
    ko.bindingConventions.conventionBinders.button = function (a, b, c) {
        handler = a;
        member = c;
    };

    var model = { save: function () { } };
    ko.applyBindings(model, template[0]);
    equal(member, memberNameIsAutoinjected ? "save" : null);
    equal(handler, model.save);
    ko.bindingConventions.conventionBinders.button = org;

    template.remove();
}

test("When using the Name attribute", function () {
    nameAtttributeTest("<button data-name='save'>Test</button>", true);
});

test("When using the Name attribute from a virtual element", function () {
    nameAtttributeTest("<!-- ko name: save --><!-- /ko -->", true);
});

test("When using a standard data-bind", function () {
    nameAtttributeTest("<div><button data-bind='coc: save'>Test</button></div>", false);
});