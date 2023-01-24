import {
    shipIndices,
    indexToCoords,
    rows,
    cols,
    generateEmptyBoard,
} from "./BoardFunctions";
import { AVAILABLE_SHIPS } from "./Fleet";

const calculateOverhang = (
    position: number,
    length: number,
    orientation: string
) => {
    const coords = indexToCoords(position);
    return Math.max(
        orientation === "vertical"
            ? coords.y + length - rows
            : coords.x + length - cols,
        0
    );
};

const calculateOverlapMiss = (
    position: number,
    length: number,
    orientation: string,
    board: string[]
) => {
    const indexs = shipIndices({ position, length, orientation });
    let overlap = false;

    indexs.forEach((i) => {
        if (board[i] === "miss") {
            overlap = true;
        }
    });
    return overlap;
};

export const computerFire = (board: string[]): number => {
    const ships = [5, 4, 3, 3, 2];
    const boardSize = 100;

    let freq: number[] = Array(100).fill(0);

    // Generate all possible ship locations
    let possibleLocations: {
        position: number;
        length: number;
        orientation: string;
    }[] = [];
    ships.forEach((length) => {
        for (let position = 0; position < boardSize; position++) {
            for (let orientation of ["vertical", "horizontal"]) {
                // Check if ship would overhang the board or overlap a "miss" square
                if (
                    calculateOverhang(position, length, orientation) > 0 ||
                    calculateOverlapMiss(position, length, orientation, board)
                ) {
                    continue;
                } else {
                    possibleLocations.push({ position, length, orientation });
                    const squares = shipIndices({
                        position,
                        length,
                        orientation,
                    });

                    squares.forEach((square) => {
                        freq[square] = (freq[square] || 0) + 1;
                    });
                }
            }
        }
    });

    for (let i = 0; i < 100; i++) {
        if ((Math.floor(i / 10) + i) % 2 === 0) {
            freq[i] = Math.floor(freq[i] * 1.2);
        }

        if (board[i] === "hit") {
            console.log(i);
            freq[i] = 0;
            if (
                (calculateOverhang(i, 2, "horizontal") === 0 &&
                    board[i + 1] === "hit" &&
                    i + 1 < 100) ||
                (calculateOverhang(i - 1, 2, "horizontal") === 0 &&
                    board[i - 1] === "hit" &&
                    i - 1 >= 0)
            ) {
                console.log("h");
                freq[i + 1] = Math.floor(freq[i + 1] * 100);
                freq[i - 1] = Math.floor(freq[i - 1] * 100);
            }
            if (
                (i - 10 >= 0 && board[i - 10] === "hit") ||
                (i + 10 < 99 && board[i + 10] === "hit")
            ) {
                console.log("v");
                freq[i - 10] = Math.floor(freq[i - 10] * 100);
                freq[i + 10] = Math.floor(freq[i + 10] * 100);
            }

            if (i - 10 >= 0) {
                console.log("v?");
                freq[i - 10] = Math.floor(freq[i - 10] * 10);
            }
            if (i + 10 < 99) {
                freq[i + 10] = Math.floor(freq[i + 10] * 10);
                console.log("v?");
            }

            if (calculateOverhang(i, 2, "horizontal") === 0 && i + 1 < 100) {
                freq[i + 1] = Math.floor(freq[i + 1] * 10);
                console.log("h?");
            }
            if (calculateOverhang(i - 1, 2, "horizontal") === 0 && i - 1 >= 0) {
                freq[i - 1] = Math.floor(freq[i - 1] * 10);
                console.log("h?");
            }
        }
        if (board[i] === "sunk" || board[i] === "miss") {
            freq[i] = 0;
        }
    }

    const fire: number = freq.reduce((accumulator, current, index) => {
        return current > freq[accumulator] ? index : accumulator;
    }, 0);
    console.log(freq);
    return fire;
};

const checkBoard = (board: string[], locations: number[]): boolean => {
    for (let i = 0; i < locations.length; i++) {
        if (board[locations[i]] === "ship") {
            return false;
        }
    }
    return true;
};

export const generateComputerBoard = () => {
    let board = generateEmptyBoard();
    let ships: { name: string; location: number[] }[] = [];
    for (let index = 0; index < AVAILABLE_SHIPS.length; index++) {
        let placed = false;
        while (!placed) {
            const orientation = ["horizontal", "vertical"];
            const orientationIndex = Math.floor(
                Math.random() * orientation.length
            );

            const ship = {
                position: Math.floor(Math.random() * 100),
                length: AVAILABLE_SHIPS[index].length,
                orientation: orientation[orientationIndex],
            };

            const overhang = calculateOverhang(
                ship.position,
                ship.length,
                ship.orientation
            );
            if (overhang > 0) {
                continue;
            }

            const indices = shipIndices(ship);

            if (!checkBoard(board, shipIndices(ship))) {
                continue;
            }

            ships.push({
                name: AVAILABLE_SHIPS[index].name,
                location: indices,
            });

            indices.forEach((index) => {
                board[index] = "ship";
            });

            placed = true;
        }
    }
    return { board: board, shipLocations: ships };
};
