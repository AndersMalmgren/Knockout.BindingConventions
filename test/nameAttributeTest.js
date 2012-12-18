module("Name attribute Binding provider tests");


var nameAtttributeTest = function (html, conventionBinding) {
    var template = $(html);
    template.appendTo($("body"));

    var clicked = 0;
    var model = { save: function () { clicked++ } };
    ko.applyBindings(model, template[0]);

    (template.is("button") ? template : template.find("button")).click();
    equal(clicked, 1);

    template.remove();
}

test("When using the Name attribute", function () {
    nameAtttributeTest("<button data-name='save'>Test</button>", true);
});

test("When using a standard data-bind", function () {
    nameAtttributeTest("<div><button data-bind='click: save'>Test</button></div>", false);
});

function NameAttributeTestViewModel() {
}

test("When using the Name attribute from a virtual element", function () {
    var template = $("<div><!-- ko name: $data --><!-- /ko --><script id='NameAttributeTestView' type='text/html'><div id='bound'></div></script></div>");
    template.appendTo($("body"));
    ko.applyBindings(new NameAttributeTestViewModel(), template[0]);
    equal(template.find("#bound").length, 1);

    template.remove();
});