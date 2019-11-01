if (typeof socketio === "undefined") {
  let socketio = document.createElement("script");
  socketio.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js";
  document.head.appendChild(socketio);
}
if (typeof jquery === "undefined") {
  let jquery = document.createElement("script");
  jquery.src = "https://code.jquery.com/jquery-3.4.1.min.js";
  document.head.appendChild(jquery);
}

let pages = {};
setTimeout(() => {
  loaded(true);
}, 500);

function loaded() {
  let waiting = 0;
  let i = 0;
  let socket = io(`http://${window.location.hostname}:${window.location.port}`);
  socket.emit("pages", false);
  socket.on("page", (data) => {
    pages[data.url] = data.body;
    i++;
    // if (i === waiting && typeof rendered === "undefined") {
    //   console.log("Website fully rendered!");
    //   let rendered = true;
    // }
  });
  socket.on("pages", (object) => {
    $.ajax(`http://${window.location.hostname}:${window.location.port}/${object.testurl}?id=kjb4lt34uojk3b7&from=website-render`).done((id) => {
      id = id.id;
      object.array.forEach(a => {
        socket.emit("page", { path: a, id: id });
        waiting++;
      });
    })
  });
}

function WebsiteRenderButton(path = "/", addHistory = true) {
  if (!pages[path]) return window.location.href = `http://${window.location.hostname}:${window.location.port}${path}`;
  $("body").html(pages[path]);
  if (addHistory) history.pushState(path, `${pages[path].split("<title>")[1].split("</title>")[0] || document.title} `, `http://${window.location.hostname}:${window.location.port}${path}`);
  if (pages[path].includes("<title>") && pages[path].includes("</title>")) document.title = pages[path].split("<title>")[1].split("</title>")[0];
}

window.onpopstate = () => {
  if (history.state) WebsiteRenderButton(history.state, false);
}