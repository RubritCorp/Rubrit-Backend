import express, { application } from "express";
import cors from "cors";

import aws from "./routes/aws";
import maps from "./routes/maps";
import subs from "./routes/subs";
import chat from "./routes/chat";
import message from "./routes/message";
import envConfig from "../environment";
import user from "./routes/user";
import connectDb from "./config/db";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";

import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const port = envConfig.port || 8080;
dotenv.config();
connectDb();

app.use(express.json());

const corsOptions = {
  origin: [envConfig.cors.origin],
};

//middlewares
app.use(express.json());
app.use(cors(corsOptions));

// Entrypointss
app.get("/", (req, res) => {
  res.send("Hello mundo!");
});

app.use("/aws", aws);
app.use("/maps", maps);
app.use("/subs", subs);

app.use("/user", user);
app.use("/chat", chat);
app.use("/message", message);

app.use(notFound);
app.use(errorHandler);

// Start the Express server
// const server = app.listen(port, () => {
//   console.log(`server started at http://localhost:${port}`);
// });
const httpServer = createServer(app);
// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: envConfig.cors.origin,
//   },
// });
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: envConfig.cors.origin,
  },
});
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData: any) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");
    console.log("new message");
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      console.log(user._id, newMessageRecieved.sender._id);

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  //chat
  socket.on("new chat", (newChatRecieved, creator) => {
    // var chat = newChatRecieved.chat;

    if (!newChatRecieved.users) return console.log("chat.users not defined");
    console.log("new Chat");
    newChatRecieved.users.forEach((user) => {
      if (user._id === creator) return;

      socket.in(user._id).emit("chat received", newChatRecieved);
    });
  });

  socket.off("setup", (userData) => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

httpServer.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
