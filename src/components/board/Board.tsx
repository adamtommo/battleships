import { useEffect, useState } from "react";

import GridSquare from "./GridSquare";
import { generateEmptyBoard } from "../../utils/BoardFunctions";
import Alert from "react-bootstrap/Alert";

import classes from "../css/Board.module.css";
import cx from "classnames";
import { BoardInterface } from "../interfaces/BoardInterface";

const Board = (props: BoardInterface) => {
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
            <div
                className={
                    props.turn && props.player === "Opponent"
                        ? cx(classes.board, classes.turn)
                        : props.player !== "Opponent" && !props.turn
                        ? cx(classes.board, classes.turn)
                        : classes.board
                }
            >
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
