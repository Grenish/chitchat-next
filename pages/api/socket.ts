import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("create-room", (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} created and joined room: ${roomId}`);
        const room = io.sockets.adapter.rooms.get(roomId);
        io.to(roomId).emit("user-count", room ? room.size : 0);
      });

      socket.on("join-room", (roomId: string) => {
        if (io.sockets.adapter.rooms.has(roomId)) {
          socket.join(roomId);
          console.log(`User ${socket.id} joined room: ${roomId}`);
          const room = io.sockets.adapter.rooms.get(roomId);
          io.to(roomId).emit("user-count", room ? room.size : 0);
        } else {
          socket.emit("error", "Room not found");
        }
      });

      socket.on("send-message", (data) => {
        io.to(data.roomId).emit("receive-message", data);
      });

      socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            const currentRoom = io.sockets.adapter.rooms.get(room);
            if (currentRoom) {
              io.to(room).emit("user-count", currentRoom.size - 1);
            }
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
