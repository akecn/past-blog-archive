---
layout: post
title: 通过伪选择符（:hover）显示的子元素事件无法触发
---

我们常常会见到所谓的纯css菜单的实现。其中采用的就是设置hover状态下的子元素显示的方式来处理鼠标悬浮事件。
原理是如下：
<pre class="prettyprint">
// style
.menu .submenu {
    display: none;
}
.menu .item:hover .submenu {
    display: block;
}
//html
<div class="menu">
    <div class="item">
        item1
        <div class="submenu">
            <div class="">sub item1</div>
            <div class="">sub item2</div>
        </div>
    </div>
</div>
</pre>

还可以看下[这个StackOverflow上的列子][1]。

这次遇到的问题，是在chrome下遇到的。通过上面的这种hover的放定义来显示的子元素，绑定在上面的相关事件无法被触发。
[示例在此][2]

造成这个问题的条件是：
    1. 绑定事件的元素，如果默认是隐藏的，且通过父元素的`:hover`样式来显示，则显示时的相关事件都无法被触发。
    2. 只要有相关的样式定义。即使直接设置元素的显示状态为显示，事件一样无效。

所以解决的方案就是，去掉示例中这块代码即可：

<pre class="prettyprint">
.b:hover .a {
    display: block;
}​
</pre>

但是幸运的是，chrome浏览器总是在背后默默的自动升级，在最新版本的Chrome 22版本上已经修复了这个问题。
所以遇上这个问题的几率应该可以忽略了～～

[1]:
[2]:http://fiddle.jshell.net/NJnYS/