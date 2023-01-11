import { Button, Container } from "react-bootstrap";
import classes from "./WelcomeScreen.module.css";

export const WelcomeScreen = (props: {
    setGame: React.Dispatch<React.SetStateAction<string>>;
}) => {
    return (
        <Container className={classes.main}>
            <h1>Welcome to Battleship!</h1>
            <h2 className={classes.title}>Rules</h2>
            <p className={classes.intro}>
                You and your opponent are competing navy commanders. Your fleets
                are positioned at secret coordinates, and you take turns firing
                torpedoes at each other. The first to sink the other person’s
                whole fleet wins!
            </p>
            <Button onClick={() => props.setGame("setup")}>Play</Button>
        </Container>
    );
};
