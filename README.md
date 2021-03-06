# Website-Render
Make your website faster for the user with minimal changes!

**Current version:** V1.0.6. The changes are listed here.
* Fixed support for safari (And other webbrowsers on ios devices)
* Fixed a bug with the "FORCESCRIPT" tag
* Made the loading of webpages a bit faster, every nano second counts!

**Bugs, feature proposal or support:** Click [here](https://github.com/Paultje52/website-render/issues/new/choose).

## Menu
* [Why](#why)
* [How](#how)
* [Docs](#docs)
* [A small example](#example)
* [API](#api)

# Why
You can make very fast websites for users with Website-Render.

What Website-Render does, is load the pages of your website in the background and display them instantly when the user wants to.

Website-Render users express and ejs.

# How?
The back-end code of Website-Render is just like that of an [express](https://expressjs.com) app with [ejs](https://ejs.co/).

When you create your back-end with Website-Render, just use the express syntax (app.get, with req and res, etc). You can use `app.page` for a page that will load on the background.

**Load in the background? What do you mean?**
When a user loads a page, all the pages will be loaded in the background. And when the user clicks on a page, the new page will be displayed right away!

**How?**
All the pages are sent to the user via a websocket with [socket.io](https://socket.io/).

**Is it safe?**
Yes, it's safe. Before the pages are loaded in the background, a call will be made to a test endpoint. And for every page, the test data will be sent, so you can still check the cookies etc.

# Docs
## Docs menu
* [App Constructor](#app-constructor)
* [Express Methods](#express-methods)
* [Set](#set)
* [Page](#page)
* [Start](#start)
* [Front-end](#front-end)

## App Constructor
When you load in Website-Render, you will get a class. You can create your app by constructing.

There is only one parameter while constructing the app: The portnumber.
This needs to be a number AND between 80 and 65535.
```js
const websiteRender = require("website-render");
let app = new websiteRender(8080);
```

## Express methods
The `app` class supports a couple express methods:
* These http methods: `checkout`, `copy`, `delete`, `get`, `options`, `patch`, `post`, `purge`, `put`, `search`, `trace`, `subscribe` and `unsubscribe`. Just use `app.METHOD`
* Enable and Disable: `app.enable(thing)` or `app.disable(thing)`
* Use: `app.use()`
* In the object parameters for the methods and use: `req` and `res` and all the variables/functions with it.

For example, you can make a get and a post method.
```js
const websiteRender = require("website-render");
let app = new websiteRender(8080);
app.get("/", (req, res) => {
  // ...
});
app.post("/", (req, res) => {
  // ...
});
```

## Set
To change settings, you can use the set method: `app.set("key", "value")`.
You can change this.
| Key      | Explanation             | Value type | Example |
| -------- |:---------------------| -------  | ------- |
| Port     | The port that wil be used | Number     | app.set("port", 8080);
| testurl      | The url that will be called for testing permissions    | String | app.set("testurl", "test") |
| frontEndUrl | The url for the front-end code | String | app.set("frontEndUrl", "websiteRender") |

## Page
You can use this just like `app.get`. Every endpoint with `app.page` will be send to the user to load in the background.

Here you get, just like `app.get`, the `req` and `res` parameters. But, there is one difference. You can only use `res.send` and `res.render` with ejs to send pages to the user. Otherwise the page won't be sent to the user.

```js
app.page("/", (req, res) => {
  res.render("index.ejs", {
    ip: req.ip
  });
});
```

## Start
You need to start your app when you loaded the pages, express endpoints, etc. It's very important to start your app as last, because the websocket will be made then.

```js
// Creating an app and making the endpoints
app.start(() => {
  console.log(`Online on ${app.port}!`);
});
```
You can make a function for the start, or you can use await (if you are in an async environment).
```js
// This is an async environment
// Creating an app and making the endpoints
await app.start();
console.log(`Online on ${app.port}!`);
```

## Front-end
### **Background code**
You also need to add one line of code in the head of your front-end html code. You need to put this in every page in the header! This is to load in the front-end code.

```html
<head>
  <script src="/websiteRender.js"></script>
  <!-- Your other stuff -->
</head>
```
By default, the front-end code is located at `/websiteRender.js`, but you can change it with `app.set("frontEndUrl", "URL")`, for example:

Server.js:
```js
// Creating app
app.set("frontEndUrl", "frontEndCode");
// Other stuff
```
All your html pages:
```html
<head>
  <script src="/frontEndCode.js"></script>
  <!-- Your other stuff -->
</head>
```
### **Buttons**
For the button functionality, you need to add this to every button `onclick` event that you want to use to redirect to an other page.
```js
WebsiteRenderButton(`/PATH`)
```
For example, this is a button (with w3css) that redirects to the "about" page.
```html
<button class="w3-button w3-green" onclick="WebsiteRenderButton(`/about`)">About</button>
```
### Loading indication
If you want to show a loading indication until website-render loaded every page, you can do that by setting `window.showLoadingIndication` to `true` before loading the front-end code. Here is an example.
```html
<head>
  <script>
    window.showLoadingIndication = true;
  </script>
  <script src="/websiteRender.js"></script>
  <!-- Your other stuff -->
</head>
```

### Other tags
Website-Render does some thing with two tags: the title tag and the script tag.

**Title tag:**
The title tag is the only thing that will be sent from the head. There is nothing else from the head tag that website-render will sent, so save bandwidth.
**Script tag:**
Website-render will only use a script tag once per page. This is because otherwise there will be some problems because scripts will be executed multiple times.
If you have a script that you want to execute each time a user gets a page, use the tag \<FORCESCRIPT> and \</FORCESCRIPT> in stead of \<script> and \</script>.

**And that's it!**


# Example
You can find an example [here](/test).

# API
## API Menu
* [Class `website-render`](#class-website-render)
  * [Constructor](#constructor)
  * [Function: Set](#function-set)
  * [Function: Page](#function-page)
  * [Function: METHOD](#function-method)
* [Front-end](#front-end-things)
  * [When loaded](#when-loaded)
  * [Function: Loaded](#function-loaded)
  * [Function: Wait](#function-wait)
  * [Function: WebsiteRenderButton](#function-websiterenderbutton)
  * [Function: Remove scripts](#function-removescripts)
## Class `website-render`
### > **Constructor**
Crates an app for `website-render`.

**Parameters:**
* Port: Required: Number between 80 and 65535.

**Returns:**
_Nothing_


### > **Function: Set**
Set's a key to a value in the app.

**Parameters:**
* Key: Required: String
* Value: Required: Anything

**Returns:**
_Nothing_


### > **Function: Page**
Crates a page to load in the background. For normal http requests, this is just an endpoint.

**Parameters:**
* Endpoint: Required: String
* Function to call: Required: Function -> Parameters: [req](https://expressjs.com/en/4x/api.html#req) and [res](https://expressjs.com/en/4x/api.html#res) (From [express](https://expressjs.com/))

**Returns:**
_Nothing_


### > **Function: METHOD** 
METHOD can be: checkout, copy, delete, get, options, patch, post, purge, put, search, trace, subscribe and unsubscribe.

Just normal express endpoints. More information [here](https://expressjs.com/en/4x/api.html#app.METHOD).

## Front-end Things
### > **When loaded**
When the front-end code is loaded, it will load "socketio" and "jquery" automaticly.<br>
When it's loaded in the first page, it will also call the function [loaded](#Function-Loaded).

### > **Function: Loaded**
This function will connect to the websocket and load all the pages.

### > **Function: Wait**
This function is meant for internal use. It needs one parameter, the time to wait in MS.<br>
The only thing it does is promify "setTimeout".

### > **Function: WebsiteRenderButton**
With tis function you can make your buttons.

**Parameters**
* Path: The path for the page you want to make visable, for example `/about`. **Required**
* WaitOnNotFullyRendered: When website-render didn't load all the pages yet, you can choose to let the user wait until all the pages are loaded. When this is true, the user will see a loading icon until website-render is done. **Optional**, default value = true.
* AddToHistory: If website-render needs to add the old page to the history (So the user can click the back button in the browser). **Optional**, default value = true.

**Returns:**
_Nothing_.

### > **Function: RemoveScripts**
This function removes all the \<script> tags with everything within it. It replaces the \<FORCESCRIPT> tags with \<script>.

**Parameters**
* Html: The html code to change. **Required**

**Returns**<br>
The changed html code.