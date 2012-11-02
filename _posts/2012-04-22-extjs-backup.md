---
layout: post
title: info as backup
category: extjs
published: false
---

EXTJS里面的代码，也有许多不怎么DRY的部分。
比如CLSS.own方法/EXT.Function.flexSetter等，在有些可以使用的地方也是另外去实现的。
目前看到的比较离谱的是Ext.Base.override方法。一致性的代码有三处之多。。
不知道是不是与Ext开发的流程有关呢。。呵呵

=========================

if (!Object.create) {  
    Object.create = function (o) {  
        if (arguments.length > 1) {  
            throw new Error('Object.create implementation only accepts the first parameter.');  
        }  
        function F() {}  
        F.prototype = o;  
        return new F();  
    };  
}
// Object.create的模拟实现
Object.create = function( proto, props ) {
  var ctor = function( ps ) {
    if ( ps )
      Object.defineProperties( this, ps );
  };
  ctor.prototype = proto;
  return new ctor( props );
};


Class.Base = function() {
    
};
Class.Base.prototype = {
    
};

Class.create = function(name, members) {
};
