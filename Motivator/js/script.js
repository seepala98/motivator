var fetchNewQuoteLocal = function(callback) {
  $.getJSON('./assets/quotes.json', function(data) {
    var r = Math.round(Math.random()*(data.length-1));
    var author = data[r][0];
    var quote = data[r][1];
    callback(quote, author);
  });
};

var fetchNewQuoteOnline = function(callback) {
  var data = {method: 'getQuote', format: 'json', lang: 'en'};
  $.post('http://api.forismatic.com/api/1.0/', data)
  .done(function(res, status) {
    if (status === 'success') {
      callback(res.quoteText, res.quoteAuthor);
    } else {
      fetchNewQuoteLocal(callback);
    }
  })
  .fail(function(xhr, status, error) {
    console.log(error);
    fetchNewQuoteLocal(callback);
  });
}

var changeQuote = function() {
  callback = function(quote, author) {
    $("p#quote, cite#author").fadeOut(function() {
      $("p#quote").text(quote).fadeIn(function() {
        $("cite#author").text(author).fadeIn();
      });
    });
  };
  fetchNewQuoteOnline(callback);
};

$(window).load(function() {
  changeQuote();
  setInterval(changeQuote, 50000);
});

function myFunction() {

var date_future = new Date().setHours(23,59);
var date_now = new Date();

var ctd = new Date().toLocaleDateString() +" "+new Date().toLocaleTimeString();
document.getElementById("clock").innerHTML = ctd;

var seconds = Math.floor((date_future - (date_now))/1000);
var minutes = Math.floor(seconds/60);
var minutes=minutes+1

document.getElementById("demo").innerHTML = minutes;
     
}

setInterval(myFunction,1000)