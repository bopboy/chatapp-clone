import React, { Component } from 'react'
import Message from './Message'
import MessageHeader from './MessageHeader'
import MessageForm from './MessageForm'
import { connect } from 'react-redux'
import { getDatabase, ref, onChildAdded, child, onChildRemoved, off } from 'firebase/database'
import { setUserPosts } from '../../../redux/actions/chatRoom_actions'

export class MainPanel extends Component {
    messageEndRef = React.createRef()
    state = {
        messages: [],
        messageRef: ref(getDatabase(), "messages"),
        typingRef: ref(getDatabase(), "typing"),
        messageLoading: true,
        searchTerm: "", searchResults: [], searchLoading: false,
        typingUsers: [],
        listenersList: []
    }
    componentDidMount() {
        const { chatRoom } = this.props
        if (chatRoom) {
            this.addMessageListener(chatRoom.id)
            this.addTypingListener(chatRoom.id)
        }
    }
    componentWillUnmount() {
        off(this.state.messageRef);
        this.removeListeners(this.state.listenersList)
    }
    componentDidUpdate() {
        if (this.messageEndRef) this.messageEndRef.scrollIntoView({ behavior: 'smooth' })
    }
    removeListeners = (listeners) => {
        // let { typingRef } = this.state;
        listeners.forEach(listener => { off(ref(getDatabase(), `typing/${listener.id}`), listener.event) })
        // listeners.forEach(listener => { off(ref(child(typingRef, listener.id)), listener.event) })
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
        this.addToListenersList(chatRoomID, this.state.typingRef, "child_added")
        onChildRemoved(child(typingRef, chatRoomID), snapshot => {
            const index = typingUsers.findIndex(user => user.id === snapshot.key)
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snapshot.key)
                this.setState({ typingUsers })
            }
        })
        this.addToListenersList(chatRoomID, this.state.typingRef, "child_removed")
    }
    addToListenersList = (id, ref, event) => {
        const index = this.state.listenersList.findIndex(listener => {
            return (listener.id === id && listener.ref === ref && listener.event === event)
        })
        if (index === -1) {
            const newListener = { id, ref, event }
            this.setState({ listenersList: this.state.listenersList.concat(newListener) })
        }
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
                        this.renderMessage(messages)
                    }
                    {typingUsers.length > 0 && this.renderTypingUsers(typingUsers)}
                    <div ref={node => (this.messageEndRef = node)} />
                </div>
                <MessageForm />
            </div >
        )
    }
}
const mapStateToProps = state => {
    return { user: state.user.currentUser, chatRoom: state.chatRoom.currentChatRoom }
}
export default connect(mapStateToProps)(MainPanel)
