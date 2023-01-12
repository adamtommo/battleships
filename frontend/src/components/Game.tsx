import { useEffect, useState } from "react";
import SetBoard from "./SetBoard";
import Fleet from "./Fleet";
import Board from "./Board";
import { Col, Container, Row } from "react-bootstrap";
import { WelcomeScreen } from "./WelcomeScreen";
import useWebSocket from "react-use-websocket";

const WS_URL = "ws://127.0.0.1:8000";

const Game = () => {
    const [room, setRoom] = useState("");
    const [selectedShip, setSelectedShip] = useState<String>("");
    const [playerBoard, setPlayerBoard] = useState<{}>({});
    const [gameState, setGameState] = useState("intro");

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
        const message = { type: "room", room: room };
        sendJsonMessage(message);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room]);

    const sendInitial = () => {
        // const requestOptions = {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Access-Control-Allow-Origin": "*",
        //     },
        //     body: JSON.stringify(playerBoard),
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

        sendJsonMessage(playerBoard);
    };

    return (
        <>
            {gameState === "intro" ? (
                <WelcomeScreen setRoomName={setRoom} setGame={setGameState} />
            ) : null}
            <Container>
                <Row>
                    <Col xs={2}>
                        {gameState !== "intro" ? (
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
                                setPlayerBoard={setPlayerBoard}
                            />
                        ) : null}

                        {gameState === "play" ? <Board player="You" /> : null}
                    </Col>
                    <Col md="auto">
                        {gameState === "play" ? (
                            <Board player="Opponent" />
                        ) : null}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Game;
