import { useEffect, useState } from "react";
import SetBoard from "./SetBoard";
import Fleet, { AVAILABLE_SHIPS } from "./Fleet";
import Board from "./Board";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { WelcomeScreen } from "./WelcomeScreen";
import useWebSocket from "react-use-websocket";
import { generateEmptyBoard } from "./BoardFunctions";

const WS_URL = "ws://127.0.0.1:8000";

const resetShips = () => {
    AVAILABLE_SHIPS.forEach((ship) => (ship.placed = false));
};

const Game = () => {
    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState<
        { name: string; playerOne: string; playerTwo: String }[]
    >([]);
    const [selectedShip, setSelectedShip] = useState<String>("");
    const [you, setYou] = useState<{
        board: String[];
        shipLocations: {
            name: string;
            location: number[];
        }[];
    }>();
    const [opponent, setOpponent] = useState<{
        board: String[];
        shipLocations?: {
            name: string;
            location: number[];
        }[];
    }>({ board: generateEmptyBoard() });

    const [gameState, setGameState] = useState("intro");
    const [fullError, setFullError] = useState(false);
    const [disconnectError, setDisconnectError] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(WS_URL, {
        share: true,
        onOpen() {
            console.log("Connection Established");
        },
    });

    useEffect(() => {
        if (room === "") {
            return;
        }
        sendJsonMessage({ type: "room", room: room });
    }, [room]);

    useEffect(() => {
        if (!lastMessage) {
            return;
        }
        const message = JSON.parse(lastMessage.data);
        const type = message.type;

        if (type === "chat") {
        }

        if (type === "room") {
            if (message.allowed) {
                setGameState("setup");
            } else {
                setFullError(true);
            }
        }
        if (type === "rooms") {
            console.log(message.rooms);
            setRooms(message.rooms);
        }
        if (type === "kick") {
            setGameState("intro");
            resetShips();
            setRoom("");
            setDisconnectError(true);
            setWaiting(false);
        }
        if (type === "start") {
            setWaiting(true);
            setGameState("play");
        }
        if (type === "turn") {
            setWaiting(!waiting);
            setYourTurn(!yourTurn);
        }
        if (type === "setYou") {
            setYou(message.board);
        }
        if (type === "setOpponent") {
            const where: number = message.square;
            if (message.state === "hit") {
                opponent.board[where] = "hit";
            }
            setOpponent(message.board);
        }
    }, [lastMessage]);

    const sendInitial = () => {
        setWaiting(true);
        // const requestOptions = {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Access-Control-Allow-Origin": "*",
        //     },
        //     body: JSON.Stringify(initialBoard),
        // };
        // console.log(requestOptions);
        // fetch(
        //     "https://a1b08we220.execute-api.eu-west-2.amazonaws.com/battleships-post-dynamodb",
        //     requestOptions
        // ).then((response) => {
        //     if (!response.ok) {
        //         throw new Error(response.statusText);
        //     }
        //     console.log(response.json);
        // });

        sendJsonMessage({
            type: "setBoard",
            player: JSON.stringify(you),
            opponent: generateEmptyBoard(),
        });
    };

    const fire = (i: number) => {
        sendJsonMessage({ type: "fire", where: i });
    };

    return (
        <>
            {waiting ? (
                <Alert variant="info"> Waiting for other player</Alert>
            ) : null}
            {yourTurn ? <Alert variant="primary"> Your Turn</Alert> : null}
            {disconnectError ? (
                <Alert
                    variant="warning"
                    onClose={() => setDisconnectError(false)}
                    dismissible
                >
                    {" "}
                    Player Disconnected
                </Alert>
            ) : null}
            {fullError ? (
                <Alert
                    variant="danger"
                    onClose={() => setFullError(false)}
                    dismissible
                >
                    {" "}
                    Room is full!
                </Alert>
            ) : null}
            {gameState === "intro" ? (
                <WelcomeScreen setRoomName={setRoom} roomsList={rooms} />
            ) : null}
            <Container>
                <Row>
                    <Col xs={2}>
                        {gameState === "setup" ? (
                            <Fleet
                                onShipSelect={setSelectedShip}
                                onStart={sendInitial}
                            />
                        ) : null}
                    </Col>
                    <Col md="auto">
                        {gameState === "setup" ? (
                            <SetBoard
                                selectedShip={selectedShip}
                                onShipSelect={setSelectedShip}
                                setInitialBoard={setYou}
                            />
                        ) : null}

                        {gameState === "play" ? (
                            <Board
                                board={you!.board}
                                player="You"
                                turn={yourTurn}
                                fire={fire}
                            />
                        ) : null}
                    </Col>
                    <Col md="auto">
                        {gameState === "play" ? (
                            <Board
                                board={opponent.board}
                                player="Opponent"
                                turn={yourTurn}
                                fire={fire}
                            />
                        ) : null}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Game;
