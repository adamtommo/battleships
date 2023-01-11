import GridSquare from "./GridSquare";
import classes from "./Board.module.css";
import { useState } from "react";
import { generateEmptyBoard } from "./BoardFunctions";
import { Alert } from "react-bootstrap";

const Board = (props: { player: String }) => {
    const [board, setBoard] = useState(generateEmptyBoard());

    const currentCoord = (i: number, click: boolean, rotate: boolean) => {
        console.log(i);
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
