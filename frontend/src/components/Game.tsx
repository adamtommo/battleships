import { useEffect, useState } from "react";
import SetBoard from "./SetBoard";
import Fleet, { AVAILABLE_SHIPS } from "./Fleet";
import Board from "./Board";
import { Alert, Button, Col, Container, Modal, Row } from "react-bootstrap";
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
        { name: string; playerOne: string; playerTwo: string }[]
    >([]);
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [you, setYou] = useState<{
        board: string[];
        shipLocations: {
            name: string;
            location: number[];
        }[];
    }>();
    const [opponent, setOpponent] = useState<{
        board: string[];
        shipLocations: {
            name: string;
            location: number[];
        }[];
    }>({
        board: generateEmptyBoard(),
        shipLocations: [{ name: "null", location: [0] }],
    });

    const [gameState, setGameState] = useState("intro");
    const [fullError, setFullError] = useState<boolean>(false);
    const [disconnectError, setDisconnectError] = useState(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [yourTurn, setYourTurn] = useState<boolean>(false);
    const [winner, setWinner] = useState<boolean>(false);
    const [loser, setLoser] = useState<boolean>(false);

    const {
        // sendMessage,
        sendJsonMessage,
        lastMessage,
        // lastJsonMessage,
        // readyState,
        // getWebSocket,
    } = useWebSocket(WS_URL, {
        share: true,
        onOpen() {
            console.log("Connection Established");
        },
    });

    useEffect(() => {
        if (room !== "") {
            sendJsonMessage({ type: "room", room: room });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setYou(message.player);
        }
        if (type === "setOpponent") {
            setOpponent(message.player);
        }
        if (type === "win") {
            setWaiting(false);
            setYourTurn(false);
            setWinner(true);
        }
        if (type === "lose") {
            setWaiting(false);
            setYourTurn(false);
            setLoser(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastMessage]);

    const sendInitial = () => {
        setWaiting(true);
        // const requestOptions = {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Access-Control-Allow-Origin": "*",
        //     },
        //     body: JSON.stringify(initialBoard),
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
            opponent: JSON.stringify(generateEmptyBoard()),
        });
    };

    const fire = (i: number) => {
        sendJsonMessage({ type: "fire", where: i });
    };

    return (
        <>
            {gameState === "play" ? (
                <>
                    <Modal show={winner}>
                        <Modal.Body>
                            <Alert variant="success"> You WIN!</Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                onClick={() => {
                                    setGameState("intro");
                                    window.location.reload();
                                }}
                            >
                                Return
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={loser}>
                        <Modal.Body>
                            <Alert variant="danger"> You LOSE!</Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                onClick={() => {
                                    setGameState("intro");
                                    window.location.reload();
                                }}
                            >
                                Return
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : null}
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
