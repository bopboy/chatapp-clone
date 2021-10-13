import React, { useState } from 'react'
import { Form, ProgressBar, Row, Col } from 'react-bootstrap'
import { getDatabase, ref, serverTimestamp, set, push } from "firebase/database";
import { useSelector } from 'react-redux';

function MessageForm() {
    const chatRoom = useSelector(state => state.chatRoom.currentChatRoom)
    const user = useSelector(state => state.user.currentUser)
    const [content, setContent] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const messageRef = ref(getDatabase(), "messages")

    const handleChange = (e) => { setContent(e.target.value) }
    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: serverTimestamp(),
            user: { id: user.uid, name: user.displayName, image: user.photoURL }
        }
        if (fileUrl !== null) message["image"] = fileUrl
        else message["content"] = content
        return message
    }
    const handleSubmit = async () => {
        if (!content) {
            setErrors(prev => prev.concat("메시지를 입력하세요"))
            return
        }
        setLoading(true)
        try {
            await set(push(ref(getDatabase(), "messages/" + chatRoom.id)), createMessage())
            setLoading(false)
            setContent("")
            setErrors([])
        } catch (err) {
            setErrors(pre => pre.concat(err.message))
            setLoading(false)
            setTimeout(() => { setErrors([]) }, 5000)
        }
    }
    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Control as="textarea" rows={3} value={content} onChange={handleChange} />
                </Form.Group>
            </Form>
            <ProgressBar variant="warning" label="60%" now={60} style={{ marginTop: '1rem' }} />
            <div>
                {errors.map(err => <p style={{ color: 'red' }} key={err}>{err}</p>)}
            </div>
            <Row>
                <Col>
                    <button onClick={handleSubmit} style={{ width: '100%' }} className="message-form-button">SEND</button>
                </Col>
                <Col>
                    <button style={{ width: '100%' }} className="message-form-button">UPLOAD</button>
                </Col>
            </Row>
        </div>
    )
}

export default MessageForm
