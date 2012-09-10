---
layout: post
title: 支持滑动门效果的按钮在部分浏览器下的显示问题
---

`:link`、`:visited`、`:hover`、`:active`、`:focus`，这几个都是我们比较常见的伪类（pseudo-class）。
分别表示“默认状态”、“访问过后显示状态”、“鼠标的悬浮状态”、“触发中状态”、“聚焦状态”。最常见是在`A`标签的样式定义，`focus`则见于`Input`标签。嗯，这个才是我要说的，so 先入正题先。

在创建具有[滑动门效果][3]的按钮DPL时，发现在IE下active的显示状态会将背景向右下偏移，导致背景上出现空隙。一开始以为是`:active`伪类默认存在一些`margin或者padding`的定义，但修改以后没有效果。如下：

[img](http://ww4.sinaimg.cn/mw690/61302639gw1dwrohtjylej.jpg)

在IE下（任意版本）保持`mousedown`状态时就会看到下图的效果。
后来就去找其他人实现的效果，直到看到这篇《[Styling the button element with sliding doors
][1]》以及[Demo][4]才得以解决！

解决方案很简单，设置`Button`标签内的标签的`position:relative`即可解决。

另外在FF下遇到的背景偏移的问题，这篇文章的评论中也有提到，具体解决方案见[bugzilla][2]。

[img](http://ww4.sinaimg.cn/mw690/61302639gw1dwrohum54pj.jpg)

[1]:http://filamentgroup.com/lab/styling_the_button_element_with_sliding_doors_archived/
[2]:https://bugzilla.mozilla.org/show_bug.cgi?id=140562
[3]:http://www.w3cn.org/article/translate/2005/112.html
[4]:http://filamentgroup.com/examples/buttonElement/