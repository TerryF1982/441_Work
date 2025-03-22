(function ($) {
    $.fn.applyHighlight = function () {
        this.each(function () {
            let text = $(this).text();
            let rate = parseFloat(text.match(/[\d\.]+/)); // Extract the numeric exchange rate

            if (!isNaN(rate)) {
                if (rate > 50) {
                    $(this).css("color", "red"); // Highlight high exchange rates
                } else if (rate > 10) {
                    $(this).css("color", "orange"); // Moderate rates
                } else {
                    $(this).css("color", "green"); // Low exchange rates
                }
            }
        });
        return this; // Maintain jQuery chaining
    };
})(jQuery);
