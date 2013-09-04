module("Name attribute Binding provider tests");

var nameAtttributeTestBase = function (html, model, assert) {
    var template = $(html);
    template.appendTo($("body"));
    try {
        ko.applyBindings(model, template[0]);
        if (assert)
            assert(template);
    } catch (err) {
        throw err;
    } finally {
        template.remove();
    }
};

var nameAtttributeTest = function (html) {
    var clicked = 0;
    var model = { save: function () { clicked++ } };
    nameAtttributeTestBase(html, model, function(template) {
        (template.is("button") ? template : template.find("button")).click();
        equal(clicked, 1);
    });
};

test("When using the Name attribute", function () {
    nameAtttributeTest("<button data-name='save'>Test</button>");
});

test("When using a standard data-bind", function () {
    nameAtttributeTest("<div><button data-bind='click: save'>Test</button></div>");
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

test("When using the Name attribute and member is undefined (Issue #2)", function () {
    try {
        var model = {};
        nameAtttributeTestBase("<div data-name='fooMember'></div>", model);
    } catch (err) {
        ok(err.indexOf("fooMember") >= 0, "It should fail with meaningfull exception");
    }
});

test("When using the Name attribute and member has a null value (Issue #2)", function () {
    try {
        var model = { fooMember: null };
        nameAtttributeTestBase("<div data-name='fooMember'></div>", model);
    } catch (err) {
        ok(false, "It should not throw error");
    }

    ok(true);
});

test("When using standard data-bind together with name attribute and member is named as a binding", function () {
    var model = { text: "Test" };
    nameAtttributeTestBase("<div data-name='text' data-bind='visible: false'></div>", model, function (element) {
        ok(element.is(":hidden"), "data-bind binding should have been applied");
    });
});

test("When using a virtual element with content", function () {
    var template = "<!-- ko name: items -->\r\n<div>Foo</div>\r\n<!-- /ko -->";

    nameAtttributeTestBase(template, { items: [1, 2] }, function (element) {
        equal(element.html(), "FooFoo");
    });
});