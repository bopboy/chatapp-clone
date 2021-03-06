import React, { useState, useRef } from 'react'
import { Form, ProgressBar, Row, Col } from 'react-bootstrap'
import { getDatabase, ref, serverTimestamp, set, push, child, remove } from "firebase/database";
import { useSelector } from 'react-redux';
import mime from 'mime-types'
import { getStorage, ref as ref2, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

function MessageForm() {
    const chatRoom = useSelector(state => state.chatRoom.currentChatRoom)
    const isPrivate = useSelector(state => state.chatRoom.isPrivate)
    const user = useSelector(state => state.user.currentUser)
    const [content, setContent] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const messagesRef = ref(getDatabase(), "messages")
    const typingRef = ref(getDatabase(), "typing")
    const inputOpenImageRef = useRef()

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
            // setErrors(prev => prev.concat("메시지를 입력하세요"))
            setErrors(["메시지를 입력하세요"])
            return
        }
        setLoading(true)
        try {
            await set(push(ref(getDatabase(), "messages/" + chatRoom.id)), createMessage())
            remove(child(typingRef, `${chatRoom.id}/${user.uid}`))
            setLoading(false)
            setContent("")
            setErrors([])
        } catch (err) {
            setErrors(pre => pre.concat(err.message))
            setLoading(false)
            setTimeout(() => { setErrors([]) }, 5000)
        }
    }
    const handleOpenImageRef = () => { inputOpenImageRef.current.click() }
    const getPath = () => {
        if (isPrivate) return `/message/private/${chatRoom.id}`
        else return `/message/public`
    }
    const handleUploadImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const filePath = `${getPath()}/${file.name}`
        const metadata = { contentType: mime.lookup(file.name) }
        setLoading(true)
        try {
            const storage = getStorage()
            const image = ref2(storage, filePath)
            const uploadTask = uploadBytesResumable(image, file, metadata)
            uploadTask.on('state_changed',
                snapshot => {
                    const percentage = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)
                    setPercentage(percentage)
                },
                err => {
                    console.error(err)
                    setLoading(false)
                },
                () => {
                    getDownloadURL(image).then(url => {
                        set(push(child(messagesRef, chatRoom.id)), createMessage(url))
                    })
                }
            )
        } catch (e) { alert(e) }
    }
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) { handleSubmit() }
        if (content) set(child(typingRef, `${chatRoom.id}/${user.uid}`), { userID: user.displayName })
        else remove(child(typingRef, `${chatRoom.id}/${user.uid}`))
    }
    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Control as="textarea" rows={3} value={content} onChange={handleChange} onKeyDown={handleKeyDown} />
                </Form.Group>
            </Form>
            {
                (percentage > 0 && percentage < 100) &&
                <ProgressBar variant="warning" label={`${percentage} % `} now={percentage} style={{ marginTop: '1rem' }} />
            }
            <div>
                {errors.map(err => <p style={{ color: 'red' }} key={err}>{err}</p>)}
            </div>
            <Row>
                <Col>
                    <button
                        onClick={handleSubmit} style={{ width: '100%' }} className="message-form-button"
                        disabled={loading ? true : false}
                    >SEND</button>
                </Col>
                <Col>
                    <button
                        onClick={handleOpenImageRef} style={{ width: '100%' }} className="message-form-button"
                        disabled={loading ? true : false}
                    >UPLOAD</button>
                </Col>
            </Row>
            <input type="file" ref={inputOpenImageRef} style={{ display: 'none' }} onChange={handleUploadImage} />
        </div>
    )
}

export default MessageForm
