$(document).ready(function () {
    $.getJSON("exchange.json", function (data) {
        let rates = data.rates;
        let dropdown = $("#currency");
        let output = $("#exchange-data");

        $.each(rates, function (currency, rate) {
            dropdown.append(`<option value="${currency}">${currency}</option>`);
        });

        function displayRate(selectedCurrency) {
            let rate = rates[selectedCurrency];
            output.html(`<p>1 ${data.base} = <strong>${rate} ${selectedCurrency}</strong></p>`);
            output.applyHighlight();
        }

        displayRate("USD");

        dropdown.on("change", function () {
            displayRate($(this).val());
        });

    }).fail(function () {
        $("#exchange-data").html("<p>Error loading exchange data.</p>");
    });
});


