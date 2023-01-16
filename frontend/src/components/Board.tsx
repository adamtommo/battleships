import GridSquare from "./GridSquare";
import classes from "./Board.module.css";
import { useEffect, useState } from "react";
import { generateEmptyBoard } from "./BoardFunctions";
import { Alert } from "react-bootstrap";

const Board = (props: {
    player: string;
    turn: boolean;
    board: String[];
    fire: (index: number) => void;
}) => {
    const [board, setBoard] = useState<String[]>(generateEmptyBoard());

    useEffect(() => {
        setBoard(props.board);
        console.log(props.board);
    }, [board, props.board]);

    const currentCoord = (i: number, click: boolean, rotate: boolean) => {
        if (
            click &&
            props.turn &&
            props.player === "Opponent" &&
            board[i] === "empty"
        ) {
            props.fire(i);
        }
    };

    return (
        <>
            <Alert variant="dark">{props.player}</Alert>
            <div className={classes.board}>
                {board.map((state: String, i: number) => {
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
