// keys.js:
// module.exports = {  
//     public: "<public key>",
//     secret: "<secret key>",
//     private: "<private key>"
// };
  
// ### Getting your key and token
// * [Generate your developer key][devkey] and supply it as the first constructor parameter.
// * To read a user’s private information, get a token by directing them to `https://trello.com/1/connect?key=<PUBLIC_KEY>&name=MyApp&response_type=token` replacing, of course, &lt;PUBLIC_KEY&gt; with the public key obtained in the first step.
// * If you never want the token to expire, include `&expiration=never` in the url from the previous step.
// * If you need write access as well as read, `&scope=read,write` to the request for your user token.

// [devkey]: https://trello.com/1/appKey/generate

require('logthis').config(
    { _on: true,
    'connect': 'debug' });

var log = require('logthis').logger._create('connect');
  
var keys = require("./keys");  
var Trello = require("node-trello");
var t = new Trello(keys.public, keys.private);

t.get("/1/members/michielvanoosten", function(err, data) {
  if (err) throw err;
  console.log(data);
});
  
t.get("/1/boards/52c4c583101ead8a34004a50", function(err, data) {
  if (err) throw err;
  console.log(data);
});

// URL arguments are passed in as an object.
// t.get("/1/members/me", { cards: "open" }, function(err, data) {
//   if (err) throw err;
//   console.log(data);
// });
