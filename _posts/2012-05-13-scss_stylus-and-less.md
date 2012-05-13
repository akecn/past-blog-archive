---
layout: post
title: SCSS/stylus和less对比
tags: SCSS stylus LESS
---
[SCSS]、[stylus]和[LESS]是一种CSS的预处理语言，它们为CSS增加了编程的特性，通过编译生成符合CSS规则的样式文件。它们会改变你书写CSS样式的方式，减少你的重复工作。

微博上[@johnhax]抛了一个[话题][1]，引来了一片大讨论。通过评论，发现[@johnhax]和[@玉伯也叫射雕]都比较推崇stylus。这点让我有些好奇以及一些些的不理解，stylus与其他css预编译框架的差别是什么？

[@玉伯也叫射雕]提到一点，<cite>SCSS/LESS/Stylus 三者间，功能大同小异，最漂亮简洁的是 Stylus.</cite>。python是我知道的用“缩进”的方式来表示嵌套规则的语言之一，而SCSS和stylus也支持这种方式。这看起来是它们强大的一方面，至少LESS就不支持这种方式。
就我个人而言，我喜欢python的缩进语法，它看起来简洁漂亮。但是套用到CSS预编译框架来使用的话，我反而觉得这是一个缺点了。

python是独立的语言，它的基础语法就涉及到了关于缩进的使用——这是它天然的一部分。前端攻城师都知道CSS，但却不一定会知道SCSS/stylus，缩进的规则就很有可能被破坏，当然从某一方面来讲这并不是什么大的问题——一切在造成错误之前就能检测到的问题都不会是太大的问题。但它天生就有了学习的成本，这个学习成本不像python——前端攻城师不一定要了解SCSS/stylus才能做前端开发。

当然，SCSS和stylus其实也支持CSS的语法规则。记得以前看python和ruby对比的文章，大部分都会提到一点：python的社区在解决问题的方式上通常比较一致；而ruby则太灵活了，容易产出许多“奇技淫巧”式的代码，不利于团队的维护。
我觉得可以套用一下，LESS只支持CSS的语法规则，而SCSS/stylus则允许其他的语法规则，这点并不利于团队的维护（当然可以用团队规范来约束，但也要看你执行的效果）。

<pre class="prettyprint linenums">
// stylus支持的语法规则
/* style.styl */
h1 {
  color: #0982C1;
}

/* omit brackets */
h1
  color: #0982C1;

/* omit colons and semi-colons */
h1
  color #0982C1
</pre>

stylus支持很多的功能，有些功能属于“看起来很美”，但事实是否必要需要再议。比如条件判断比如循环语句，我怀疑是否真的有这样的需求场景，哪怕有，我也不认为把这样的逻辑判断带到样式中是不合理的——无端的增加了样式的复杂度——CSS应该只负责渲染展示而不该牵涉到太多的逻辑判断。但其中的Interpolation功能又是我觉得非常有用的功能——LESS目前并不支持这一语法，它能让组合富有动态的性质（不过如何去控制它带来的复杂度呢）。

<pre class="prettyprint linenums">
vendor(prop, args)
    -webkit-{prop} args
    -moz-{prop} args
    {prop} args

  border-radius()
    vendor('border-radius', arguments)

  box-shadow()
    vendor('box-shadow', arguments)

  button
    border-radius 1px 2px / 3px 4px
</pre>

LESS与SCSS/stylus不同的是，它允许你在开发时不去关心编译的问题（支持js动态编译、支持NodeJS）。相比SCSS/stylus，它在继承规则上有些弱([这篇文章][2]的Inheritance部分)。

<h3>SCSS & stylus</h3>
<pre class="prettyprint linenums">
.block {
  margin: 10px 5px;
  padding: 2px;
}

p {
  @extend .block; /* Inherit styles from '.block' */
  border: 1px solid #EEE;
}
ul, ol {
  @extend .block; /* Inherit styles from '.block' */
  color: #333;
  text-transform: uppercase;
}
</pre>
<h3>Compiled CSS (Sass & Stylus)</h3>
<pre class="prettyprint linenums">
.block, p, ul, ol {
  margin: 10px 5px;
  padding: 2px;
}
p {
  border: 1px solid #EEE;
}
ul, ol {
  color: #333;
  text-transform: uppercase;
}
</pre>

其他方面，三者其实相差不大。有一句话说：工具的选择往往都是个人的喜好问题，语言也是。所以我只是表达一下自己的看法，纯粹的也是个人的喜好问题，欢迎大家拍砖[@ake87]。

[@johnhax]: http://www.weibo.com/haxy
[@玉伯也叫射雕]:http://www.weibo.com/lifesinger
[@ake87]:http://www.weibo.com/ake87
[SCSS]:http://sass-lang.com/
[stylus]:http://learnboost.github.com/stylus/
[LESS]:http://lesscss.org
[1]:http://www.weibo.com/1960954893/yiMUR5vMT
[2]:http://net.tutsplus.com/tutorials/html-css-techniques/sass-vs-less-vs-stylus-a-preprocessor-shootout/