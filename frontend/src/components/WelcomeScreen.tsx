import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import classes from "./WelcomeScreen.module.css";

export const WelcomeScreen = (props: {
    setGame: React.Dispatch<React.SetStateAction<string>>;
    setRoomName: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [roomName, setRoomName] = useState("");
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
            <h2 className={classes.title}>Enter Room Name</h2>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Room Name"
                        id="name"
                        onChange={(e) => {
                            setRoomName(e.target.value);
                        }}
                    ></Form.Control>
                </Form.Group>

                <Button
                    onClick={() => {
                        props.setGame("setup");
                        props.setRoomName(roomName);
                    }}
                >
                    Play
                </Button>
            </Form>
        </Container>
    );
};
