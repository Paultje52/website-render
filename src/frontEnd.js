if("undefined"==typeof socketio){let t=document.createElement("script");t.src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js",document.head.appendChild(t)}if("undefined"==typeof jquery){let t=document.createElement("script");t.src="https://code.jquery.com/jquery-3.4.1.min.js",document.head.appendChild(t)}let pages={};function loaded(){let t=io(`http://${window.location.hostname}:${window.location.port}`);t.emit("pages",!1),t.on("page",t=>{pages[t.url]=t.body,0}),t.on("pages",e=>{$.ajax(`http://${window.location.hostname}:${window.location.port}/${e.testurl}?id=kjb4lt34uojk3b7&from=website-render`).done(o=>{o=o.id,e.array.forEach(e=>{t.emit("page",{path:e,id:o}),0})})})}function WebsiteRenderButton(t="/",e=!0){if(!pages[t])return window.location.href=`http://${window.location.hostname}:${window.location.port}${t}`;$("body").html(pages[t]),e&&history.pushState(t,`${pages[t].split("<title>")[1].split("</title>")[0]||document.title} `,`http://${window.location.hostname}:${window.location.port}${t}`),pages[t].includes("<title>")&&pages[t].includes("</title>")&&(document.title=pages[t].split("<title>")[1].split("</title>")[0])}setTimeout(()=>{loaded(!0)},500),window.onpopstate=(()=>{history.state&&WebsiteRenderButton(history.state,!1)});