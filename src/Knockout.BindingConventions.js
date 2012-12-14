(function () {
    if (ko === undefined) {
        throw "This library is dependant on Knockout";
    }

    String.prototype.endsWith = String.prototype.endsWith ? String.prototype.endsWith : function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    var defaults = {
        roots: [window]
    };

    ko.bindingConventions = {
        init: function (options) {
            ko.utils.extend(defaults, options);
        },
        conventionBinders: {}
    };

    ko.bindingHandlers.coc = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var injected = false;
            for (var index in ko.bindingConventions.conventionBinders) {
                if (typeof ko.bindingConventions.conventionBinders[index] === "function") {
                    injected |= ko.bindingConventions.conventionBinders[index](injected, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) || false;
                }
            }
        }
    };

    ko.bindingConventions.conventionBinders.button = function (injected, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var handler = valueAccessor();
        if (element.tagName === "BUTTON" && typeof handler === "function") {
            var bindings = { click: handler };

            for (var index in viewModel) {
                if (viewModel[index] === handler) {
                    var guard = viewModel["can" + index.substring(0, 1).toUpperCase() + index.substring(1)];
                    if (guard !== undefined) {
                        bindings.enable = guard;
                    }
                    break;
                }
            }

            ko.applyBindingsToNode(element, bindings, viewModel);

            return true;
        }
    }

    ko.bindingConventions.conventionBinders.template = function (injected, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (!injected) {
            var model = ko.utils.unwrapObservable(valueAccessor());
            var name = findConstructorName(model);
            var modelEndsWith = "Model";
            if (name !== undefined && name.endsWith(modelEndsWith)) {
                name = name.substring(0, name.length - modelEndsWith.length);
                if (!name.endsWith("View")) {
                    name = name + "View";
                }

                ko.applyBindingsToNode(element, { template: { name: name, data: model} });
                return true;
            }
        }
    };

    var findConstructorName = function (instance) {
        var constructor = instance.constructor;

        if (constructor.__fcnName !== undefined) {
            return constructor.__fcnName;
        }

        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(constructor.toString());
        var name = (results && results.length > 1) ? results[1] : undefined;

        if (name === undefined) {
            var flagged = [];
            var nestedFind = function (root) {
                if (
                    root === null ||
                    root === window.document ||
                    root === window.html ||
                    root === window.history || // fixes security exception
                    root === window.frameElement || // fixes security exception when placed in an iFrame
                    typeof root === "function" ||
                    root.__fcnChecked === true || // fixes circular references
                    (root.location && root.location != window.location) // fixes (i)frames
                   ) {
                    return;
                }

                root.__fcnChecked = true;
                if (root.__fcnChecked === undefined) {
                    return;
                }
                flagged.push(root);

                for (var index in root) {
                    var item = root[index];
                    if (item === constructor) {
                        return index;
                    }


                    var found = nestedFind(item);
                    if (found !== undefined) {
                        return found;
                    }
                }
            }

            ko.utils.arrayForEach(defaults.roots, function (root) {
                name = nestedFind(root);
                if (name !== undefined) {
                    return false;
                }
            });

            for (var index in flagged) {
                flagged[index].__fcnChecked = false;
            }
        }
        constructor.__fcnName = name;
        return name;
    }
})();