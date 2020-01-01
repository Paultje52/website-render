// Where the magic happens
if (window.pages === undefined) {
  // Importing socket.io
  if (typeof socketio === "undefined") {
    let socketio = document.createElement("script");
    socketio.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
    document.getElementsByTagName("head")[0].appendChild(socketio);
  }
  // Importing jquery
  if (typeof jquery === "undefined") {
    let jquery = document.createElement("script");
    jquery.src = "https://code.jquery.com/jquery-3.4.1.min.js";
    document.getElementsByTagName("head")[0].appendChild(jquery);
  }

  // Checking if the document is ready (Checking if you can use socket.io and jquery)
  function dockReady(fn) {
    let i = setInterval(() => {
      try {
        $(document).ready(() => { });
        io.Manager;
        clearInterval(i);
        fn();
      } catch (e) { }
    });
  }

  // When the document is ready
  dockReady(() => {
    loaded();
    $("body").empty();
    WebsiteRenderButton(`/${window.location.path || ""}`, true, false, false);
  });

  // Show the loading icon until website-render loaded everything.
  window.loading = false;
  if (window.showLoadingIndication) {
    let loadingElement = document.createElement("div");
    loadingElement.style = `display: block;position: absolute;top: 0;left: 0;z-index: 100;width: 100vw;height: 100vh;background-color: rgba(192, 192, 192, 0.5);background-image: url("https://i.stack.imgur.com/MnyxU.gif");background-repeat: no-repeat;background-position: center;`;
    loadingElement.id = "websiteRenderLoadingIcon";
    setTimeout(() => {
      document.getElementsByTagName("body")[0].appendChild(loadingElement);
    }, 100);
    window.loading = true;
  }
  // Presetting
  window.pages = {};
  window.pageTitles = {};
  let rendered = false;

  function wait(time) {
    return new Promise((res) => {
      setTimeout(res, time);
    });
  }

  // On page load
  async function loaded() {
    let waiting = 0;
    let i = 0;
    // Starting the websocket
    let socket;
    try {
      socket = io(`http://${window.location.hostname}:${window.location.port}`);
    } catch (e) {
      let socketio = document.createElement("script");
      socketio.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
      document.getElementsByTagName("head")[0].appendChild(socketio);
      await wait(1000);
      socket = io(`http://${window.location.hostname}:${window.location.port}`);
    }
    // Asking for the website pages
    socket.emit("pages", false);
    // For each page
    socket.on("page", (data) => {
      window.pages[data.url] = data.body;
      window.pageTitles[data.url] = data.title || false;
      i++;
      if (i === waiting) {
        console.log("[WEBSITE RENDER] Website fully rendered!");
        rendered = true;
        if (window.loading) $("#websiteRenderLoadingIcon").remove();
      }
    });
    // When getting all the pages
    socket.on("pages", (object) => {
      // Sending the test url
      $.ajax(`http://${window.location.hostname}:${window.location.port}/${object.testurl}?id=kjb4lt34uojk3b7&from=website-render`).done((id) => {
        id = id.id;
        object.array.forEach(a => {
          // Sending the individual page requests
          socket.emit("page", { path: a, id: id });
          waiting++;
        });
      });
    });
  }

  // Website Render Button Function
  window.been = [window.location.pathname];
  function WebsiteRenderButton(path = "/", waitOnNotFullyRendered = true, addHistory = true) {
    // If the page isn't loaded and website-render isn't done yet
    if (!window.pages[path] && !waitOnNotFullyRendered) return window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
    if (window.pages[path]) { // When the requested page is loaded
      if (window.been.includes(path)) window.pages[path] = removeScripts(window.pages[path]);
      let toSend = window.pages[path].split("<FORCESCRIPT>").join("<script>").split("</FORCESCRIPT>").join("</script>");
      $("body").html(toSend);
      if (toSend.includes("<title>") && toSend.includes("</title>")) document.title = toSend.split("<title>")[1].split("</title>")[0];
      if (window.pageTitles[path]) document.title = window.pageTitles[path];
      if (addHistory) history.pushState(path, `${document.title} `, `http://${window.location.hostname}:${window.location.port}${path}`);
      window.been.push(path);
    } else { // When the page isn't loaded yet
      // Loading indication
      let loading = document.createElement("div");
      loading.style = `display: block;position: absolute;top: 0;left: 0;z-index: 100;width: 100vw;height: 100vh;background-color: rgba(192, 192, 192, 0.5);background-image: url("https://i.stack.imgur.com/MnyxU.gif");background-repeat: no-repeat;background-position: center;`;
      document.title = `Loading ${path}`;
      $("body").append(loading);
      // Interval for checking if website-render is done
      let int = setInterval(() => {
        if (rendered) { // When website-render is done
          clearTimeout(timeout);
          clearInterval(int);
          if (!window.pages[path]) return window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
          let toSend = window.pages[path].split("<FORCESCRIPT>").join("<script>").split("</FORCESCRIPT>").join("</script>");
          $("body").html(toSend);
          if (toSend.includes("<title>") && toSend.includes("</title>")) document.title = toSend.split("<title>")[1].split("</title>")[0];
          if (window.pageTitles[path]) document.title = window.pageTitles[path];
          if (addHistory) history.pushState(path, `${document.title} `, `http://${window.location.hostname}:${window.location.port}${path}`);
          window.been.push(path);
        }
      }, 250);
      // Fail safe, for if something went wrong while rendering (Like an server error)
      let timeout = setTimeout(() => {
        // 2,5 seconds after clicking the button, the page will be force-reloaded
        window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
      }, 2500);
    }
  }

  // Function to remove the scripts for every page that allready loaded before.
  function removeScripts(html) {
    if (!html.includes("script")) return html;
    let output = "";
    let level = 0;
    let handle = (s) => {
      if (s.includes("<script>")) {
        if (level === 0) output += s.split("<script>")[0];
        level++;
        handle(s.split("<script>").slice(1).join("<script>"));
      }
      if (s.includes("</script>")) {
        s = s.split("</script>")[s.split("</script>").length - 1];
        level--;
      }
      if (level <= 0) output += s;
    }
    handle(html);
    output = output.split("<forcescript>").join("<script>").split("</forcescript>").join("</script>");
    return output;
  }

  // For the "back" button in browsers
  window.onpopstate = () => {
    if (history.state) WebsiteRenderButton(history.state, true, false);
  }
} else rendered = true;