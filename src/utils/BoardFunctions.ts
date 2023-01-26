import { CalculateOverhangInterface } from "../components/interfaces/BoardInterface";

export const rows: number = 10;
export const cols: number = 10;

export const generateEmptyBoard: () => string[] = () => {
    return new Array(rows * cols).fill("empty");
};

export const coordsToIndex = (coords: { x: number; y: number }) => {
    return coords.y * rows + coords.x;
};

export const indexToCoords = (index: number) => {
    return { x: index % rows, y: Math.floor(index / rows) };
};

export const calculateOverhang = (ship: CalculateOverhangInterface) => {
    const coords = indexToCoords(ship.position);
    return Math.max(
        ship.orientation === "vertical"
            ? coords.y + ship.length - rows
            : coords.x + ship.length - cols,
        0
    );
};

// Returns the indices that entity would take up
export const shipIndices = (ship: {
    position: number;
    length: number;
    orientation: string;
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
