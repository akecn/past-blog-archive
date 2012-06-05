---
layout: post
title: Ext.define粗解析
category: extjs
---
首先我们看一下Ext定义组件，定义类的基本方式：

<pre class="prettyprint numline">
    Ext.define("AClass", {
        constructor: function() {
            
        },
        init: function() {
            
        },
        extend: "BClass",
        mixins: [
            {cObject: 'cObjectAMethod'}
        ],
        statics: {
            aMethod: function() {},
            bProperty: "b"
        }
    }, function(AClassSelf) {
        // callback on created
    });
</pre>

Ext支持在define方法的第二个参数中传入一些内置的属性/方法名。这些属性/方法会参与Class构建的过程中。
比如extend属性，会影响类的继承关系；statics中的方法会作为静态方法添加到类对象上；而mixins属性会将对应其他类中的指定方法添加到创建的类实例上，还有其他的一些上没有列出来的特殊定义，如config、alias、inheritableStatics、requires、override等等。

一开始看这块的时候感觉好纠结，看的不清不楚的。于是打算在之前写的[代码][1]基础上自己实现一下Ext.define方法。

[1]:http://akecn.github.com/lab/ext-simulation/base.test.htm

当时只是简单的构思了一下，但没有下手写。过了几天以后又拿起代码看，突然有种豁然开朗的感觉。于是还是打算自己写一个，但是借用Ext的实现思路。这两天一边看Ext的实现细节，一边自己写，看的非常绕。这也是为什么有人说，写代码容器，维护难的原因吧——看别人的代码是件很痛苦的事。而且确实，Ext的一些实现上很巧妙，是我没能想到的，有时候看的直惊叹来着。

ExtJS里面的类体系主要是Ext, Base, Class, ClassManager, Loader, AbstractPlugin和PluginManager。这里主要是讲Class和ClassManager在实现define方法上的一些分析以及前面提到的特殊属性/方法的接入方式，不会涉及到很细的实现点。

首先从ClassManager.define方法开始看。
方法首先对类的依赖进行分析和处理，然后调用ClassManager.create方法并将处理过的部分参数传入，进行下一步操作。

ClassManager.create方法则是创建一个类的重点。
它调用了Ext.Class类来创建一个实例，并传入了一个createdFn回调函数，用于实例创建完成以后进行调用。其实就是ClassManager层面接入特殊属性/方法的入口，与Class层面的特殊属性/方法接入入口的原理是一样的，所以我们先看Class中的实现，由子对象的实现开始，然后再看manager层面的实现。代码如下：

<pre class="prettyprint">
Ext.Class = Class = function(newClass, classData, onClassCreated) {
    // blah blah code

    var preprocessorStack = classData.preprocessors || Class.getDefaultPreprocessors(),
        registeredPreprocessors = Class.getPreprocessors(),
        index = 0,
        preprocessors = [],
        preprocessor, staticPropertyName, process, i, j, ln;

    // blah blah code

    delete classData.preprocessors;

    for (j = 0, ln = preprocessorStack.length; j < ln; j++) {
        preprocessor = preprocessorStack[j];

        if (typeof preprocessor == 'string') {
            preprocessor = registeredPreprocessors[preprocessor];

            if (!preprocessor.always) {
                if (classData.hasOwnProperty(preprocessor.name)) {
                    preprocessors.push(preprocessor.fn);
                }
            }
            else {
                preprocessors.push(preprocessor.fn);
            }
        }
        else {
            preprocessors.push(preprocessor);
        }
    }

    classData.onClassCreated = onClassCreated || Ext.emptyFn;

    classData.onBeforeClassCreated = function(cls, data) {
        onClassCreated = data.onClassCreated;

        delete data.onBeforeClassCreated;
        delete data.onClassCreated;

        cls.implement(data);

        onClassCreated.call(cls, cls);
    };

    process = function(cls, data) {
        preprocessor = preprocessors[index++];

        if (!preprocessor) {
            data.onBeforeClassCreated.apply(this, arguments);
            return;
        }

        if (preprocessor.call(this, cls, data, process) !== false) {
            process.apply(this, arguments);
        }
    };

    process.call(Class, newClass, classData);

    return newClass;
};    
</pre>

这块代码大致可以分为两个部分：收集特殊逻辑处理函数和执行处理函数。
在Class对象上存在以下几个属性/方法，是与上面的逻辑相关的，我们先看一下：

<pre class="prettyprint">
Ext.apply(Class, {
    // key-value的方式存储已经注册的预处理函数。即上面提到的，特殊属性和方法的处理逻辑函数。
    preprocessors: {},
    // 通过这个方法来注册内部的预处理方法。
    registerPreprocessor: function(name, fn, always) {
        this.preprocessors[name] = {
            name: name,
            always: always ||  false,
            fn: fn
        };

        return this;
    },
    // 获取默认的预处理函数列表。
    getDefaultPreprocessors: function() {
        return this.defaultPreprocessors || [];
    },
    // 通过这个方法来设置默认的预处理方法。defaultPreprocessors存储的主要是字符串，即预处理方法的方法名。
    setDefaultPreprocessors: function(preprocessors) {
        this.defaultPreprocessors = Ext.Array.from(preprocessors);

        return this;
    },
    // 设置/插入默认的预处理函数。这里涉及到预处理函数的依赖的一些原因。比如extend继承属性，可能就需要先加载相关的依赖对象等。
    // 这个方法在一定程度上解耦了一些依赖关系，这点可以在ClassManager中看出。
    setDefaultPreprocessorPosition: function(name, offset, relativeName) {
        var defaultPreprocessors = this.defaultPreprocessors,
            index;

        if (typeof offset == 'string') {
            if (offset === 'first') {
                defaultPreprocessors.unshift(name);

                return this;
            }
            else if (offset === 'last') {
                defaultPreprocessors.push(name);

                return this;
            }

            offset = (offset === 'after') ? 1 : -1;
        }

        index = Ext.Array.indexOf(defaultPreprocessors, relativeName);

        if (index !== -1) {
            Ext.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
        }

        return this;
    }
}
</pre>

从<code>preprocessorStack = classData.preprocessors || Class.getDefaultPreprocessors()</code>可以看出，实际上是允许我们在定义类时覆盖默认的一些预处理函数。而且，也允许我们在外部去添加内部定义的预处理函数。
这点可以从收集循环体中的判断里可以看出。若你传入的预处理函数是字符串，则会在内部已经注册的预处理函数字典中查找对应的处理函数。
由于内部预处理函数的always参数，它存在这个一个判断逻辑：该预处理函数是否始终执行，若<code>always=false</code>，则表示若没有传入该处理函数名需要的数据就不执行；若<code>always=true</code>，则表示该预处理函数始终执行，当然是否执行则还是依据<code>classData.preprocessors</code>或者<code>defaultPreprocessors</code>列表的内容来确定。

然后创建一个在所有预处理函数都执行完以后进行回调的函数，这其中也包含了传入的<code>onClassCreated Function</code>。一方面是除去临时创建的一些属性，另外还要将传入的属性/方法列表（classData）的余下的属性和方法添加到类的原型链上，这一步是由<code>implement</code>方法来实现的。

最后就是执行预处理函数。从已经收集到的预处理函数列表<code>preprocessors</code>中依次获取每一个函数，传入当前的类对象和<code>classData</code>。直到所有的预处理函数都执行完成以后，调用onClassCreated回调函数。返回类对象，Class的创建就结束了。

这是在创建类对象的时候进行的Class层面的预处理。而所谓的ClassManager层面的预处理，其实现方式其实是一样的，只是具体的上下文不一样而已。

其中有一段代码：

<pre class="prettyprint">
    if (postprocessor.call(this, clsName, cls, clsData, process) !== false) {
        process.apply(this, arguments);
    }
</pre>

之前一直觉得很奇怪，如果预处理函数返回false，就影响到了整个预处理的流程，这样做似乎不大好吧。
直到看了<code>singleton</code>的实现才似乎有些明白了，我认为其实就是为了满足类似这样的功能才增加了这么一层判断。<code>singleton</code>顾名思义，就是单例。所以第四个参数传递的是流程函数，用于在singleton内部直接调用，这样就可以解决把类对象更换为实例进行返回的场景了：

<pre>
 Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
    fn.call(this, name, new cls(), data);
    return false;
});
</pre>

然后我们说一下setDefaultPreprocessorPosition的作用。
假设有这么个场景，Class的一个预处理函数依赖了其他模块的一些功能，或者依赖了其他模块的一些处理。为了解耦或者其他的考虑，我们不能将这个预处理函数在Class类相关的模块中去实现，而要在依赖的模块中去实现。这时，就可以通过setDefaultPreprocessorPosition这个接口添加新的默认预处理函数，并且可以设置其对应的执行顺序。

<pre class="prettyprint">
Class.setDefaultPreprocessorPosition('xtype', 'last');
Class.setDefaultPreprocessorPosition('className', 'first');
Class.setDefaultPreprocessorPosition('loader', 'after', 'className');
Class
</pre>

有了这么一套预处理机制，后面就可以方面的去扩展和增强特定的特性。对于单个特性功能既便于维护也便于扩展，完美。

但还是有一些问题，比如因为存在<code>setDefaultPreprocessorPosition</code>，因为没有显式的申明预处理函数依赖了哪些模块或者其他的预处理函数，如果看的比较较真的话就会很纠结。比如我看extend的时候，就一直很纠结，明明传入的<code>extend</code>属性是字符串，是ClassName，但是在扩展extend预处理实现的时候是作为类对象来处理，直到后来了解了以上的流程以后，通过查看defaultPreprocessors才知道原来依赖了loader预处理函数。在loader预处理函数中替换了extend类名为对应的Class类对象。

而且就我看到的Ext.Class和Ext.ClassManager的代码来看，用<code>setDefaultPreprocessorPosition</code>方法来解耦Class和ClassManager的关系，但是在实现上Class的extend特性方法却是严重的依赖了loader特性。这让我觉得似乎这么做也没有太大的必要的感觉。获取是处于其他的考虑吧。。

PS：我下载的文档是ExtJS 4.0版本的，今天发现已经出了ExtJS 4.1。单从Class的实现上看，对实现代码进行了划分，将设置静态方法、搜集预处理函数和执行预处理函数划到各自的函数体中依次被调用，而不像4.0的实现都放在构造函数中定义。