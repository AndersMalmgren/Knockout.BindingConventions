ko.test = function (tag, binding, test, model) {
    var element = $("<" + tag + "/>");
    element.appendTo("body");
    ko.applyBindingsToNode(element[0], binding, model);
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