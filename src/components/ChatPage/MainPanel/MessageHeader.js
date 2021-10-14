import React from 'react'
import { Container, Row, Col, InputGroup, FormControl, Image, Accordion, Card, Button } from 'react-bootstrap'
import { FaLock } from 'react-icons/fa'
import { MdFavorite } from 'react-icons/md'
import { AiOutlineSearch } from 'react-icons/ai'
function MessageHeader({ handleSearchChange }) {
    return (
        <div style={{ width: '100%', height: '172px', border: '.2rem solid #ececec', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
            <Container>
                <Row>
                    <Col><h2><FaLock /> Chat Room Name <MdFavorite /></h2></Col>
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
