import React, { useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import classes from "./WelcomeScreen.module.css";

export const WelcomeScreen = (props: {
    setRoomName: React.Dispatch<React.SetStateAction<string>>;
    roomsList: string[];
}) => {
    const [roomName, setRoomName] = useState("");

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Container className={classes.main}>
                <h1>Welcome to Battleship!</h1>
                <h2 className={classes.title}>Rules</h2>
                <p className={classes.intro}>
                    You and your opponent are competing navy commanders. Your
                    fleets are positioned at secret coordinates, and you take
                    turns firing torpedoes at each other. The first to sink the
                    other person’s whole fleet wins!
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
                    <Form.Group className="mb-3">
                        <Button
                            onClick={() => {
                                props.setRoomName(roomName);
                            }}
                        >
                            Enter Room
                        </Button>
                    </Form.Group>
                    <Button variant="danger" onClick={handleShow}>
                        Existing Rooms
                    </Button>
                </Form>
            </Container>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Rooms</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Room Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.roomsList.map((room, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{room}</td>
                                        <td>
                                            <Button
                                                onClick={() =>
                                                    props.setRoomName(room)
                                                }
                                            >
                                                {" "}
                                                Join
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
