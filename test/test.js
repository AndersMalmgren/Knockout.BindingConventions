ko.test = function (tag, convention, model, test) {
    var element = $("<" + tag + "/>");
    element.attr("data-name", convention);

    element.appendTo("body");
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