var express = require('express')
var app = express()

app.get('/', function(req, res) {
  res.send('Hello World!')
})

app.get('/crawler', function(req, res, next) {
  var url = req.query.url;

  console.log(url);

  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;

  new(require("js-crawler"))().configure({ depth: 1 }).crawl(url, function onSuccess(page) {

    var longUrl = (url.endsWith("/")) ? url : (url + "/");

    var shortUrl = (url.replace("http://", "http:").replace("https://", "https:")).split("/")[0];
    shortUrl = shortUrl.replace("http:", "http://").replace("https:", "https://");

    const dom = new JSDOM(page.content);

    var links = dom.window.document.querySelectorAll("img, link, a, script");
    for (var i = 0; i < links.length; i++) {
      if (links[i].hasAttribute("src")) {
        if (!links[i].getAttribute("src").startsWith("http://") && !links[i].getAttribute("src").startsWith("https://")) {
          if (links[i].getAttribute("src").startsWith("/")) {
            links[i].setAttribute("src", shortUrl + links[i].getAttribute("src"));
          } else {
            links[i].setAttribute("src", longUrl + links[i].getAttribute("src"));
          }
        }
      }

      if (links[i].hasAttribute("href")) {
        if (!links[i].getAttribute("href").startsWith("http://") && !links[i].getAttribute("href").startsWith("https://")) {
          if (links[i].getAttribute("href").startsWith("/")) {
            links[i].setAttribute("href", shortUrl + links[i].getAttribute("href"));
          } else {
            links[i].setAttribute("href", longUrl + links[i].getAttribute("href"));
          }
        }
      }
    }

    dom.window.document.querySelector("head").insertAdjacentHTML('beforeend', '<meta charset="UTF-8">');

    res.send(dom.window.document.querySelector("html").innerHTML);
  });
});

app.listen(3000, function() {
  console.log('Simple Node Crawler listening on port 3000!')
});