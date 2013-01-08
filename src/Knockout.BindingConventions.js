(function () {
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

    ko.bindingConventions = {
        init: function (options) {
            ko.utils.extend(defaults, options);
            preCheckConstructorNames();
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
    ko.bindingProvider.instance = new ko.conventionBindingProvider();

    var setBindingsByConvention = function (name, element, bindingContext, bindings) {
        var data = bindingContext[name] ? bindingContext[name] : bindingContext.$data[name];
        var unwrapped = ko.utils.unwrapObservable(data);
        var type = typeof unwrapped;
        var convention = element.__bindingConvention;

        if (convention === undefined) {
            for (var index in ko.bindingConventions.conventionBinders) {
                if (ko.bindingConventions.conventionBinders[index].rules !== undefined) {
                    convention = ko.bindingConventions.conventionBinders[index];
                    var should = true;
                    if (unwrapped == null && convention.defferedApplyIfDataNotSet === true) {
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
    }

    ko.bindingConventions.conventionBinders.button = {
        rules: [function (name, element, bindings, unwrapped, type) { return element.tagName === "BUTTON" && type === "function"; } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel, bindingContext) {
            bindings.click = unwrapped;

            var guard = viewModel["can" + name.substring(0, 1).toUpperCase() + name.substring(1)];
            if (guard !== undefined)
                bindings.enable = guard;
        }
    };

    ko.bindingConventions.conventionBinders.options = {
        rules: [function (name, element, bindings, options) { return element.tagName === "SELECT" && options.push; } ],
        apply: function (name, element, bindings, options, type, data, viewModel, bindingContext) {
            bindings.options = options;

            var itemName = singularize(name);
            bindings.value = viewModel["selected" + itemName.substring(0, 1).toUpperCase() + itemName.substring(1)];
            bindings.selectedOptions = viewModel["selected" + name.substring(0, 1).toUpperCase() + name.substring(1)];
        }
    };

    ko.bindingConventions.conventionBinders.input = {
        rules: [function (name, element) { return element.tagName === "INPUT" || element.tagName === "TEXTAREA"; } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel, bindingContext) {
            if (type === "boolean") {
                if (ko.utils.ieVersion === undefined) {
                    bindings.attr = { type: "checkbox" };
                }
                bindings.checked = data;
            } else {
                bindings.value = data;
            }
        }
    };

    ko.bindingConventions.conventionBinders.visible = {
        rules: [function (name, element, bindings, unwrapped, type) { return type === "boolean" && element.tagName !== "INPUT"; } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel, bindingContext) {
            bindings.visible = data;
        }
    };

    ko.bindingConventions.conventionBinders.text = {
        rules: [function (name, element, bindings, unwrapped, type) { return type !== "object" && type !== "boolean" && element.tagName !== "INPUT" && element.tagName !== "TEXTAREA" && !nodeHasContent(element); } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel, bindingContext) {
            bindings.text = data;
        },
        defferedApplyIfDataNotSet: true
    };

    ko.bindingConventions.conventionBinders["with"] = {
        rules: [function (name, element, bindings, unwrapped, type) {
            return (type === "object" || unwrapped === undefined) &&
            (unwrapped == null || unwrapped.push === undefined) &&
            nodeHasContent(element);
        } ],
        apply: function (name, element, bindings, unwrapped, type, data, viewModel, bindingContext) {
            bindings["with"] = data;
        }
    };

    ko.bindingConventions.conventionBinders.foreach = {
        rules: [function (name, element, bindings, array) { return array && array.push && element.innerHTML != ""; } ],
        apply: function (name, element, bindings, array, type, data, viewModel, bindingContext) {
            bindings.foreach = data;
        }
    };

    ko.bindingConventions.conventionBinders.template = {
        rules: [function (name, element, bindings, actualModel, type) { return type === "object" && (element.nodeType === 8 || element.innerHTML.trim() === ""); } ],
        apply: function (name, element, bindings, actualModel, type, model, viewModel, bindingContext) {
            var className = actualModel ? findConstructorName(actualModel.push ? actualModel[0] : actualModel) : undefined;
            var modelEndsWith = "Model";
            var template = null;
            if (className !== undefined && className.endsWith(modelEndsWith)) {
                var template = className.substring(0, className.length - modelEndsWith.length);
                if (!template.endsWith("View")) {
                    template = template + "View";
                }
            }

            if (template == null) {
                throw "VewModel name could not be found";
            }

            bindings.template = { name: template, 'if': model };
            if (actualModel != null && actualModel.push) {
                bindings.template.foreach = actualModel;
            } else {
                bindings.template.data = actualModel;
            }
        },
        defferedApplyIfDataNotSet: true
    };

    var pluralEndings = [{ end: "ies", use: "y" }, "es", "s"];
    var singularize = function (name) {
        arrayForEach(pluralEndings, function (ending) {
            append = ending.use;
            ending = ending.end || ending;
            if (name.endsWith(ending)) {
                name = name.substring(0, name.length - ending.length);
                name = name + (append || "");
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
        arrayForEach([viewModel, bindingContext.$parent], function (model) {
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

    var arrayForEach = function (array, action) {
        for (var i = 0; i < array.length; i++) {
            if (action(array[i]) === false) break;
        }
    };

    var nodeHasContent = function (node) {
        return (node.nodeType === 8 && node.nextSibling.nodeType === 1) ||
            (node.nodeType === 1 && node.innerHTML !== "");
    }

    var preCheckConstructorNames = function () {
        var flagged = [];
        var nestedPreCheck = function (root) {
            if (root.__fcnChecked || root === window) return;

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
        }

        arrayForEach(defaults.roots, function (root) {
            nestedPreCheck(root);
        });

        arrayForEach(flagged, function (flag) {
            flag.__fcnChecked = undefined;
        });
    };

    var findConstructorName = function (instance) {
        var constructor = instance.constructor;

        if (constructor.__fcnName !== undefined) {
            return constructor.__fcnName;
        }

        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(constructor.toString());
        var name = (results && results.length > 1) ? results[1] : undefined;

        var excluded = false;
        arrayForEach(defaults.excludeConstructorNames, function (exclude) {
            if (exclude === name) {
                excluded = true;
                return false;
            }
        });

        if (name === undefined || excluded) {
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
                try {
                    root.__fcnChecked = true;
                }
                catch (err) {
                    return; // IE error
                }
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

            arrayForEach(defaults.roots, function (root) {
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