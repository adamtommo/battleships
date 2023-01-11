import GridSquare from "./GridSquare";
import classes from "./Board.module.css";
import { useEffect, useState } from "react";
import { AVAILABLE_SHIPS } from "./Fleet";

const rows: number = 10;
const cols: number = 10;

const generateEmptyBoard = () => {
    return new Array(rows * cols).fill("empty");
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const coordsToIndex = (coords: { x: number; y: number }) => {
    return coords.y * rows + coords.x;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const indexToCoords = (index: number) => {
    return { x: index % rows, y: Math.floor(index / rows) };
};

// Returns the indices that entity would take up
const shipIndices = (ship: {
    position: number;
    length: number;
    orientation: String;
}) => {
    let position = ship.position;
    let indices = [];

    for (let i = 0; i < ship.length; i++) {
        const coords = indexToCoords(position);
        //Prevents overlap on y axis
        if (coords.y + 1 > cols) {
            break;
        }
        if (coords.x < indexToCoords(indices[i - 1]).x) {
            break;
        }
        indices.push(position);
        position =
            ship.orientation === "vertical" ? position + rows : position + 1;
    }

    return indices;
};

const calculateOverhang = (ship: {
    position: number;
    length: number;
    orientation: String;
}) => {
    const coords = indexToCoords(ship.position);
    return Math.max(
        ship.orientation === "vertical"
            ? coords.y + ship.length - rows
            : coords.x + ship.length - cols,
        0
    );
};

const Board = (props: {
    selectedShip: String;
    onShipSelect: React.Dispatch<React.SetStateAction<String>>;
}) => {
    const [indices, setIndices] = useState<number[]>([]);
    const [outOfBounds, setOutOfBounds] = useState(false);
    const [board, setBoard] = useState(generateEmptyBoard());
    const [boardPrev, setBoardPrev] = useState(board);
    const [orientation, setOrientation] = useState("horizontal");

    useEffect(() => {
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
    }, [boardPrev, indices, outOfBounds]);

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
                        setBoardPrev(board);
                        props.onShipSelect("");
                        AVAILABLE_SHIPS[index].placed = true;
                    }
                }
            }
        }
    };
    return (
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
    );
};

export default Board;
