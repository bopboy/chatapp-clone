import React, { useState, useEffect } from 'react'
import { Container, Row, Col, InputGroup, FormControl, Image, Accordion, Card, Button, Media } from 'react-bootstrap'
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
    const userPosts = useSelector(state => state.chatRoom.userPosts)
    useEffect(() => {
        if (chatRoom && user) {
            addFavoriteListener(chatRoom.id, user.uid)
            // return () => off(child(usersRef, `${user.uid}/favorited`))
        }
    }, [chatRoom, user])
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
    const renderUserPosts = (userPosts) =>
        Object.entries(userPosts)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([key, val], i) => (
                <Media key={i} style={{ marginBottom: '3px', display: 'flex' }}>
                    <img style={{ borderRadius: '10px', marginRight: '10px' }} width={36} height={36} className="mr-3" src={val.image} alt={val.name} />
                    <Media.Body>
                        <h6>{key}</h6>
                        <p>{val.count}개</p>
                    </Media.Body>
                </Media>
            ))

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
                {!isPrivate &&
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <p>
                            <Image
                                src={chatRoom && chatRoom.createdBy.image}
                                roundedCircle
                                style={{ width: '30px', height: '30px' }}
                            />
                            {`${chatRoom && chatRoom.createdBy.name}`}
                        </p>
                    </div>
                }
                <Row>
                    <Col>
                        <Accordion>
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" style={{ textDecoration: 'none' }}>Description</Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>{chatRoom && chatRoom.description}</Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </Col>
                    <Col>
                        <Accordion>
                            <Card>
                                <Card.Header style={{ padding: '0 1rem' }}>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" style={{ textDecoration: 'none' }}>Posts Count</Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>{userPosts && renderUserPosts(userPosts)}</Card.Body>
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
