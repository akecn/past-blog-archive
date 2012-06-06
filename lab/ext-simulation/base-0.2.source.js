/**
 * 
 */
(function(global, appName, undefined) {
    var previous = global[appName] || {};

    var _extend = Object.create ? 
        function(proto, con) {
            return Object.create(proto, {
                constructor: {
                    value: con
                }
            });
        }:
        function(proto, con) {
            function F() {};
            F.prototype = proto;
            var o = new F();
            o.constructor = con;
            return o;
        },
    hasEnumBug = !({toString:1}.propertyIsEnumerable('toString')),
    enumProperties = [
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toString',
        'toLocaleString',
        'valueOf'
    ],
    SLICE = Array.prototype.slice;

    var App = global[appName] = {
        noop: function() {},
        extend: function(r, s, px, sx) {
            var sp = s.prototype, rp;
            rp = _extend(sp, r);
            r.prototype = App.mix(rp, r.prototype);
            r.prototype.superclass = sp;

            if(px) {
                App.mix(r.prototype, px);
            }
            if(sx) {
                App.mix(r, sx)
            }

            return r;
        },
        mix: function(o, p, overwrite) {
            var prop, 
                ov = overwrite === false ? false : true;
            for(prop in p) {
                if(ov && p.hasOwnProperty(prop)) {
                    o[prop] = p[prop];
                }
            }
            if(hasEnumBug) {
                for(var i = 0, len = enumProperties.length; i < len; i ++) {
                    prop = enumProperties[i++];
                    if(ov && p.hasOwnProperty(prop)) {
                        o[prop] = p[prop];
                    }
                }
            }
            return o;
        },
        merge: function(o) {
            var ps = SLICE.call(arguments, 1);
            for(var i = 0, p; p = ps[i++];) {
                App.mix(o, p);
            }
            return o;
        },
        globalNamespaces: [{
                name: 'window.',
                scope: window
            }, {
                name: appName + '.',
                scope: App
            }
        ],
        existNamespace: function(ns) {
            var x = this.parseNamespace(ns),
                p = x.parts,
                o = x.scope;
            for (var j = 0; j < p.length; j++) {
                var tmp = o[p[j]];
                if(!tmp) {
                    o = undefined;
                    break;
                }else {
                    o = tmp;
                }
            }
            return o;
        },
        /**
         *
         */
        parseNamespace: function(ns) {
            var parts = [], scope = global;
            for(var i = 0, namespace; namespace = this.globalNamespaces[i++];) {
                if(ns.substring(0, namespace.name.length) == name) {
                    ns = ns.substring(0, namespace.name.length);
                    scope = namespace.scope;
                }
            }

            return {
                parts: parts.concat(ns.split('.')),
                scope: scope
            };
        },
        setNamespace: function(ns, value) {
            // default value is true
            var x = this.parseNamespace(ns),
                p = x.parts,
                o = x.scope,
                len = p.length -1, 
                leaf = p[len], i;
            for (i = (global[p[0]] === o) ? 1 : 0; i < len; ++i) {
                o = o[p[i]] = o[p[i]] || { };
            }
            o[leaf] = value || {};
            return o[leaf];
        },
        makeArray: function(its) {
			if(its === undefined || its === null) {
				return [];
			}        	
        	if(App.isArray(its)) {
        		return its;
        	}
        	if(its && its.length !== undefined && typeof value !== 'string') {
        		return Ext.toArray(its);
        	}
        	return [its];
        },
        isArray: ('isArray' in Array) ? Array.isArray : function(arr) {
        	return toString.call(arr) === "[object Array]";
        },
        toArray: function(obj) {
        	if(!obj || !obj.length) {
        		return [];
        	}
        	
        	if(typeof obj === "string") {
        		return obj.split('');
        	}
        	var rt = [];
        	try {
        		rt = SLICE.call(obj, 0);
        	}catch(ex) {
	        	for(var i = 0; i = obj.length; i < len) {
	        		rt[i] = obj[i];
	        	}
        	}
        	return rt;
        }
    };

    App.mix(App, previous);

    // as a basic class
    var Base = function() {};
    Base.prototype = {
        $className: appName + '.Base',
        $class: Base,
        callParent: function(args) {
            var method = this.callParent.caller,
                parentClass, methodName;
            if(!method.$owner) {
                console.log(method.caller)
                throw new Error(['sourceMethod: callParent', 'message: can not find the owner'].join('\n'));
            }
            parentClass = method.$owner.superclass;
            methodName = method.$name;

            if(!parentClass[methodName]) {
                throw new Error(['sourceMethod: callParent', 'message: can not find the parent method name,'+methodName].join('\n'));
            }

            return parentClass[methodName].apply(this, args);
        }
    };

    App.mix(Base, {
        own: function(name, value) {
            if(typeof value == "function") {
                this.ownMethod(name, value);
            }else {
                this.prototype[name] = value;
            }
        },
        ownMethod: function(name, fn) {
            fn.$owner = this.prototype;
            fn.$name = name;

            this.prototype[name] = fn;
        }
    });
    
    var Class = App.Class = function(data, fnOnCreated) {
    	var stack = data.defaultPreprocessors || Class.defaultProcessors,
    		registeredProcessors = Class.processorStack,
    		processors = [], processor, idx= 0,
    		newClass = function() {
    			return this.constructor.apply(this, arguments);
    		};
    	delete data.defaultPreprocessors;

    	for(var i = 0, len = stack.length; i < len; i++) {
    		processor = stack[i];
    		if(typeof processor == "string") {
    			processor = registeredProcessors[processor];
    			if(processor.always) {
    				processors.push(processor.fn);
    			}else {
    				if(data.hasOwnProperty(processor.name)) {
    					processors.push(processor.fn);
    				}
    			}
    		}else {
    			processors.push(processor);
    		}
    	}
    	process = function(cls, clsData) {
    		processor = processors[idx++];
    		
    		if(!processor) {
   				// TODO 与base关联起来。
    			App.mix(cls.prototype, clsData);
    			if(fnOnCreated) {
    				fnOnCreated.apply(cls, cls);
    			}
    			return;
    		}
    		if(processor.call(this, cls, clsData, process) !== false) {
    			process.apply(this, arguments);
    		}
    	};
    	process.call(Class, newClass, data);
    	
    	return newClass;
    };
    App.mix(Class, {
    	processorStack: {},
    	defaultProcessors: [],
    	registerProcessor: function(name, fn, always) {
    		this.processorStack[name] = {
    		 	name: name,
				fn: fn,
				always: always || false    		
    		}
    		return this;
    	},
    	setDefaultProcessors: function(processors) {
    		this.defaultProcessors = App.makeArray(processors);
    		return this;
    	}
    });
    
    Class.registerProcessor('extend', function(cls, data) {
    	var extend = data.extend,
    		base = Base, 
            parent;

        if(typeof extend === "string") {
            parent = App.existNamespace(extend);
        }else {
            parent = extend;
        }
        delete data.extend;

        if(!parent) {
            parent = base;
        }
        App.extend(cls, parent);
    		console.log('this is a extend processor');
    }, true);
    
    Class.setDefaultProcessors(['extend']);
    
    var Manager =  App.ClassManager = {
    	create: function(className, data, fnOnCreated) {
    		var manager = this, idx= 0;
    		
    		data.$className = className;
    		
    		return new Class(data, function() {
    			var stack = data.defaultPostprocessors || manager.defaultProcessors,
		    		registeredProcessors = manager.processorStack,
		    		processors = [], processor;
		
		    	delete data.defaultPostprocessors;
		
		    	for(var i = 0, len; len = stack.length; i++) {
		    		processor = stack[i];
		    		if(typeof processor == "string") {
		    			processor = registeredProcessors[processor];
		    			if(processor.always) {
		    				processors.push(processor.fn);
		    			}else {
		    				if(data.hasOwnProperty(processor.name)) {
		    					processors.push(processor.fn);
		    				}
		    			}
		    		}else {
		    			processors.push(processor);
		    		}
		    	}
		    	
		    	process = function(clsName, cls, clsData) {
		    		processor = processors[idx++];
		    		
		    		if(!processor) {
		    			if(fnOnCreated) {
		    				fnOnCreated.apply(cls, cls);
		    			}
		    			return;
		    		}
		    		if(processor.call(this, clsName, cls, clsData, process) !== false) {
		    			process.apply(this, arguments);
		    		}
		    	};
		    	process.call(manager, className, this, data);
    		});
		}
    };
    
    App.mix(Manager, {
    	processorStack: {},
    	defaultProcessors: [],
    	registerProcessor: function(name, fn, always) {
    		this.processorStack[name] = {
    		 	name: name,
				fn: fn,
				always: always || false    		
    		}
    		return this;
    	}
    });
    // TODO：注册实现下面那个define方法的所有processor相关处理函数。
    App.define = function(className, data, fnOnCreated) {
    	return Manager.create.apply(Manager, arguments);
    };

    App.define1 = function(ns, members) {
        var o = App.setNamespace(ns, function() {}),
            sup;

        if(members.extend) {
            if(typeof members.extend === "string") {
                sup = App.existNamespace(members.extend);
            }else {
                sup = members.extend;
            }
            delete members.extend;
        }
        if(!sup) {
            sup = Base;
        }
        App.extend(o, sup);

        // add static methods/props
        App.mix(o, sup);
        // add prototype methods/props
        for(var key in members) {
            if(members.hasOwnProperty(key)) {
                var prop = members[key];
                o.own(key, prop);
            }
        }
        App.mix(o.prototype, {$className: ns, $class: o});

        return o;
    };
})(this, "Ext");
