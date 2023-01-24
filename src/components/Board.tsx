import GridSquare from "./GridSquare";
import classes from "./Board.module.css";
import { useEffect, useState } from "react";
import { generateEmptyBoard } from "./BoardFunctions";
import { Alert } from "react-bootstrap";

const Board = (props: {
    player: string;
    turn: boolean;
    board: string[];
    fire: (index: number, computer: boolean) => void;
}) => {
    const [board, setBoard] = useState<string[]>(generateEmptyBoard());

    useEffect(() => {
        setBoard(props.board);
    }, [board, props.board]);

    const currentCoord = (i: number, click: boolean) => {
        if (
            click &&
            props.turn &&
            props.player === "Opponent" &&
            board[i] === "empty"
        ) {
            props.fire(i, false);
        }
    };

    return (
        <>
            <Alert variant="dark">{props.player}</Alert>
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

export default Board;
