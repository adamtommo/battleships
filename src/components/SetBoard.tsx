import GridSquare from "./GridSquare";
import classes from "./Board.module.css";
import { SetStateAction, useEffect, useState } from "react";
import { AVAILABLE_SHIPS } from "./Fleet";
import {
    cols,
    generateEmptyBoard,
    indexToCoords,
    rows,
    shipIndices,
} from "./BoardFunctions";

import Alert from "react-bootstrap/Alert";

const calculateOverhang = (ship: {
    position: number;
    length: number;
    orientation: string;
}) => {
    const coords = indexToCoords(ship.position);
    return Math.max(
        ship.orientation === "vertical"
            ? coords.y + ship.length - rows
            : coords.x + ship.length - cols,
        0
    );
};

const SetBoard = (props: {
    selectedShip: string;
    onShipSelect: React.Dispatch<React.SetStateAction<string>>;
    setInitialBoard: React.Dispatch<
        SetStateAction<
            | {
                  board: string[];
                  shipLocations: { name: string; location: number[] }[];
              }
            | undefined
        >
    >;
}) => {
    const [indices, setIndices] = useState<number[]>([]);
    const [outOfBounds, setOutOfBounds] = useState(false);
    const [board, setBoard] = useState<string[]>(generateEmptyBoard());
    const [boardPrev, setBoardPrev] = useState<string[]>(generateEmptyBoard());
    const [orientation, setOrientation] = useState("horizontal");
    const [shipFormation, setShipFormation] = useState<
        { name: string; location: number[] }[]
    >([]);

    useEffect(() => {
        if (props.selectedShip === "reset") {
            setBoardPrev(generateEmptyBoard());
            setShipFormation([]);
            return;
        }
        const temp = boardPrev.slice();
        setBoard(boardPrev);
        let place = true;

        indices.forEach((coord: number) => {
            if (boardPrev[coord] === "ship") {
                place = false;
                return;
            } else {
                temp[coord] = "ship";
                setBoard(temp);
            }
        });
        if (!place || outOfBounds) {
            indices.forEach((coord: number) => {
                temp[coord] = "forbidden";
                setBoard(temp);
            });
        }
    }, [boardPrev, indices, outOfBounds, props.selectedShip]);

    const currentCoord = (i: number, click: boolean, rotate: boolean) => {
        if (i === -1) {
            setBoard(boardPrev);
            return;
        }
        if (rotate === true) {
            if (orientation === "horizontal") {
                setOrientation("vertical");
            } else {
                setOrientation("horizontal");
            }
        }

        for (let index = 0; index < AVAILABLE_SHIPS.length; index++) {
            if (props.selectedShip === AVAILABLE_SHIPS[index].name) {
                if (AVAILABLE_SHIPS[index].placed === true) {
                    break;
                }
                const ship = {
                    position: i,
                    length: AVAILABLE_SHIPS[index].length,
                    orientation: !rotate
                        ? orientation
                        : orientation === "horizontal"
                        ? "vertical"
                        : "horizontal",
                };

                setIndices(shipIndices(ship));
                const overhang = calculateOverhang(ship);
                if (overhang > 0) {
                    setOutOfBounds(true);
                } else {
                    setOutOfBounds(false);
                }

                if (click) {
                    let place = true;
                    indices.forEach((coord: number) => {
                        if (boardPrev[coord] === "ship" || outOfBounds) {
                            place = false;
                        }
                    });

                    if (place) {
                        const addShip = [
                            ...shipFormation,
                            {
                                name: AVAILABLE_SHIPS[index].name,
                                location: indices,
                            },
                        ];
                        setShipFormation(addShip);
                        setBoardPrev(board);
                        props.onShipSelect("");
                        AVAILABLE_SHIPS[index].placed = true;
                    }
                }
            }
        }
        props.setInitialBoard({
            board: board,
            shipLocations: shipFormation,
        });
    };

    return (
        <>
            <Alert variant="dark">You</Alert>
            <div className={classes.board}>
                {board.map((state: string, i: number) => {
                    return (
                        <GridSquare
                            currentCoord={currentCoord}
                            key={i}
                            index={i}
                            state={state}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default SetBoard;
