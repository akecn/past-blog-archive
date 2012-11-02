-----
layout: post
title: 异步提交表单涉及到的IE跨域问题
---

关于异步表单提交，其实算是比较常见的一个场景。通过搜索我们可以搜到不少的资料，不少库/框架都有相应的实现，比如[jQuery.form 插件][1]、[KISSY.IO][2] 还有 [YUI][3] 等等。使用起来都很简单，比如下面的jQuery form插件的应用。

<pre>
// prepare the form when the DOM is ready
$(document).ready(function() {
    var options = {
        target:        '#output1',   // target element(s) to be updated with server response
        beforeSubmit:  showRequest,  // pre-submit callback
        success:       showResponse  // post-submit callback

        // other available options:
        //url:       url         // override for form's 'action' attribute
        //type:      type        // 'get' or 'post', override for form's 'method' attribute
        //dataType:  null        // 'xml', 'script', or 'json' (expected server response type)
        //clearForm: true        // clear all form fields after successful submit
        //resetForm: true        // reset the form after successful submit

        // $.ajax options can be used here too, for example:
        //timeout:   3000
    };

    // bind form using 'ajaxForm'
    $('#myForm1').ajaxForm(options);
});
</pre>

如果不涉及到file表单域的话，异步表单提交其实是很简单的。通过`form.elements`就可以获取到表单中所有的域对象，通过遍历表单域获取有效的值进行提交就可以了。这就是jQuery等库所谓的`.serialize()`方法。

那如果涉及到file表单域的话会有什么问题呢？
首先我们无法跨浏览器的获取file表单域的值；其次对于基础的XMLHttpRequest对象并不支持传递流数据。
这里提到了*基础*的XHR对象，意思是相对的，一些先进的浏览器（比如chrome，哈哈）实现的XHR对象已经支持更加丰富且有效的功能，比如FromData对象，比如XHR提交流数据的能力等等，[介绍见此][7]。
如果要实现全浏览器兼容的话，可以使用的一种方案是通过提交表单数据到隐藏的iframe来模拟异步提交的无刷新效果。

[原理很简单][9]：设置form表单的`target`属性指向一个隐藏的iframe元素；正常触发表单的submit提交；当表单提交有返回以后，脚本就可以从iframe中获取到对应的数据了。
通常异步表单提交的实现会整合到ajax模块中，而隐藏的iframe通常是动态创建的。这是典型的将复杂度隐藏在内部实现，对外暴露的接口足够的简洁易用啊。

文章标题提到的跨域问题，就是在获取iframe数据的时候发生的。当表单异步提交到后端，而处理程序遇到错误以后，通常网站会统一跳转到一个错误页面（404、500等）。若错误展示页面和表单所处的页面跨域了，我们就需要考虑增加跨域的解决方案了。如果所有页面都是在自己可控制的层面上的话，其实还不算是大问题。
但是在IE下，是有可能出现一些无法控制的跨域场景。我们知道IE浏览器有一个选项是“友好的HTTP错误提示”，如果启用了这个选项的话，当我们在访问页面的时候出现一些错误场景，IE浏览器会展示处于系统本地的一些所谓的“友好的错误提示页面”，比如[DNS错误][res://ieframe/]、[网站错误][res://ieframe/]等（请在window平台下用IE浏览器访问这两个链接，请注意地址栏的URL地址）。
KISSY和jQuery.form插件在实现上都没有捕获到这个场景下的异常，这会导致后续程序的中断，同时也没有触发注册到ajax的`error`处理函数——从这方面来讲，是有问题的。
在不修改库/框架的基础上，我们是否能判断出这种跨域问题呢？当时直接联想到的有三个方法：一是使用`try...catch`包裹调用接口的代码，但遗憾的是异步程序导致的异常是无法捕获到的；二是实时的去监控iframe的情况，在发起请求前开始启动计时器判断隐藏的iframe是否存在跨域的问题，即在load事件响应中尝试去获取iframe的内容，这个时候是可以通过`try...catch`捕获到异常的。但真正去实现的话，还是会有一些麻烦（比如动态生成的iframe没有任何可用来识别的特征的时候。。）；三就是在库/框架层面上去修改，这种方式当然更靠谱一些了。目前已经反馈到[KISSY ISSUES][https://github.com/kissyteam/kissy/issues/246]并得到修复。

[Demo示例][]

标题中提到了跨域，其实关于[跨域的解决方案][6]有很多，网上搜索一大把的资料。更主要的是，本文说的跨域是指在我们意料之外的跨域问题。
不过有一些关于跨域的方案比较少见，有兴趣的童鞋可以看下，[xdr规范][4]、[CORS][5]以及相当有趣的[跨子域的解决方案][8]。。

[1]: http://www.malsup.com/jquery/form/
[2]: http://docs.kissyui.com/docs/html/api/core/ajax/io.html#io.cfg.form
[3]: http://www.imranulhoque.com/javascript/ajax-file-upload-yahoo-api/
[4]: xdr
[5]: http://www.html5rocks.com/zh/tutorials/file/xhr2/#toc-cors
[6]: http://ued.alipay.com/wd/2008/12/17/%E4%B9%9F%E6%9D%A5%E8%B0%88%E8%B0%88%E5%AE%8C%E7%BE%8E%E8%B7%A8%E5%9F%9F/
[7]: http://www.html5rocks.com/zh/tutorials/file/xhr2/#toc-send-formdata
[8]: https://github.com/neocoder/jqxdr
[9]: http://joekuan.wordpress.com/2009/06/12/ajax-a-simplified-version-of-file-upload-form-using-iframe/