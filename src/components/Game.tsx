import { useState } from "react";
import Board from "./Board";
import Fleet from "./Fleet";

const Game = () => {
    const [selectedShip, setSelectedShip] = useState<String>("");

    return (
        <>
            <Fleet onShipSelect={setSelectedShip} />
            <Board selectedShip={selectedShip} onShipSelect={setSelectedShip} />
        </>
    );
};

export default Game;
