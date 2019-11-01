// First: Let's load in the package.
const websiteRender = require("website-render");
// Then we will make an app instance on port 8080
let app = new websiteRender(8080);

// We can just use express in our website render app.
app.use((req, _res, next) => {
  console.log(`Request from ${req.ip} to ${req.url}`);
  next();
});

/* 
 Now, let's make some pages! 
 To make pages load in the background of your website, you need to use `app.page`.
 You can use `app.get` or other methods for a normal express app.
*/
app.page("/", (_req, res) => { // Index
  res.render("index.ejs", {
    name: "Test"
  });
});
app.page("/about", (_req, res) => { // About
  res.render("about.ejs", {
    name: "About"
  });
})
app.page("/news", (_req, res) => { // News
  res.render("news.ejs", {
    name: "News"
  });
});

// Last, but not least, let's start the app
app.start(() => { // It's important to start the app as last, because otherwise the `app.use` methods will not be called for the test
  console.log("Online!");
});