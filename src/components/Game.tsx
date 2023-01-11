import { useState } from "react";
import SetBoard from "./SetBoard";
import Fleet from "./Fleet";
import Board from "./Board";
import { Col, Container, Row } from "react-bootstrap";
import { WelcomeScreen } from "./WelcomeScreen";

const Game = () => {
    const [selectedShip, setSelectedShip] = useState<String>("");
    const [playerBoard, setPlayerBoard] = useState<{}>({});
    const [gameState, setGameState] = useState("intro");

    const json = () => {
        const data = JSON.stringify(playerBoard);
        setGameState("play");
        console.log(data);
    };

    return (
        <>
            {gameState === "intro" ? (
                <WelcomeScreen setGame={setGameState} />
            ) : null}
            <Container>
                <Row>
                    <Col xs={2}>
                        {gameState !== "intro" ? (
                            <Fleet
                                onShipSelect={setSelectedShip}
                                onStart={json}
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
