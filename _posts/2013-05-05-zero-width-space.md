关于零宽空格
===

首先先说明一下什么是“零宽空格”：

> 零宽空格是一种不可打印的Unicode字符，用于可能需要换行处。零宽空格在Internet Explorer 6或以下版本不能支持。
> -[Wikipedia][1]

英文版本的[Wikipedia][2]相比中文版本要详实的多，但大体意思是一样的。
所谓零宽空格，从英文字面就可以理解了：`zero-width space`，就是没有宽度的空格。

在Unicode中，零宽字符的编码是`U+200B`，HTML中的实体符号是`&#8203;`。

首先我们在html页面中增加一个零宽字符：
<pre>
document.write("&amp;#8203;");
</pre>

页面中显示的内容就包含了一个零宽字符。那我们怎么将它过滤掉呢？

<pre>
document.body.innerHTML.replace("&amp;#8203;");
</pre>

其他浏览器下也许是工作正常的，但遗憾的是，在chrome下，上述方法是无效的。

为什么？因为零宽字符的HTML实体符号被自动的转成unicode编码存在了。
所以要在chrome下要过滤零宽字符，你需要过滤的是`\u200b`;

更多关于[“zero-width space”的信息见此][3]。

我们再延伸一下，是不是还有其他的零宽字符呢？

  - U+200B zero width space
  - U+200C zero width non-joiner Unicode code point
  - U+200D zero width joiner Unicode code point
  - U+FEFF zero width no-break space Unicode code point

这些都是零宽字符，分别是“[零宽空格符][3]”、“[零宽非连接符][5]”、“[零宽连接符][5]”和“[零宽非断行空白符][7]”（翻译的不一定准确，大致含义从名称上可以看出来；链接是各个字符的介绍和故事来源，有兴趣的可以看下）。

其中零宽非断行空白符(`U+FEFF`)跟BOM（Byte Order Mark）也有关系。


说到这里，HTML5中新增了一个[`<wbr>`标签][4]，发现它和零宽空格经常被用来解决连续字符过长的换行问题。它们在解决这个问题上效果几乎是一致的。
但相对来说，`<wbr>`是更语意的存在，而零宽空格有时候会带给我们一些意料之外的麻烦。
比如上面提到的chrome中编码的问题。

至于[`<wbr>`的兼容性][6]么，也就是这样了。。。。



[1]:http://zh.wikipedia.org/wiki/零宽空格
[2]:http://en.wikipedia.org/wiki/Zero-width_space
[3]:http://www.fileformat.info/info/unicode/char/200b/index.htm
[4]:http://www.w3.org/TR/html-markup/wbr.html#wbr
[5]:http://blogs.msdn.com/b/michkap/archive/2006/02/15/532394.aspx
[6]:http://www.quirksmode.org/oddsandends/wbr.html
[7]:http://blogs.msdn.com/b/michkap/archive/2005/01/20/357028.aspx