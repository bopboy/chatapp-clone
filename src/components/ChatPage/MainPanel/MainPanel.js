import React, { Component } from 'react'
import Message from './Message'
import MessageHeader from './MessageHeader'
import MessageForm from './MessageForm'
import { connect } from 'react-redux'
import { getDatabase, ref, onChildAdded, child, onChildRemoved } from 'firebase/database'
import { setUserPosts } from '../../../redux/actions/chatRoom_actions'

export class MainPanel extends Component {
    state = {
        messages: [],
        messageRef: ref(getDatabase(), "messages"),
        typingRef: ref(getDatabase(), "typing"),
        messageLoading: true,
        searchTerm: "", searchResults: [], searchLoading: false,
        typingUsers: []
    }
    componentDidMount() {
        const { chatRoom } = this.props
        if (chatRoom) {
            this.addMessageListener(chatRoom.id)
            this.addTypingListener(chatRoom.id)
        }
    }
    addMessageListener = (chatRoomID) => {
        let messagesArray = []
        let { messageRef } = this.state;
        onChildAdded(child(messageRef, chatRoomID), snapshot => {
            messagesArray.push(snapshot.val());
            this.setState({
                messages: messagesArray,
                messagesLoading: false
            })
            this.userPostsCount(messagesArray)
        })
    }
    addTypingListener = (chatRoomID) => {
        let typingUsers = []
        let { typingRef } = this.state;
        onChildAdded(child(typingRef, chatRoomID), snapshot => {
            if (snapshot.key !== this.props.user.uid) {
                typingUsers = typingUsers.concat({ id: snapshot.key, name: snapshot.val() })
                this.setState({ typingUsers })
            }
        })
        onChildRemoved(child(typingRef, chatRoomID), snapshot => {
            const index = typingUsers.findIndex(user => user.id === snapshot.key)
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snapshot.key)
                this.setState({ typingUsers })
            }
        })
    }
    userPostsCount = (messages) => {
        const userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) acc[message.user.name].count += 1
            else acc[message.user.name] = { image: message.user.image, count: 1 }
            return acc
        }, {})
        this.props.dispatch(setUserPosts(userPosts))
    }
    renderMessage = (messages) => (
        messages.length > 0 &&
        messages.map(message => (
            <Message key={message.timestamp} message={message} user={this.props.user} />
        ))
    )
    handleSearchChange = e => {
        this.setState(
            { searchTerm: e.target.value, searchLoading: true },
            () => this.handleSearchMessages()
        )
    }
    handleSearchMessages = () => {
        const chatRoomMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, "gi")
        const searchResults = chatRoomMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) acc.push(message)
            return acc
        }, [])
        this.setState({ searchResults })
    }
    renderTypingUsers = (typingUsers) =>
        typingUsers.length > 0 &&
        typingUsers.map(user => (<span key={user.name.userID}>{user.name.userID} 님이 입력 중입니다...</span>))

    render() {
        const { messages, searchTerm, searchResults, typingUsers } = this.state
        return (
            <div style={{ padding: '2rem 2rem 0 2rem' }} >
                <MessageHeader handleSearchChange={this.handleSearchChange} />
                <div style={{ width: '100%', height: '600px', border: '.2rem solid #ececec', borderRadius: '4px', padding: '1rem', marginBottom: '1rem', overflow: 'auto' }}>
                    {searchTerm ?
                        this.renderMessage(searchResults) :
                        this.renderMessage(messages)}
                </div>
                {typingUsers.length > 0 && this.renderTypingUsers(typingUsers)}
                <MessageForm />
            </div >
        )
    }
}
const mapStateToProps = state => {
    return { user: state.user.currentUser, chatRoom: state.chatRoom.currentChatRoom }
}
export default connect(mapStateToProps)(MainPanel)
