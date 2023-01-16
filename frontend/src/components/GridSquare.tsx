import classes from "./GridSquare.module.css";
import cx from "classnames";

const GridSquare = (props: {
    state: String;
    index: number;
    currentCoord: (i: number, click: boolean, rotate: boolean) => void;
}) => {
    return (
        <div
            onMouseEnter={() => props.currentCoord(props.index, false, false)}
            onMouseLeave={() => props.currentCoord(-1, false, false)}
            onContextMenu={(e) => {
                e.preventDefault();
                props.currentCoord(props.index, false, true);
            }}
            onClick={() => props.currentCoord(props.index, true, false)}
            className={cx(
                classes.gridSquare,
                `${classes[props.state.toLowerCase()]}`
            )}
        ></div>
    );
};

export default GridSquare;
