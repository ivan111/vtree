var args = require('system').args;
var page = require('webpage').create();
var url = args[1];

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.onLoadFinished = function() {
  page.evaluate(function() {
    var svg = document.getElementsByTagName('svg')[0];
    svg = svg.cloneNode(true);

    var tmp = document.createElement('div');
    tmp.appendChild(svg);

    console.log(tmp.innerHTML);
  });

  phantom.exit();
};

page.open(url);
