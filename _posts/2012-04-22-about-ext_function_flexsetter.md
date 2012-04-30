---
layout: post
title: EXT.Function.flexSetter备注
category: extjs
---

Ext.Function
-----

阅读Ext.Function模块。
该模块主要用于提供与函数相关的一些静态工具函数。

其中一个flexSetter方法，抽象了对于参数配置的弹性支持：
当fn函数应用该flexSetter方法以后，其参数配置就可以做到如下的效果。
fn(key, value) == fn({key: value})

代码中包含一段让我讶异的代码，在用for..in遍历了{key:value}以后，又遍历了一次在Ext.enumberables中定义的属性（['hasOwnProperty','valueOf','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','constructor']），这些属性实际与原生对象的预置属性同名。

<pre class="prettyprint">
flexSetter: function(fn) {
        return function(a, b) {
            var k, i;

            if (a === null) {
                return this;
            }
            if (typeof a !== 'string') {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        fn.call(this, k, a[k]);
                    }
                }

                if (Ext.enumerables) {
                    for (i = Ext.enumerables.length; i--;) {
                        k = Ext.enumerables[i];
                        if (a.hasOwnProperty(k)) {
                            fn.call(this, k, a[k]);
                        }
                    }
                }
            } else {
                fn.call(this, a, b);
            }

            return this;
        };
    }
</pre>

通常来说，原生对象的预置属性是不应该被遍历出来的。但在内置属性/方法被覆盖以后，在[各浏览器中用 for in 可以遍历对象中被更新的内置方法存在差异](http://w3help.org/zh-cn/causes/SJ5003)<sup>[1]</sup>，从完整的代码上来看，ext实际是支持用户去定义/覆盖这些与预置属性同名的属性/方法来扩展自定义对象/类。从框架的兼容性来考虑，采用了兼容的方案以避免重复定义：
在初始化时判断脚本环境是否支持遍历出与内置方法同名的属性/方法，若无法遍历出来，则定义内置属性名到Ext.enumberables数组中；否则就设为null。


1: 在chrome11测试时，发现除了Function.prototype.valueOf的特殊情况外，该问题已经被修复了。