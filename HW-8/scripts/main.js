var imageSelector = "#image1";
var allImages = ["images/image1.jpg", "images/image2.jpg", "images/image3.jpg", "images/image4.jpg"];
var currentImageIndex = 0;

var quotes = [
    "“The only thing we have to fear is fear itself.” - Franklin D. Roosevelt",
    "“Ask not what your country can do for you – ask what you can do for your country.” - John F. Kennedy",
    "“In the end, it's not the years in your life that count. It's the life in your years.” - Abraham Lincoln",
    "“America is another name for opportunity.” - Ralph Waldo Emerson",
    "“My fellow citizens, we cannot escape history.” - Abraham Lincoln"
];

var currentQuoteIndex = 0;

$(document).ready(function () {
    $("#quote-display").text(quotes[currentQuoteIndex]);
    $(imageSelector).attr("src", allImages[currentImageIndex]);

    setInterval(changeImage, 3000);
    setInterval(changeText, 4000);
    setInterval(switchShapes, 5000);
    
    $("#move").click(function () {
        moveSquare();
        moveCircle();
    });
});

function moveSquare() {
    $("#square").animate({ left: "10%" }).animate({ top: "30%" }).animate({ left: "10%" }).animate({ top: "10%" });
}

function moveCircle() {
    $("#circle").animate({ right: "10%" }).animate({ top: "30%" }).animate({ right: "10%" }).animate({ top: "10%" });
}

function changeImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    $(imageSelector).fadeOut(function () {
        $(this).attr("src", allImages[currentImageIndex]).fadeIn();
    });
}

function changeText() {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    $("#quote-display").fadeOut(function () {
        $(this).text(quotes[currentQuoteIndex]).fadeIn();
    });
}

function switchShapes() {
    $("#square").fadeOut().fadeIn();
    $("#circle").fadeOut().fadeIn();
}
