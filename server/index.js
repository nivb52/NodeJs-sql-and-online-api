const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const logger = require('../services/logger')

server.listen(port, logger("---> app listen on ", port));
