---
layout: post
title: ExtJS的类关系链构成
category: extjs
---

在ExtJS的类体系中，最大限度的将所有的对象/方法都字符串来表示（包括xType）。
所有的方法和类都有途径去追溯来源。如：

<pre class="prettyprint">
Ext.define("Test.Animal", {
    config: {
        name: "animal"
    },
    constructor: function(config) {
        this.initConfig(config);
        return this;
    },
    shout: function() {
        alert(this.name);
    }
});
Ext.define("Test.Bird", {
    extend: "Test.Animal",
    fly: function() {
        alert(this.name + 'is flying');
    },
    log: function() {
        console.log(
            this.log.$owner == Test.Bird, // == true
            this.log.$name, // == "log"
            this.superclass.$className, // == "Test.Animal"
            this.$className, // == Ext.getClassName(this) == "Test.Bird"
            this.self == Test.Bird,
            this.superclass.superclass.$className // == "Ext.Base"
        );
    }
});

var dog = Ext.create(Test.Animal, {
    name: "dog"
});
var parakeet = Ext.create(Test.Bird, {
    name: 'parakeet'
});
parakeet.log();
console.log(
    dog.$className == parakeet.superclass.$className
);
</pre>

之前曾经有过想要获取调用当前函数的函数名的需要，使用了`caller/callee`等函数的属性，但后来似乎因为某些原因而放弃使用了（郁闷的是，我忘了是啥原因）。而另外比较常使用这两个属性的场景大概就是debug的时候了吧，利用caller来找出方法的调用方（类似于chrome和firebug中察看堆栈）。

也许是因为`caller`并不是规范的一部分，所以在strict模式下，在调用caller的时候会抛出错误。但由于目前所有的主流浏览器实际都支持了这个属性，所以实际上还是能看到一些颇有意思的应用方式。比如ExtJS类的关系链的实现就使用了这两个属性，callParent/callOverride等等方法都是利用`Function.caller`来实现的。
而`callee`则在最新的规范中被废弃，建议使用命名的函数表达式来替代`arguments.callee`的实现，同样的在strict模式下也是不支持的。

<pre class="prettyprint">
var f = function t() {return t;}
// instead of 
var f = function() { return arguments.callee; }; 
</pre>

说会到ExtJS的类关键链的构造。打算自己简单的模仿一下，加上后续阅读component.js的时候也集成进来。
对我来说，看代码写出点了不起的东西似乎可能性很低，那干脆就把自己理解的加上自己的想法简单的实现一下是是吧。
敬请期待，哈哈。

======
update on 05-06:
[demo] is here. with the source code.

[demo]: http://akecn.github.com/lab/ext-simulation/base.test.htm