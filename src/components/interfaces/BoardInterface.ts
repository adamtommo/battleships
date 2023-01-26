export interface BoardInterface {
    player: string;
    turn: boolean;
    board: string[];
    fire: (index: number, computer: boolean) => void;
}

export interface FleetInterface {
    onShipSelect: React.Dispatch<ActionInterface>;
    onStart: () => void;
}

export interface ShipFleetInterface {
    name: string;
    length: number;
    placed: boolean;
}

export interface GridSquareInterface {
    state: string;
    index: number;
    currentCoord: (i: number, click: boolean, rotate: boolean) => void;
}

export interface CalculateOverhangInterface {
    position: number;
    length: number;
    orientation: string;
}

export interface SetBoardInterface {
    selectedShip: string;
    onShipSelect: React.Dispatch<ActionInterface>;
    setInitialBoard: React.Dispatch<ActionInterface>;
}

export interface GameBoardInterface {
    board: string[];
    shipLocations: {
        name: string;
        location: number[];
    }[];
}

export interface SetBoardShipInterface {
    name: string;
    location: number[];
}

export interface ActionInterface {
    type:
        | "SET_GAME_STATE"
        | "SET_COMPUTER"
        | "SET_FULL_ERROR"
        | "SET_DISCONNECT_ERROR"
        | "SET_WAITING"
        | "SET_YOUR_TURN"
        | "SET_WINNER"
        | "SET_LOSER"
        | "SET_ROOMS"
        | "SET_YOU"
        | "SET_OPPONENT"
        | "SET_SELECTED_SHIP";
    payload: any;
}

export interface StateInterface {
    you: GameBoardInterface;
    opponent: GameBoardInterface;
    gameState: "intro" | "setup" | "play";
    computer: boolean;
    fullError: boolean;
    disconnectError: boolean;
    waiting: boolean;
    yourTurn: boolean;
    winner: boolean;
    loser: boolean;
    rooms: string[];
    selectedShip: string;
}
