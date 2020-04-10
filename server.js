const http = require("http");
const app = require("./app");

const port = process.env.PORT || 3000;
const server = http.createServer(app);
console.log("Server is running on port" + port);
console.log(".....");
server.listen(port);
