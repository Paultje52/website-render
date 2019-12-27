if (typeof socketio === "undefined") {
  let socketio = document.createElement("script");
  socketio.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
  document.getElementsByTagName("head")[0].appendChild(socketio);
}
if (typeof jquery === "undefined") {
  let jquery = document.createElement("script");
  jquery.src = "https://code.jquery.com/jquery-3.4.1.min.js";
  document.getElementsByTagName("head")[0].appendChild(jquery);
}

if (window.pages === undefined) {
  window.pages = {};
  let rendered = false;
  setTimeout(loaded, 500);

  function loaded() {
    let waiting = 0;
    let i = 0;
    let socket;
    try {
      socket = io(`http://${window.location.hostname}:${window.location.port}`);
    } catch(e) {
      let socketio = document.createElement("script");
      socketio.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
      document.getElementsByTagName("head")[0].appendChild(socketio);
      socket = io(`http://${window.location.hostname}:${window.location.port}`);
    }
    socket.emit("pages", false);
    socket.on("page", (data) => {
      window.pages[data.url] = data.body;
      i++;
      if (i === waiting) {
        console.log("Website fully rendered!");
        rendered = true;
      }
    });
    socket.on("window.pages", (object) => {
      $.ajax(`http://${window.location.hostname}:${window.location.port}/${object.testurl}?id=kjb4lt34uojk3b7&from=website-render`).done((id) => {
        id = id.id;
        object.array.forEach(a => {
          socket.emit("page", { path: a, id: id });
          waiting++;
        });
      })
    });
  }

  function WebsiteRenderButton(path = "/", addHistory = true, waitOnNotFullyRendered = true) {
    if (!window.pages[path] && !waitOnNotFullyRendered) return window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
    if (window.pages[path]) {
      $("body").html(window.pages[path]);
      if (addHistory) history.pushState(path, `${window.pages[path].split("<title>")[1].split("</title>")[0] || document.title} `, `http://${window.location.hostname}:${window.location.port}${path}`);
      if (window.pages[path].includes("<title>") && window.pages[path].includes("</title>")) document.title = window.pages[path].split("<title>")[1].split("</title>")[0];
    } else {
      let loading = document.createElement("div");
      loading.style = `display: block;position: absolute;top: 0;left: 0;z-index: 100;width: 100vw;height: 100vh;background-color: rgba(192, 192, 192, 0.5);background-image: url("https://i.stack.imgur.com/MnyxU.gif");background-repeat: no-repeat;background-position: center;`;
      document.title = `Loading ${path}`;
      $("body").append(loading);
      let int = setInterval(() => {
        if (rendered) {
          clearTimeout(timeout);
          clearInterval(int);
          if (!window.pages[path]) return window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
          $("body").html(window.pages[path]);
          if (addHistory) history.pushState(path, `${window.pages[path].split("<title>")[1].split("</title>")[0] || document.title} `, `http://${window.location.hostname}:${window.location.port}${path}`);
          if (window.pages[path].includes("<title>") && window.pages[path].includes("</title>")) document.title = window.pages[path].split("<title>")[1].split("</title>")[0];
        }
      }, 250);
      let timeout = setTimeout(() => {
        window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
      }, 2500);
    }
  }

  window.onpopstate = () => {
    if (history.state) WebsiteRenderButton(history.state, false);
  }
}