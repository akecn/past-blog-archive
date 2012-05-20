---
layout: post
title: 不同浏览器下console.log
---

针对以下代码做调试的时候在不同的浏览器下，你可能会比较看到一些差异。
<pre class="prettyprint">
function print(data) {
	console.log(typeof data, data);
	data.push("test");
	console.log(typeof data, data);
}
print([]);
// firebug
object []
object ["test"]
// chrome
object ["test"]
object ["test"]
</pre>

根据我们对JS的了解，很显然chrome的显示其实符合JS的执行的。但是在debug的场景下，却可能会被认为是bug。

至少就我个人来说，chrome的执行结果是符合我自己的预期的：log时传入的参数是对象，打印到console控制台的也就是这个对象的引用；firebug打印的结果绝对不是原先的那个对象，而是当时对象的一个状态结果（个人猜测是采用clone的方式来拷贝当时的对象内容并显示出来）。

<pre class="prettyprint">
console.log = function(arg) {
	return JSON.parse(JSON.stringify(arg));
}
</pre>

在chrome下只有点击了打印的结果以后才能输出真正的当时（点击时）的内容。而firebug下在控制台中打印的是console.log执行时的结果，但是点击打印的结果会跳转到该对象引用的列表页面——这里的内容是该对象的实际值。

通过搜索，发现许多人认为这是chrome（webkit）的一个bug，事实上在[WebKit Bugzilla][1]上也有人提交了这样bug描述，状态依然还是UNCONFIRMED。比如[这篇文章][2]更详细的去分析了console.log的实现，还有这篇简单的提到了这个问题。

就我一开始的说法，我还是不认为这是bug：console的实现并没有一个统一的规范，只能说是不同的开发商对实现有不同的理解。没有对错，只是实现不同而已。

[1]:https://bugs.webkit.org/show_bug.cgi?id=35801
[2]:http://techblog.appnexus.com/2011/webkit-chrome-safari-console-log-bug/
[3]:http://lichgo.com/chrome-console-bug/
