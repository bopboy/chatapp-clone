import React from 'react'
import { Form, ProgressBar, Row, Col } from 'react-bootstrap'

function MessageForm() {
    return (
        <div>
            <Form>
                <Form.Group contrlId="exampleForm.ControlTextarea1">
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>
            </Form>
            <ProgressBar variant="warning" label="60%" now={60} style={{ marginTop: '1rem' }} />
            <Row>
                <Col>
                    <button style={{ width: '100%' }} className="message-form-button">SEND</button>
                </Col>
                <Col>
                    <button style={{ width: '100%' }} className="message-form-button">UPLOAD</button>
                </Col>
            </Row>
        </div>
    )
}

export default MessageForm
