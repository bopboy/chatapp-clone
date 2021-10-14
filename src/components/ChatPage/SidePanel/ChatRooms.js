import React, { Component } from 'react'
import { FaRegSmileWink, FaPlus } from 'react-icons/fa'
import { Modal, Button, Form, Badge } from 'react-bootstrap'
import { connect } from 'react-redux'
import { getDatabase, ref, push, set, onValue, off, child, onChildAdded } from "firebase/database";
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_actions';

export class ChatRooms extends Component {
    state = {
        show: false, name: "", description: "",
        chatRoomRef: ref(getDatabase(), "chatRooms"),
        messagesRef: ref(getDatabase(), "messages"),
        chatRooms: [],
        firstLoad: true,
        activeChatRoomId: "",
        notifications: []
    }
    componentDidMount() { this.AddChatRoomsListener() }
    componentWillUnmount() {
        off(this.state.chatRoomRef)
        this.state.chatRooms.forEach(room => off(ref(getDatabase(), "messages" + room.id)))
    }
    setFirstChatRoom = () => {
        const firstChatRoom = this.state.chatRooms[0]
        if (this.state.firstLoad && this.state.chatRooms.length > 0) {
            this.props.dispatch(setCurrentChatRoom(firstChatRoom))
            this.setState({ activeChatRoomId: firstChatRoom.id })
        }
        this.setState({ firstLoad: false })
    }
    AddChatRoomsListener = () => {
        let chatRoomsArray = []
        // onValue(this.state.chatRoomRef, snapshot => {
        //     snapshot.forEach(childSnapshot => {
        //         chatRoomsArray.push(childSnapshot.val())
        //         this.addNotificationListener(childSnapshot.key)
        //     })
        //     this.setState({ chatRooms: chatRoomsArray }, () => this.setFirstChatRoom())
        //     chatRoomsArray = []
        // }, { onlyOnce: false })
        onChildAdded(this.state.chatRoomRef, DataSnapshot => {
            chatRoomsArray.push(DataSnapshot.val());
            this.setState({ chatRooms: chatRoomsArray },
                () => this.setFirstChatRoom());
            this.addNotificationListener(DataSnapshot.key);
        })
    }
    addNotificationListener = (chatRoomID) => {
        let { messagesRef } = this.state;
        onValue(child(messagesRef, chatRoomID), DataSnapshot => {
            if (this.props.chatRoom) {
                this.handleNotification(
                    chatRoomID,
                    this.props.chatRoom.id,
                    this.state.notifications,
                    DataSnapshot
                )
            }
        })
    }
    handleNotification = (chatRoomID, currentChatRoomID, notifications, snapshot) => {
        let lastTotal = 0
        let numChildren = snapshot.size
        let index = notifications.findIndex(noti => noti.id === chatRoomID)
        if (index === -1) {
            notifications.push({
                id: chatRoomID, total: numChildren, lastKnownTotal: numChildren, count: 0
            })
        } else {
            if (chatRoomID !== currentChatRoomID) {
                lastTotal = notifications[index].lastKnownTotal
                if (numChildren - lastTotal > 0) notifications[index].count = numChildren - lastTotal
            }
            notifications[index].total = numChildren
        }
        this.setState({ notifications })
    }
    handleClose = () => this.setState({ show: false })
    handleShow = () => this.setState({ show: true })
    handleSubmit = (e) => {
        e.preventDefault()
        const { name, description } = this.state
        if (this.isFormValid(name, description)) this.addChatRoom()
    }
    isFormValid = (name, description) => name && description
    addChatRoom = async () => {
        const key = push(this.state.chatRoomRef).key
        const { name, description } = this.state
        const { user } = this.props
        const newChatRoom = {
            id: key,
            name,
            description,
            createdBy: { name: user.displayName, image: user.photoURL }
        }
        try {
            await set(ref(getDatabase(), 'chatRooms/' + key), newChatRoom)
            this.setState({ name: "", description: "", show: false })
        } catch (err) { alert(err) }
    }
    changeChatRoom = (room) => {
        this.props.dispatch(setCurrentChatRoom(room))
        this.props.dispatch(setPrivateChatRoom(false))
        this.setState({ activeChatRoomId: room.id })
        this.clearNotifications()
    }
    clearNotifications = () => {
        let index = this.state.notifications.findIndex(noti => noti.id === this.props.chatRoom.id)
        if (index !== -1) {
            let updateNotifications = [...this.state.notifications]
            updateNotifications[index].lastKnownTotal = this.state.notifications[index].total
            updateNotifications[index].count = 0
            this.setState({ notifications: updateNotifications })
        }
    }
    getNotificationCount = (room) => {
        let count = 0
        this.state.notifications.forEach(noti => {
            if (noti.id === room.id) count = noti.count
        })
        if (count > 0) return count
    }
    renderChatRooms = (chatRooms) =>
        chatRooms.length > 0 && chatRooms.map(room => (
            <li key={room.id}
                onClick={() => this.changeChatRoom(room)}
                style={{ backgroundColor: room.id === this.state.activeChatRoomId && "#ffffff45", display: 'flex', justifyContent: 'space-between' }}
            ># {room.name}
                <Badge style={{ marginTop: '4px', backgroundColor: '#ff000095' }} variant="danger">
                    {this.getNotificationCount(room)}
                </Badge>
            </li>
        ))

    render() {
        return (
            <div>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <FaRegSmileWink style={{ marginRight: 3 }} />
                    CHAT ROOMS {" "} (1)
                    <FaPlus style={{ position: 'absolute', right: 0, cursor: 'pointer' }} onClick={this.handleShow} />
                </div>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {this.renderChatRooms(this.state.chatRooms)}
                </ul>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a Chat Room</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Room Name</Form.Label>
                                <Form.Control
                                    type="text" placeholder="Enter a chat room name"
                                    onChange={e => this.setState({ name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Room Description</Form.Label>
                                <Form.Control
                                    type="text" placeholder="Enter a chat room description"
                                    onChange={e => this.setState({ description: e.target.value })}
                                />
                            </Form.Group>
                            {/* <Button variant="primary" type="submit">
                                Submit
                            </Button> */}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleSubmit}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return { user: state.user.currentUser, chatRoom: state.chatRoom.currentChatRoom }
}
export default connect(mapStateToProps)(ChatRooms)
