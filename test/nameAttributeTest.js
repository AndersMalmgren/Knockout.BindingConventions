module("Name attribute Binding provider tests");

var nameAtttributeTest = function (html) {
    var template = $(html);
    template.appendTo($("body"));

    var member;
    var org = ko.bindingConventions.conventionBinders.button;
    ko.bindingConventions.conventionBinders.button = function (a, b, c) {
        member = c;
    };

    ko.applyBindings({ save: function () { clicked = true; } }, template[0]);
    equal(member, "save");
    ko.bindingConventions.conventionBinders.button = org;

    template.remove();
}

test("When using the Name attribute", function () {
    nameAtttributeTest("<button data-name='save'>Test</button>");
});

test("When using the Name attribute from a virtual element", function () {
    nameAtttributeTest("<!-- ko name: save --><!-- /ko -->");
});