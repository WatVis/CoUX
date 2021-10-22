const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const mongoose = require("./db/mongoose");
const userRouter = require("./routers/user");
const videoRouter = require("./routers/video");
const commentRouter = require("./routers/comment");
const discussionRouter = require("./routers/discussion");
const heuristicRouter = require("./routers/heuristic");
const studyRouter = require("./routers/study");
const { adminBro, adminRouter } = require("./routers/admin");

const app = express();
app.use(cors());

const port = process.env.PORT || "8888";
const assetsDirectoryPath = path.join(__dirname, "../assets");

app.use("/assets", express.static(assetsDirectoryPath));
app.use(adminBro.options.rootPath, adminRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(videoRouter);
app.use(commentRouter);
app.use(discussionRouter);
app.use(heuristicRouter);
app.use(studyRouter);

const server = http.createServer(app);
const io = socketio(server);

//----- Socket IO -------//

const handleDiscussion = require("./socket/handleDiscussion");

io.on("connection", (socket) => {
  handleDiscussion(socket, io);
});

//----- Socket IO -------//

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running: ${port}`);
});
