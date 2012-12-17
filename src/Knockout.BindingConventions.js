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

    ko.conventionBindingProvider = function () {

        this.orgBindingProvider = new ko.bindingProvider();
        this.orgNodeHasBindings = this.orgBindingProvider.nodeHasBindings;
        this.attribute = "data-name";
        this.virtualAttribute = "ko name:";
    };

    ko.conventionBindingProvider.prototype = {
        getMemberName: function (node) {
            var name = null;

            if (node.nodeType === 1) {
                name = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                index = value.indexOf(this.virtualAttribute);

                if (index > -1) {
                    name = value.substring(index + this.virtualAttribute.length).trim();
                }
            }

            return name;
        },
        nodeHasBindings: function (node) {
            return this.orgNodeHasBindings(node) || this.getMemberName(node) !== undefined;
        },
        getBindings: function (node, bindingContext) {
            var name = this.getMemberName(node);

            var result = this.orgBindingProvider.getBindings(node, bindingContext);
            if (name != null) {
                result = result || {};
                result.coc = bindingContext[name] ? bindingContext[name] : { data: bindingContext.$data[name], member: name };
            }

            return result;
        }
    };

    ko.bindingProvider.instance = new ko.conventionBindingProvider();

    ko.bindingHandlers.coc = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();

            var unwrapped = ko.utils.unwrapObservable(value.member ? value.data : valueAccessor());
            valueAccessor = value.member ? function () { return value.data } : valueAccessor;
            var type = typeof unwrapped;

            for (var index in ko.bindingConventions.conventionBinders) {
                if (typeof ko.bindingConventions.conventionBinders[index] === "function") {
                    var result = ko.bindingConventions.conventionBinders[index](unwrapped, type, value.member, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    if (result !== undefined) {
                        return result;
                    }
                }
            }
        }
    };
    ko.virtualElements.allowedBindings.coc = true;

    ko.bindingConventions.conventionBinders.button = function (unwrapped, type, member, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (element.tagName === "BUTTON" && type === "function") {
            var bindings = { click: unwrapped };
            var member = findMemberName(member, unwrapped, viewModel, bindingContext);
            var guard = member.model["can" + member.name.substring(0, 1).toUpperCase() + member.name.substring(1)];
            if(guard !== undefined)
                bindings.enable = guard;

            return ko.applyBindingsToNode(element, bindings, viewModel);
        }
    };

    ko.bindingConventions.conventionBinders.options = function (unwrapped, type, member, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = unwrapped;
        if (element.tagName === "SELECT" && options.push) {
            var binding = { options: options };
            var member = findMemberName(member, valueAccessor(), viewModel, bindingContext);
            var itemName = singularize(member.name);
            binding.value = member.model["selected" + itemName.substring(0, 1).toUpperCase() + itemName.substring(1)];
            binding.selectedOptions = member.model["selected" + member.name.substring(0, 1).toUpperCase() + member.name.substring(1)];

            return ko.applyBindingsToNode(element, binding, viewModel);
        }
    };

    ko.bindingConventions.conventionBinders.input = function (unwrapped, type, member, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            var value = valueAccessor();
            var binding = {};
            if (type === "boolean") {
                binding.attr = { type: "checkbox" };
                binding.checked = value;
            } else {
                binding.value = value;
            }

            return ko.applyBindingsToNode(element, binding, viewModel);
        }
    };

    ko.bindingConventions.conventionBinders.template = function (unwrapped, type, member, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (type !== "object") return;

        var model = unwrapped;
        var name = findConstructorName(model);
        var modelEndsWith = "Model";
        if (name !== undefined && name.endsWith(modelEndsWith)) {
            name = name.substring(0, name.length - modelEndsWith.length);
            if (!name.endsWith("View")) {
                name = name + "View";
            }

            ko.applyBindingsToNode(element, { template: { name: name, data: model} }, model);
            return { controlsDescendantBindings: true };
        }
    };

    var pluralEndings = ["ies", "es", "s"];
    var singularize = function (name) {
        ko.utils.arrayForEach(pluralEndings, function (ending) {
            if (name.endsWith(ending)) {
                name = name.substring(0, name.length - ending.length);
                return false;
            }
        });

        return name;
    };

    var findMemberName = function (member, value, viewModel, bindingContext) {
        if (member !== undefined) {
            return { model: viewModel, name: member };
        }

        var result = {};
        ko.utils.arrayForEach([viewModel, bindingContext.$parent], function (model) {
            for (var index in model) {
                if (model[index] === value) {
                    result.name = index;
                    result.model = model;
                    return false;
                }
            }
        });

        return result;
    }

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
    };
})();