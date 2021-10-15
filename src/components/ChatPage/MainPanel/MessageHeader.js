import React, { useState, useEffect } from 'react'
import { Container, Row, Col, InputGroup, FormControl, Image, Accordion, Card, Button } from 'react-bootstrap'
import { FaLock, FaLockOpen } from 'react-icons/fa'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { AiOutlineSearch } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { getDatabase, ref, child, update, remove, onValue } from "firebase/database";

function MessageHeader({ handleSearchChange }) {
    const chatRoom = useSelector(state => state.chatRoom.currentChatRoom)
    const isPrivate = useSelector(state => state.chatRoom.isPrivate)
    const user = useSelector(state => state.user.currentUser)
    const [isFavorited, setIsFavorited] = useState(false)
    const usersRef = ref(getDatabase(), "users");
    useEffect(() => { if (chatRoom && user) addFavoriteListener(chatRoom.id, user.uid) }, [])
    const addFavoriteListener = (chatRoomID, userID) => {
        onValue(child(usersRef, `${userID}/favorited`), data => {
            if (data.val() !== null) {
                const chatRoomIDs = Object.keys(data.val())
                const isAleardyFavorited = chatRoomIDs.includes(chatRoomID)
                setIsFavorited(isAleardyFavorited)
            }
        })
    }
    const handleFavorite = () => {
        if (isFavorited) {
            setIsFavorited(prev => !prev)
            remove(child(usersRef, `${user.uid}/favorited/${chatRoom.id}`))
        } else {
            setIsFavorited(prev => !prev)
            update(child(usersRef, `${user.uid}/favorited`), {
                [chatRoom.id]: {
                    name: chatRoom.name,
                    description: chatRoom.description,
                    createdBy: { name: chatRoom.createdBy.name, image: chatRoom.createdBy.image }
                }
            })
        }
    }
    return (
        <div style={{ width: '100%', height: '172px', border: '.2rem solid #ececec', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
            <Container>
                <Row>
                    <Col><h2>{isPrivate ? <FaLock style={{ marginBottom: '5px' }} /> : <FaLockOpen style={{ marginBottom: '5px' }} />} {chatRoom && chatRoom.name}
                        {!isPrivate &&
                            <span style={{ cursor: 'pointer' }} onClick={handleFavorite}>
                                {" "}{isFavorited ? <MdFavorite style={{ marginBottom: '5px' }} /> : <MdFavoriteBorder style={{ marginBottom: '5px' }} />}
                            </span>}
                    </h2>
                    </Col>
                    <Col>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1"><h5><AiOutlineSearch /></h5></InputGroup.Text>
                            <FormControl
                                onChange={handleSearchChange}
                                placeholder="Search Message"
                                aria-label="Search"
                                aria-describedby="basic-addon1"
                            />
                        </InputGroup>
                    </Col>
                </Row>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <p>
                        <Image src="" /> {" "} user name
                    </p>
                </div>
                <Row>
                    <Col>
                        <Accordion>
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" style={{ textDecoration: 'none' }}>Click me!</Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>Hello! I'm the body</Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </Col>
                    <Col>
                        <Accordion>
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" style={{ textDecoration: 'none' }}>Click me!</Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>Hello! I'm the body</Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </Col>
                </Row>
            </Container>
        </div >
    )
}

export default MessageHeader
