import { useEffect, useReducer, useRef } from "react";
import SetBoard from "./board/SetBoard";
import Fleet from "./board/Fleet";
import Board from "./board/Board";
import { Alert, Button, Col, Container, Modal, Row } from "react-bootstrap";
import { WelcomeScreen } from "./WelcomeScreen";
import useWebSocket from "react-use-websocket";
import { generateEmptyBoard } from "../utils/BoardFunctions";
import { generateComputerBoard, computerFire } from "../utils/Computer";
import { WS_URL } from "../WS";
import {
    ActionInterface,
    GameBoardInterface,
    StateInterface,
} from "./interfaces/BoardInterface";

const Game = () => {
    const emptyBoard: GameBoardInterface = {
        board: generateEmptyBoard(),
        shipLocations: [{ name: "null", location: [0] }],
    };

    const initialState = {
        you: emptyBoard,
        opponent: emptyBoard,
        rooms: [],
        selectedShip: "",
        gameState: "intro",
        computer: false,
        fullError: false,
        disconnectError: false,
        waiting: false,
        yourTurn: false,
        winner: false,
        loser: false,
    };

    const gameReducer = (state: StateInterface, action: ActionInterface) => {
        switch (action.type) {
            case "SET_ROOMS":
                return { ...state, rooms: action.payload };
            case "SET_SELECTED_SHIP":
                return { ...state, selectedShip: action.payload };
            case "SET_GAME_STATE":
                return { ...state, gameState: action.payload };
            case "SET_COMPUTER":
                return { ...state, computer: action.payload };
            case "SET_FULL_ERROR":
                return { ...state, fullError: action.payload };
            case "SET_DISCONNECT_ERROR":
                return { ...state, disconnectError: action.payload };
            case "SET_WAITING":
                return { ...state, waiting: action.payload };
            case "SET_YOUR_TURN":
                return { ...state, yourTurn: action.payload };
            case "SET_WINNER":
                return { ...state, winner: action.payload };
            case "SET_LOSER":
                return { ...state, loser: action.payload };
            case "SET_YOU":
                return { ...state, you: action.payload };
            case "SET_OPPONENT":
                return { ...state, opponent: action.payload };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const {
        // sendMessage,
        sendJsonMessage,
        lastMessage,
        // lastJsonMessage,
        // readyState,
        // getWebSocket,
    } = useWebSocket(WS_URL, {
        // share: true,
        onOpen() {
            console.log("Connection Established");
        },
    });

    const setRoom = (room: string, multiplayer: boolean) => {
        sendJsonMessage({
            action: "room",
            room: room,
            multiplayer: multiplayer,
        });
        if (!multiplayer) {
            dispatch({ type: "SET_COMPUTER", payload: true });
        }
    };

    const isMounted = useRef(false);
    useEffect(() => {
        if (isMounted.current) {
            if (!lastMessage) {
                return;
            }
            const message = JSON.parse(lastMessage.data);
            const type = message.type;

            if (type === "room") {
                if (message.allowed) {
                    dispatch({ type: "SET_GAME_STATE", payload: "setup" });
                } else {
                    dispatch({ type: "SET_FULL_ERROR", payload: true });
                }
            }
            if (type === "rooms") {
                dispatch({ type: "SET_ROOMS", payload: message.rooms });
            }
            if (type === "kick") {
                // window.location.reload();
                // window.onload = () => setDisconnectError(true);
                dispatch({ type: "SET_DISCONNECT_ERROR", payload: true });
            }
            if (type === "start") {
                dispatch({ type: "SET_WAITING", payload: true });
                dispatch({ type: "SET_GAME_STATE", payload: "play" });
            }
            if (type === "turn") {
                dispatch({ type: "SET_WAITING", payload: !state.waiting });
                dispatch({ type: "SET_YOUR_TURN", payload: !state.yourTurn });
            }
            if (type === "computerTurn") {
                dispatch({ type: "SET_WAITING", payload: !state.waiting });
                dispatch({ type: "SET_YOUR_TURN", payload: !state.yourTurn });
                const computerOppBoard: string[] = message.board;
                const coords: number = computerFire(computerOppBoard);
                fire(coords, true);
            }
            if (type === "computerTurnAgain") {
                const computerOppBoard: string[] = message.board;
                const coords: number = computerFire(computerOppBoard);
                fire(coords, true);
            }
            if (type === "setYou") {
                dispatch({ type: "SET_YOU", payload: message.player });
            }
            if (type === "setOpponent") {
                dispatch({ type: "SET_OPPONENT", payload: message.player });
            }
            if (type === "win") {
                console.log("win");
                dispatch({ type: "SET_WAITING", payload: false });
                dispatch({ type: "SET_YOUR_TURN", payload: false });
                dispatch({ type: "SET_WINNER", payload: true });
                dispatch({ type: "SET_COMPUTER", payload: false });
            }
            if (type === "lose") {
                dispatch({ type: "SET_WAITING", payload: false });
                dispatch({ type: "SET_YOUR_TURN", payload: false });
                dispatch({ type: "SET_LOSER", payload: true });
                dispatch({ type: "SET_COMPUTER", payload: false });
            }
        } else {
            isMounted.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastMessage]);

    const sendInitial = () => {
        dispatch({ type: "SET_WAITING", payload: true });

        //Sometimes sends the last ship placed as forbidden, this is to prevent this.
        const boardCheck = state.you;
        console.log(boardCheck);
        boardCheck!.board.forEach((square: string, i: number) => {
            if (square === "forbidden") {
                boardCheck.board[i] = "ship";
            }
        });
        dispatch({ type: "SET_YOU", payload: boardCheck });

        sendJsonMessage({
            action: "setBoard",
            player: JSON.stringify(state.you),
            opponent: JSON.stringify(generateEmptyBoard()),
        });

        if (state.computer) {
            sendJsonMessage({
                action: "setBoard",
                player: JSON.stringify(generateComputerBoard()),
                opponent: JSON.stringify(generateEmptyBoard()),
                computer: true,
            });
        }
    };

    const fire = (i: number, computerFire: boolean) => {
        if (computerFire) {
            console.log("Thinking!");
            setTimeout(() => {
                sendJsonMessage({ action: "fire", where: i, computer: true });
            }, 1000);
        } else {
            sendJsonMessage({ action: "fire", where: i, computer: false });
        }
    };

    return (
        <>
            {state.gameState === "play" ? (
                <>
                    <Modal show={state.winner}>
                        <Modal.Body>
                            <Alert variant="success"> You WIN!</Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GAME_STATE",
                                        payload: "intro",
                                    });
                                    window.location.reload();
                                }}
                            >
                                Return
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={state.loser}>
                        <Modal.Body>
                            <Alert variant="danger"> You LOSE!</Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GAME_STATE",
                                        payload: "intro",
                                    });
                                    window.location.reload();
                                }}
                            >
                                Return
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : null}
            {state.waiting && state.gameState === "setup" ? (
                <Alert variant="info"> Waiting for other player</Alert>
            ) : null}
            {state.disconnectError ? (
                <Alert
                    variant="warning"
                    onClose={() =>
                        dispatch({
                            type: "SET_DISCONNECT_ERROR",
                            payload: false,
                        })
                    }
                    dismissible
                >
                    {" "}
                    Player Disconnected
                </Alert>
            ) : null}
            {state.fullError ? (
                <Alert
                    variant="danger"
                    onClose={() =>
                        dispatch({ type: "SET_FULL_ERROR", payload: false })
                    }
                    dismissible
                >
                    {" "}
                    Room is full!
                </Alert>
            ) : null}
            {state.gameState === "intro" ? (
                <WelcomeScreen
                    refreshRooms={() => sendJsonMessage({ action: "getRoom" })}
                    setRoomName={setRoom}
                    roomsList={state.rooms}
                />
            ) : null}
            <Container>
                <Row>
                    <Col xs={2}>
                        {state.gameState === "setup" ? (
                            <Fleet
                                onShipSelect={dispatch}
                                onStart={sendInitial}
                            />
                        ) : null}
                    </Col>
                    <Col md="auto">
                        {state.gameState === "setup" ? (
                            <SetBoard
                                selectedShip={state.selectedShip}
                                onShipSelect={dispatch}
                                setInitialBoard={dispatch}
                            />
                        ) : null}

                        {state.gameState === "play" ? (
                            <Board
                                board={state.you.board}
                                player="You"
                                turn={state.yourTurn}
                                fire={fire}
                            />
                        ) : null}
                    </Col>
                    <Col md="auto">
                        {state.gameState === "play" ? (
                            <Board
                                board={state.opponent.board}
                                player="Opponent"
                                turn={state.yourTurn}
                                fire={fire}
                            />
                        ) : null}
                    </Col>
                </Row>
            </Container>
        </>
    );
};
//testw

export default Game;
