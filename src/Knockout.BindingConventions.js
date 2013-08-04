// Knockout.BindingConventions
// (c) Anders Malmgren - https://github.com/AndersMalmgren/Knockout.BindingConventions
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function (window, ko) {
    if (window.ko === undefined) {
        throw "This library is dependant on Knockout";
    }

    String.prototype.endsWith = String.prototype.endsWith ? String.prototype.endsWith : function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    String.prototype.trim = String.prototype.trim || function () {
        return this.replace(/^\s+|\s+$/g, '');
    };

    var defaults = {
        roots: [window],
        excludeConstructorNames: ["Class"]
    };

    var prechecked = false;
    ko.bindingConventions = {
        init: function (options) {
            prechecked = false;
            ko.utils.extend(defaults, options);
        },
        conventionBinders: {}
    };

    ko.bindingConventions.ConventionBindingProvider = function () {

        this.orgBindingProvider = ko.bindingProvider.instance || new ko.bindingProvider();
        this.orgNodeHasBindings = this.orgBindingProvider.nodeHasBindings;
        this.attribute = "data-name";
        this.virtualAttribute = "ko name:";
    };

    ko.bindingConventions.ConventionBindingProvider.prototype = {
        getMemberName: function (node) {
            var name = null;

            if (node.nodeType === 1) {
                name = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                var value = "" + node.nodeValue || node.text;
                var index = value.indexOf(this.virtualAttribute);

                if (index > -1) {
                    name = value.substring(index + this.virtualAttribute.length).trim();
                }
            }

            return name;
        },
        nodeHasBindings: function (node) {
            return this.orgNodeHasBindings(node) || this.getMemberName(node) !== null;
        },
        getBindings: function (node, bindingContext) {
            var name = this.getMemberName(node);

            var result = ko.bindingHandlers[name] ? null : this.orgBindingProvider.getBindings(node, bindingContext);
            if (name != null) {
                result = result || {};
                setBindingsByConvention(name, node, bindingContext, result);
            }

            return result;
        }
    };
    ko.bindingProvider.instance = new ko.bindingConventions.ConventionBindingProvider();

    var getDataFromComplexObjectQuery = function (name, context) {
        var parts = name.split(".");
        for (var i = 0; i < parts.length; i++) {
            context = context[parts[i]];
        }

        return context;
    };

    var setBindingsByConvention = function (name, element, bindingContext, bindings) {
        var data = bindingContext[name] ? bindingContext[name] : bindingContext.$data[name];
        if (data == null) {
            data = getDataFromComplexObjectQuery(name, bindingContext.$data);
        }
        var unwrapped = ko.utils.unwrapObservable(data);
        var type = typeof unwrapped;
        var convention = element.__bindingConvention;

        if (convention === undefined) {
            for (var index in ko.bindingConventions.conventionBinders) {
                if (ko.bindingConventions.conventionBinders[index].rules !== undefined) {
                    convention = ko.bindingConventions.conventionBinders[index];
                    var should = true;
                    if (unwrapped == null && convention.deferredApplyIfDataNotSet === true) {
                        continue;
                    }

                    if (convention.rules.length == 1) {
                        should = convention.rules[0](name, element, bindings, unwrapped, type, data, bindingContext.$data, bindingContext);
                    } else {
                        arrayForEach(convention.rules, function (rule) {
                            should = should && rule(name, element, bindings, unwrapped, type, data, bindingContext.$data, bindingContext);
                        });
                    }

                    if (should) {
                        element.__bindingConvention = convention;
                        break;
                    }
                }
            }
        }
        if (element.__bindingConvention === undefined && unwrapped != null) throw "No convention was found for " + name;
        if (element.__bindingConvention !== undefined) {
            element.__bindingConvention.apply(name, element, bindings, unwrapped, type, data, bindingContext.$data, bindingContext);
        }
    };

    ko.bindingConventions.conventionBinders.button = {
        rules: [function (name, element, bindings, unwrapped, type) { return element.tagName === "BUTTON" && type === "function"; } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel) {
            bindings.click = unwrapped;

            var guard = viewModel["can" + getPascalCased(name)];
            if (guard !== undefined)
                bindings.enable = guard;
        }
    };

    ko.bindingConventions.conventionBinders.options = {
        rules: [function (name, element, bindings, options) { return element.tagName === "SELECT" && options.push; } ],
        apply: function (name, element, bindings, options, type, data, viewModel) {
            bindings.options = options;
            var selectedMemberFound = false;
            var guard;

            singularize(name, function (singularized) {
                var pascalCasedItemName = getPascalCased(singularized);
                var selected = viewModel["selected" + pascalCasedItemName];

                if (selected === undefined) return false;

                bindings.value = selected;
                guard = viewModel["canChangeSelected" + pascalCasedItemName];
                if (guard !== undefined) {
                    bindings.enable = guard;
                }
                selectedMemberFound = true;
                return true;
            });

            if (selectedMemberFound) return;

            var pascalCased = getPascalCased(name);
            bindings.selectedOptions = viewModel["selected" + pascalCased];
            guard = viewModel["canChangeSelected" + pascalCased];
            if (guard !== undefined) {
                bindings.enable = guard;
            }
        }
    };

    ko.bindingConventions.conventionBinders.input = {
        rules: [function (name, element) { return element.tagName === "INPUT" || element.tagName === "TEXTAREA"; } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel) {
            if (type === "boolean") {
                if (ko.utils.ieVersion === undefined) {
                    bindings.attr = { type: "checkbox" };
                }
                bindings.checked = data;
            } else {
                bindings.value = data;
            }

            var guard = viewModel["canChange" + getPascalCased(name)];
            if (guard !== undefined)
                bindings.enable = guard;
        }
    };

    ko.bindingConventions.conventionBinders.visible = {
        rules: [function (name, element, bindings, unwrapped, type) { return type === "boolean" && element.tagName !== "INPUT"; } ],
        apply: function (name, element, bindings, unwrapped, type, data) {
            bindings.visible = data;
        }
    };

    ko.bindingConventions.conventionBinders.text = {
        rules: [function (name, element, bindings, unwrapped, type) { return type !== "object" && type !== "boolean" && element.tagName !== "INPUT" && element.tagName !== "TEXTAREA" && !nodeHasContent(element); } ],
        apply: function (name, element, bindings, unwrapped, type, data) {
            bindings.text = data;
        },
        deferredApplyIfDataNotSet: true
    };

    ko.bindingConventions.conventionBinders["with"] = {
        rules: [function (name, element, bindings, unwrapped, type) {
            return (type === "object" || unwrapped === undefined) &&
            (unwrapped == null || unwrapped.push === undefined) &&
            nodeHasContent(element);
        } ],
        apply: function (name, element, bindings, unwrapped, type, data) {
            bindings["with"] = data;
        }
    };

    ko.bindingConventions.conventionBinders.foreach = {
        rules: [function (name, element, bindings, array) { return array && array.push && nodeHasContent(element); } ],
        apply: function (name, element, bindings, array, type, data) {
            bindings.foreach = data;
        }
    };

    ko.bindingConventions.conventionBinders.template = {
        rules: [function (name, element, bindings, actualModel, type) { return type === "object" && !nodeHasContent(element); } ],
        apply: function (name, element, bindings, actualModel, type, model) {
            var isArray = actualModel != null && actualModel.push !== undefined;
            var isDeferred = actualModel == null || (isArray && actualModel.length == 0);

            var template = null;
            if (!isDeferred) {
                var className = actualModel ? findConstructorName(isArray ? actualModel[0] : actualModel) : undefined;
                var modelEndsWith = "Model";
                if (className != null && className.endsWith(modelEndsWith)) {
                    template = className.substring(0, className.length - modelEndsWith.length);
                    if (!template.endsWith("View")) {
                        template = template + "View";
                    }
                }

                if (template == null) {
                    throw "View name could not be found";
                }
            }

            bindings.template = { name: template, 'if': model };
            if (isArray) {
                bindings.template.foreach = actualModel;
            } else {
                bindings.template.data = actualModel;
            }
        },
        deferredApplyIfDataNotSet: true
    };

    var getPascalCased = function (text) {
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    };

    var pluralEndings = [{ end: "ies", use: "y" }, "es", "s"];
    var singularize = function (name, callback) {
        var singularized = null;
        arrayForEach(pluralEndings, function (ending) {
            var append = ending.use;
            ending = ending.end || ending;
            if (name.endsWith(ending)) {
                singularized = name.substring(0, name.length - ending.length);
                singularized = singularized + (append || "");
                if (callback) {
                    return !callback(singularized);
                }

                return true;
            }
            return true;
        });

        return singularized;
    };

    var arrayForEach = function (array, action) {
        for (var i = 0; i < array.length; i++) {
            var result = action(array[i]);
            if (result === false) break;
        }
    };

    var nodeHasContent = function (node) {
        return (node.nodeType === 8 && node.nextSibling.nodeType === 1) ||
            (node.nodeType === 1 && node.innerHTML.trim() !== "");
    };

    var preCheckConstructorNames = function () {
        var flagged = [];
        var nestedPreCheck = function (root) {
            if (root == null || root.__fcnChecked || root === window) return;

            root.__fcnChecked = true;
            if (root.__fcnChecked === undefined) return;
            flagged.push(root);
            for (var index in root) {
                var item = root[index];
                if (item !== undefined && index.endsWith("Model") && typeof item === "function") {
                    item.__fcnName = index;
                }
                nestedPreCheck(item);
            }
        };

        arrayForEach(defaults.roots, function (root) {
            nestedPreCheck(root);
        });

        arrayForEach(flagged, function (flag) {
            delete flag.__fcnChecked;
        });
    };

    var findConstructorName = function (obj, isConstructor) {
        var constructor = isConstructor ? obj : obj.constructor;

        if (constructor.__fcnName !== undefined) {
            return constructor.__fcnName;
        }

        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(constructor.toString());
        var name = (results && results.length > 1) ? results[1] : undefined;
        var index;

        var excluded = false;
        arrayForEach(defaults.excludeConstructorNames, function (exclude) {
            if (exclude === name) {
                excluded = true;
                return false;
            }
            return true;
        });

        if (name === undefined || excluded) {
            var flagged = [];
            var nestedFind = function (root) {
                if (root == null ||
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
                try {
                    root.__fcnChecked = true;
                } catch (err) {
                    return; // IE error
                }
                if (root.__fcnChecked === undefined) {
                    return;
                }
                flagged.push(root);

                for (index in root) {
                    var item = root[index];
                    if (item === constructor) {
                        return index;
                    }


                    var found = nestedFind(item);
                    if (found !== undefined) {
                        return found;
                    }
                }
            };

            arrayForEach(defaults.roots, function (root) {
                name = nestedFind(root);
                if (name !== undefined) {
                    return false;
                }
                return true;
            });

            for (index in flagged) {
                delete flagged[index].__fcnChecked;
            }
        }
        constructor.__fcnName = name;
        return name;
    };

    var orgApplyBindings = ko.applyBindings;
    ko.applyBindings = function (viewModel, element) {
        if (prechecked === false) {
            preCheckConstructorNames();
            prechecked = true;
        }

        orgApplyBindings(viewModel, element);
    };

    ko.bindingConventions.utils = {
        findConstructorName: findConstructorName,
        singularize: singularize,
        getPascalCased: getPascalCased
    };
})(window, ko);