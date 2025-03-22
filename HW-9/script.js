$(document).ready(function () {
    $.getJSON("exchange.json", function (data) {
        let rates = data.rates;
        let dropdown = $("#currency");
        let output = $("#exchange-data");

        // Populate the dropdown with currency options
        $.each(rates, function (currency, rate) {
            dropdown.append(`<option value="${currency}">${currency}</option>`);
        });

        // Function to display exchange rate
        function displayRate(selectedCurrency) {
            let rate = rates[selectedCurrency];
            output.html(`<p>1 ${data.base} = <strong>${rate} ${selectedCurrency}</strong></p>`);
            output.applyHighlight(); // Apply the jQuery plugin
        }

        // Display default exchange rate (USD)
        displayRate("USD");

        // Update display when a new currency is selected
        dropdown.on("change", function () {
            displayRate($(this).val());
        });

    }).fail(function () {
        $("#exchange-data").html("<p>Error loading exchange data.</p>");
    });
});



