---
layout: post
title: ExtJS createInterceptor
category: extjs
---

Ext.Function.createInterceptor方法在我看来是个有趣的方法。
其主要功能是：创建一个拦截器，在目标方法执行之前，先判断拦截方法返回的值是否符合约定。

平常这样的场景还是比较常见的，比如html渲染之前判断是否符合规则、在数据保存操作之前先校验数据的完整性等等。

我个人常用的方案相当简单直接——在执行目标函数之前创建一个自定义事件接口（如果不适合直接耦合在相同模块中时）或直接在合适的位置上增加判断语句（属于模块的范畴）。看起来直接明了，易于理解且能达到目的。耦合什么的也不是问题。

而Ext的createInterceptor方法则是另一种方式。它的优点是能够在函数级别上限制代码的耦合。虽然我觉得还是要看实际的场景，不过这确实是一个思路。

<pre class="prettyprint">
function createInterceptor(originFn, judgeFn) {
    return function() {
        if(judgeFn()) {
            return originFn();
        }
    }
}
</pre>

这个东西同时让我想起了承玉之前写过的一个[工具函数][1]。关于重写函数本身来避免每次执行之前的判断的工具。大致原理如下：

[1]: http://yiminghe.iteye.com/blog/734867

<pre class="prettyprint">
function parseJSON(text) {
    var fn;
    if(window.JSON) {
        fn = function(txt) {
            return JSON.parse(txt);
        }
    }else {
        fn = myJSONParse;
    }
    parseJSON = fn;
    return fn(text);
} 
</pre>

这样的代码在执行上是不错的方式，尤其当涉及到的判断比较复杂的情况下也许会成为一个优化的方案。但在代码层面上，不够清晰也不易阅读和维护。
将逻辑操作本身和与之相关的逻辑进行剥离，利用额外的辅助工具将它们结合起来达到我们需要的目的，这样并不一定能让代码变得更易读，但代码一定会变得比较清晰，也易于维护。

编码的时候倒是可以多考虑一下这样的方式~~
