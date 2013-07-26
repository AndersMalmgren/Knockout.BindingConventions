(function(ko, $) {
    ko.testBase = function(model, element, test) {
        element.appendTo("body");
        ko.applyBindings(model, element[0]);
        var args = {
            clean: function() {
                element.remove();
            }
        };
        test(element, args);

        if (!args.async) {
            args.clean();
        }
    };

    ko.test = function(tag, convention, model, test, prepElement) {
        var element = $("<" + tag + "/>");
        element.attr("data-name", convention);
        if (prepElement !== undefined) prepElement(element);

        ko.testBase(model, element, test);
    };

    ko.virtualElementTest = function(convention, innerContent, model, test) {
        var virtualElement = $("<div><!-- ko name: " + convention + "-->" + innerContent + "<!-- /ko--></div>");
        ko.testBase(model, virtualElement, test);
    };
})(window.ko, window.jQuery);