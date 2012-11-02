---
layout: post
title: 开发人员才可能遇到的bug
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

还可以看下[这个StackOverflow上的列子][1]（问题不是关键，主要看答案中的示例）。
很多的交互效果都可以借着CSS的样式定义来简化脚本代码的复杂度，以上就是一个列子。

回到正题，先看以下的图片。左图是普通状态，右图是鼠标悬浮时的效果，点击删除icon的时候就会删除掉选中的图片。下方半透明栏采用的就是上述提到的方式来实现的。

![img](http://ww3.sinaimg.cn/mw690/61302639gw1dy8tf82rlsj.jpg

结果在chrome调试相关功能的时候，发现无论怎样点击“删除” icon 都无法触发绑定的点击事件。
排查的过程和各种心理状态就不在这里啰嗦了。总之，最后发现重现的条件大致如下：
    1. 绑定事件的元素，如果默认是隐藏的，且通过父元素的`:hover`样式来显示，则显示时相关事件都无法被触发。
    2. 只要有相关的样式定义。即使直接设置元素的显示状态为显示，事件一样无法触发。

这个[Demo][2]重现了这个情况。
所以解决的方案就是，去掉示例中这块代码：

<pre class="prettyprint">
.b:hover .a {
    display: block;
}​
</pre>

当然相关的效果就需要用脚本来实现了。

当时我认为总算是解决了一个chrome下的诡异bug。但是在Mac下的Chrome中再次尝试的时候，并没有重现这个问题。联想到最近代理的异常，觉得可能是在特定浏览器版本下的问题吧。
经过确认，台式机上的版本是v21，但是更新chrome到v22.0.1229.94以后，发现问题依然存在。
啊～难道是因为平台的原因。。太囧了。

于是打算简单记录分享，在写Demo的时候，无意间发现一个让我更崩溃的问题。
问题无法重现了！！！！

于是联想两次操作的各种差异来分析可能性，最终得到的结果是这样的：
当你打开控制台的时候，问题就能重现；当控制台关闭的时候，问题就没有了。

是的，这意味着对最终用户来说，一切都是正常的。只有苦逼的前端才会为了这种bug纠结和烦恼。。

ok，一次苦逼的排查到此为止，记录于此留作纪念。

update：今天找同事的机子测试了下，坑爹的发现居然没重现。这事儿没话说了。。让我疯了吧。。。。——2012-10-30

[1]:http://stackoverflow.com/questions/12392049/how-to-set-elements-hover-state-in-chrome-dev-tools-and-edit-childs-style
[2]:http://fiddle.jshell.net/NJnYS/2/