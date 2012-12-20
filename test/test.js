ko.testBase = function (model, element, test) {
    ko.applyBindings(model, element[0]);
    var args = {
        clean: function () {
            element.remove();
        }
    };
    test(element, args);

    if (!args.async) {
        args.clean();
    }
};

ko.test = function (tag, convention, model, test, prepElement) {
    var element = $("<" + tag + "/>");
    element.attr("data-name", convention);
    if (prepElement !== undefined) prepElement(element);

    element.appendTo("body");
    ko.testBase(model, element, test);
};

ko.virtualElementTest = function (convention, innerContent, model, test) {
    var virtualElement = $("<div><!-- ko name: " + convention + "-->" + innerContent + "<!-- /ko--></div>");
    virtualElement.appendTo("body");

    ko.testBase(model, virtualElement, test);
}