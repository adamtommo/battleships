const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = [];

wss.on("connection", (ws) => {
    console.log(`connected`);

    ws.on("message", (message) => {
        console.log(`Received message => ${message}`);
        const data = JSON.parse(message);
        if (data.type === "room") {
            const roomCheck = rooms.includes(data.room);
            console.log(roomCheck);
            if (roomCheck) {
                console.log(`${data.room} exists`);
            } else {
                console.log("AHOYHOY");
                console.log(data.room);
                rooms.push(data.room);
            }
        }
    });

    ws.on("close", () => console.log(`disconnected`));

    ws.send("hi there, I am a WebSocket server");
});

server.listen(8000, () => {
    console.log("Server started on port 8000");
});
