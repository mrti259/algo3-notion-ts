import * as http from "http";
import { app } from "./App/app";

const server = http.createServer(app);
const PORT = 5000;
server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
