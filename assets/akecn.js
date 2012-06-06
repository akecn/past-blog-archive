(function($) {
    function handleCodeTag() {
        $('pre.prettyprint').each(function(el) {
            $(el).addClass('linenums');
        });
    }
    $(function() {
        handleCodeTag();
    });
})(jQuery);
