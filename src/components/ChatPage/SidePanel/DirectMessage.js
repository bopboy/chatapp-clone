import React, { Component } from 'react'
import { FaRegSmile } from 'react-icons/fa'
import { getDatabase, ref, onValue } from 'firebase/database'
import { connect } from 'react-redux'
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_actions'

export class DirectMessage extends Component {
    state = { userRef: ref(getDatabase(), "users"), users: [], activeChatRoom: '' }
    componentDidMount() {
        if (this.props.user) this.addUserListener(this.props.user.uid)
    }
    addUserListener = (currentUserID) => {
        const { userRef } = this.state
        let userArray = []
        onValue(userRef, snapshot => {
            snapshot.forEach(childSnapshot => {
                if (currentUserID !== childSnapshot.key) {
                    const user = childSnapshot.val()
                    user['uid'] = childSnapshot.key
                    user['status'] = 'offline'
                    userArray.push(user)
                    this.setState({ users: userArray })
                } 
            })
        })

    }
    renderDirectMessages = users =>
        users.length > 0 && users.map(user => (
            <li key={user.uid} onClick={() => this.changeChatRoom(user)}
                style={{ backgroundColor: user.uid === this.state.activeChatRoom && "#ffffff45" }}
            ># {user.name}</li>)
        )
    changeChatRoom = (user) => {
        const chatRoomID = this.getChatRoomID(user.uid)
        const chatRoomData = { id: chatRoomID, name: user.name }
        this.props.dispatch(setCurrentChatRoom(chatRoomData))
        this.props.dispatch(setPrivateChatRoom(true))
        this.setActiveChatRoom(user.uid)
    }
    setActiveChatRoom = (userID) => {
        this.setState({ activeChatRoom: userID })
    }
    getChatRoomID = (userID) => {
        const currentUserID = this.props.user.uid
        return userID > currentUserID ? `${userID}/${currentUserID}` : `${currentUserID}/${userID}`
    }
    render() {
        const { users } = this.state
        return (
            <div>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaRegSmile style={{ marginRight: 3 }} /> DIRECT MESSAGES (1)
                </span>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {this.renderDirectMessages(users)}
                </ul>
            </div>
        )
    }
}

const mapStateToProps = state => { return { user: state.user.currentUser } }
export default connect(mapStateToProps)(DirectMessage)
