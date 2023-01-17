const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { info } = require("console");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = {};
const rooms = [];
const games = [];

wss.on("connection", (ws) => {
    const userId = uuidv4();
    console.log(`Received new connection`);
    clients[userId] = ws;
    console.log(`${userId} connected.`);
    broadcast({ type: "rooms", rooms: rooms });

    ws.on("message", (message) => {
        console.log(`Received message => ${message}`);
        const data = JSON.parse(message);

        if (data.type === "chat") {
            broadcast({ type: "chat", message: data.message });
        }
        if (data.type === "room") {
            const room = rooms.find((room) => room.name === data.room);
            const game = games.find((game) => game.room === room.name);

            if (room && game) {
                if (!room.playerTwo) {
                    room.playerTwo = userId;
                    game.playerTwoReady = false;
                    ws.send(JSON.stringify({ type: "room", allowed: true }));
                } else {
                    ws.send(JSON.stringify({ type: "room", allowed: false }));
                }
            } else {
                rooms.push({ name: data.room, playerOne: userId });
                games.push({ room: data.room, playerOneReady: false });
                ws.send(JSON.stringify({ type: "room", allowed: true }));
            }
            broadcast({ type: "rooms", rooms: rooms });
        }

        if (data.type === "setBoard") {
            const room = rooms.find(
                (room) => room.playerOne === userId || room.playerTwo === userId
            );
            const game = games.find((game) => game.room === room.name);
            const player = JSON.parse(data.player);
            const opponent = JSON.parse(data.opponent);

            if (room.playerOne === userId) {
                game.playerOneBoard = player.board;
                game.playerOneShips = player.shipLocations;
                game.playerOneOpponent = opponent;
                game.playerOneReady = true;
            }
            if (room.playerTwo === userId) {
                game.playerTwoBoard = player.board;
                game.playerTwoShips = player.shipLocations;
                game.playerTwoOpponent = opponent;
                game.playerTwoReady = true;
            }
            if (game.playerOneReady && game.playerTwoReady) {
                game.playerOneRemaining = JSON.parse(
                    JSON.stringify(game.playerOneShips)
                );
                game.playerTwoRemaining = JSON.parse(
                    JSON.stringify(game.playerTwoShips)
                );

                const playerOne = clients[room.playerOne];
                const playerTwo = clients[room.playerTwo];

                playerOne.send(JSON.stringify({ type: "start" }));
                playerTwo.send(JSON.stringify({ type: "start" }));
                playerOne.send(JSON.stringify({ type: "turn" }));
            }
        }

        if (data.type === "fire") {
            const room = rooms.find(
                (room) => room.playerOne === userId || room.playerTwo === userId
            );
            const game = games.find((game) => game.room === room.name);

            const playerOne = clients[room.playerOne];
            const playerTwo = clients[room.playerTwo];

            if (room.playerOne === userId) {
                const square = game.playerTwoBoard[data.where];

                if (square === "empty") {
                    game.playerTwoBoard[data.where] = game.playerOneOpponent[
                        data.where
                    ] = "miss";
                    playerOne.send(JSON.stringify({ type: "turn" }));
                    playerTwo.send(JSON.stringify({ type: "turn" }));
                }

                if (square === "ship") {
                    game.playerTwoBoard[data.where] = game.playerOneOpponent[
                        data.where
                    ] = "hit";

                    game.playerTwoRemaining.forEach((ship, i) => {
                        const index = ship.location.indexOf(data.where);
                        if (index !== -1) {
                            ship.location.splice(index, 1);
                        }
                        if (ship.location.length === 0) {
                            const sunk = game.playerTwoShips.find(
                                (sunkShip) => sunkShip.name === ship.name
                            );
                            sunk.location.forEach((square) => {
                                game.playerTwoBoard[square] = "sunk";
                                game.playerOneOpponent[square] = "sunk";
                            });
                            game.playerTwoRemaining.splice(i, 1);
                        }
                    });
                    if (game.playerTwoRemaining.length === 0) {
                        playerOne.send(JSON.stringify({ type: "win" }));
                        playerTwo.send(JSON.stringify({ type: "lose" }));
                    }
                }
            }

            if (room.playerTwo === userId) {
                const square = game.playerOneBoard[data.where];

                if (square === "empty") {
                    game.playerOneBoard[data.where] = game.playerTwoOpponent[
                        data.where
                    ] = "miss";
                    playerOne.send(JSON.stringify({ type: "turn" }));
                    playerTwo.send(JSON.stringify({ type: "turn" }));
                }

                if (square === "ship") {
                    game.playerOneBoard[data.where] = game.playerTwoOpponent[
                        data.where
                    ] = "hit";

                    game.playerOneRemaining.forEach((ship, i) => {
                        const index = ship.location.indexOf(data.where);
                        if (index !== -1) {
                            ship.location.splice(index, 1);
                        }
                        if (ship.location.length === 0) {
                            const sunk = game.playerOneShips.find(
                                (sunkShip) => sunkShip.name === ship.name
                            );
                            sunk.location.forEach((square) => {
                                game.playerOneBoard[square] = "sunk";
                                game.playerTwoOpponent[square] = "sunk";
                            });
                            game.playerOneRemaining.splice(i, 1);
                        }
                    });
                    if (game.playerOneRemaining.length === 0) {
                        playerTwo.send(JSON.stringify({ type: "win" }));
                        playerOne.send(JSON.stringify({ type: "lose" }));
                    }
                }
            }
            playerTwo.send(
                JSON.stringify({
                    type: "setYou",
                    player: {
                        board: game.playerTwoBoard,
                        shipLocations: game.playerTwoShips,
                    },
                })
            );
            playerOne.send(
                JSON.stringify({
                    type: "setYou",
                    player: {
                        board: game.playerOneBoard,
                        shipLocations: game.playerOneShips,
                    },
                })
            );
            playerOne.send(
                JSON.stringify({
                    type: "setOpponent",
                    player: {
                        board: game.playerOneOpponent,
                        shipLocations: game.playerTwoShips,
                    },
                })
            );
            playerTwo.send(
                JSON.stringify({
                    type: "setOpponent",
                    player: {
                        board: game.playerTwoOpponent,
                        shipLocations: game.playerOneShips,
                    },
                })
            );
        }
    });

    ws.on("close", () => {
        const roomIndex = rooms.findIndex(
            (room) => room.playerOne === userId || room.playerTwo === userId
        );
        if (roomIndex === -1) {
            return;
        }
        const room = rooms[roomIndex];
        const gameIndex = games.findIndex((game) => game.room === room.name);

        const playerOne = clients[room.playerOne];
        const playerTwo = clients[room.playerTwo];

        if (playerOne.readyState === WebSocket.OPEN) {
            playerOne.send(JSON.stringify({ type: "kick" }));
        }
        if (playerTwo) {
            if (playerTwo.readyState === WebSocket.OPEN) {
                playerTwo.send(JSON.stringify({ type: "kick" }));
            }
        }

        rooms.splice(roomIndex, 1);
        games.splice(gameIndex, 1);
        delete clients[userId];
        broadcast({ type: "rooms", rooms: rooms });
    });
});

server.listen(8000, () => {
    console.log("Server started on port 8000");
});

const broadcast = (message) => {
    for (let userId in clients) {
        let client = clients[userId];
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
};
