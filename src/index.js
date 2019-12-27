const express = require("express");
const http = require("http");
const io = require("socket.io");
const randomString = require("random-string");
const ejs = require("ejs");
const fs = require("fs");

module.exports = exports = class WebsiteRender {
  constructor(port) {
    if (!port || typeof port !== "number" || port < 80 || port > 65535) throw new error("The listen port needs to be as number, and between 80 and 65535.");
    this.port = port;
    this.testurl = "test";
    this.express = express();
    this.pages = {};
    this.frontEndUrl = "websiteRender";
    let methods = ["enable", "disable", "use", "engine", "checkout", "copy", "delete", "get", "options", "patch", "post", "purge", "put", "search", "trace", "subscribe", "unsubscribe"];
    methods.forEach((method) => {
      this[method] = (path, callback = false) => {
        try {
          callback.stack[0];
          this.express[method](path, callback);
        } catch (e) {
          if (!["use", "enable", "disable"].includes(method)) this.express[method](path, callback);
          else this.express[method](path);
        }
      }
    });
  }

  set(key, value) {
    this[key] = value;
  }

  page(path, callback) {
    this.pages[path] = callback;
  }

  async start(func = () => { }) {
    return new Promise((res) => {
      this.tests = {};
      this.express.get(`/${this.testurl}`, (req, res, next) => {
        if (!req.query.id) return next();
        if (!req.query.from || req.query.from !== "website-render") return next();
        let id = req.query.id + randomString({ length: 15 });
        this.tests[id] = { req: req, res: res };
        res.json({ message: "Done!", id: id });
      });
      for (let i in this.pages) {
        // i = path
        // this.pages[i] = callback
        let func = async (req, res, next) => {
          if (this.checkRun) {
            let result = await this.checkRun(req, res);
            if (!result) return;
          }
          req.direct = false;
          res.doNotLoad = () => { res.json({ status: 406, loadInBackground: false }) };
          res.render = (file, information = {}) => {
            file = `${process.cwd()}/views/${file}`;
            file = fs.readFileSync(file).toString("utf8");
            file = ejs.render(file, information);
            file = file.split("<FORCESCRIPT>").join("<script>").split("</FORCESCRIPT>").join("</script>");
            res.send(file);
          }
          this.pages[i](req, res, next);
        }
        this.express.get(i, func);
      }
      this.express.get(`/${this.frontEndUrl}.js`, (_req, res) => {
        res.sendFile(`${__dirname}/__frontEnd.js`);
      });

      this.http = http.createServer(this.express);
      this.io = io(this.http);
      this.http.listen(this.port, () => {
        func();
        res();
      });

      this.io.on("connection", (socket) => {
        socket.on("pages", (check) => {
          if (!check) {
            let array = [];
            for (let i in this.pages) {
              array.push(i);
            }
            socket.emit("pages", {
              array: array,
              testurl: this.testurl
            });
          }
        });

        socket.on("page", async (information) => {
          if (!this.tests[information.id]) return;
          let testData = this.tests[information.id];
          let result = () => {
            return new Promise((_mkwe_24jfds_resolve) => {
              testData.res.send = (data) => {
                _mkwe_24jfds_resolve(data);
              }
              testData.res.render = (file, information = {}) => {
                file = `${process.cwd()}/views/${file}`;
                file = fs.readFileSync(file).toString("utf8");
                file = ejs.render(file, information);
                _mkwe_24jfds_resolve(file);
              }
              this.pages[information.path](testData.req, testData.res);
            });
          }
          result = await result();
          let title = false;
          if (result.includes("<title>")) title = result.split("<title>")[1].split("</title>")[0];
          if ((result.includes("<body>") || result.includes("<body")) && result.includes("</body>")) {
            result = result.split("<body>")[1] || result.split("<body")[1].split(">").slice(1).join(">");
            result = result.split("</body>")[0];
          }
          socket.emit("page", {
            url: information.path,
            body: result,
            title: title
          });
        });
      });
    });
  }
}

exports.version = "v1.0.5";