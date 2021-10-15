import React, { Component } from 'react'
import Message from './Message'
import MessageHeader from './MessageHeader'
import MessageForm from './MessageForm'
import { connect } from 'react-redux'
import { getDatabase, onValue, ref } from 'firebase/database'

export class MainPanel extends Component {
    state = {
        messages: [], messageRef: ref(getDatabase(), "messages"), messageLoading: true,
        searchTerm: "", searchResults: [], searchLoading: false
    }
    componentDidMount() {
        const { chatRoom } = this.props
        if (chatRoom) this.addMessageListener(chatRoom.id)
    }
    addMessageListener = (chatRoomID) => {
        let messageArray = []
        onValue(ref(getDatabase(), 'messages/' + chatRoomID), snapshot => {
            snapshot.forEach(childSnapshot => {
                messageArray.push(childSnapshot.val())
            })
            this.setState({ messages: messageArray, messageLoading: false })
            messageArray = []
            // console.log(this.state.messages)
        }, { onlyOnce: false })
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
    render() {
        const { messages, searchTerm, searchResults } = this.state
        return (
            <div style={{ padding: '2rem 2rem 0 2rem' }} >
                <MessageHeader handleSearchChange={this.handleSearchChange} />
                <div style={{ width: '100%', height: '600px', border: '.2rem solid #ececec', borderRadius: '4px', padding: '1rem', marginBottom: '1rem', overflow: 'auto' }}>
                    {searchTerm ?
                        this.renderMessage(searchResults) :
                        this.renderMessage(messages)}
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
