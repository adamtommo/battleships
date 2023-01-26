import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import classes from "../css/Fleet.module.css";
import cx from "classnames";
import { Alert, Button } from "react-bootstrap";
import {
    FleetInterface,
    ShipFleetInterface,
} from "../interfaces/BoardInterface";

export const AVAILABLE_SHIPS = [
    {
        name: "carrier",
        length: 5,
        placed: false,
    },
    {
        name: "battleship",
        length: 4,
        placed: false,
    },
    {
        name: "cruiser",
        length: 3,
        placed: false,
    },
    {
        name: "submarine",
        length: 3,
        placed: false,
    },
    {
        name: "destroyer",
        length: 2,
        placed: false,
    },
];

const Fleet = (props: FleetInterface) => {
    const miniShips = (length: number) => {
        const ship = [];
        for (let index = 0; index < length; index++) {
            ship.push(<div key={index} className={classes.smallSquare}></div>);
        }
        return ship;
    };

    const memoizedProps = useMemo(() => props, [props]);
    const shipSelect = memoizedProps.onShipSelect;
    const [selected, setSelected] = useState<string>("");

    // const selected = (ship: string) => {
    //     props.onShipSelect({ type: "SET_SELECTED_SHIP", payload: selected });
    // }

    useEffect(() => {
        shipSelect({
            type: "SET_SELECTED_SHIP",
            payload: selected,
        });
    }, [shipSelect, selected]);

    return (
        <Card className={classes.shipList}>
            <Alert variant="dark">Your Ships</Alert>
            <Alert variant="info">Right click to rotate</Alert>
            {AVAILABLE_SHIPS.map((ship: ShipFleetInterface, i: number) => {
                if (ship.placed === true) {
                    return null;
                }
                return (
                    <Card
                        onClick={() => {
                            if (selected === ship.name) {
                                setSelected("");
                            } else {
                                setSelected(ship.name);
                            }
                        }}
                        key={i}
                        className={cx(
                            classes.shipItem,
                            selected === ship.name ? classes.selected : null
                        )}
                    >
                        <Card.Body>
                            <p>{ship.name}</p>
                            <div className={classes.smallShip}>
                                {miniShips(ship.length)}
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}
            {AVAILABLE_SHIPS.every((ship) => ship.placed === true) ? (
                <>
                    <Alert variant="primary">Ships are in formation!</Alert>
                    <Button onClick={props.onStart}>Play</Button>
                </>
            ) : null}
            <Button
                onClick={() => {
                    AVAILABLE_SHIPS.forEach((ship) => (ship.placed = false));
                    props.onShipSelect({
                        type: "SET_SELECTED_SHIP",
                        payload: "reset",
                    });
                }}
                variant="secondary"
            >
                Reset
            </Button>
        </Card>
    );
};

export default Fleet;
