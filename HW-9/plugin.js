(function ($) {
    $.fn.applyHighlight = function () {
        this.each(function () {
            let text = $(this).text();
            let rate = parseFloat(text.match(/[\d\.]+/));

            if (!isNaN(rate)) {
                if (rate > 50) {
                    $(this).css("color", "red");
                } else if (rate > 10) {
                    $(this).css("color", "orange");
                } else {
                    $(this).css("color", "green");
                }
            }
        });
        return this;
    };
})(jQuery);
