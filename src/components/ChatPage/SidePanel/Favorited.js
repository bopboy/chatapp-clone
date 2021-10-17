import React, { Component } from 'react'
import { FaRegSmileBeam } from 'react-icons/fa'
import { ref, getDatabase, onChildAdded, onChildRemoved, child, off } from 'firebase/database'
import { connect } from 'react-redux'
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_actions'

export class Favorited extends Component {
    state = {
        userRef: ref(getDatabase(), 'users'),
        favoriteChatRooms: [],
        activeChatRoomID: ''
    }
    componentDidMount() {
        if (this.props.user) this.addListener(this.props.user.uid)
    }
    componentWillUnmount() {
        if (this.props.user) { this.removeListener(this.props.user.uid) }
    }
    removeListener = (userID) => {
        const { userRef } = this.state
        off(child(userRef, `${userID}/favorited`))
    }
    addListener = (userID) => {
        const { userRef } = this.state
        onChildAdded(child(userRef, `${userID}/favorited`), snapshot => {
            const favorites = { id: snapshot.key, ...snapshot.val() }
            this.setState({ favoriteChatRooms: [...this.state.favoriteChatRooms, favorites] })
        })
        onChildRemoved(child(userRef, `${userID}/favorited`), snapshot => {
            const removed = { id: snapshot.key, ...snapshot.val() }
            const filtered = this.state.favoriteChatRooms.filter(room => room.id !== removed.id)
            this.setState({ favoriteChatRooms: filtered })
        })
    }
    changeChatRoom = (room) => {
        this.props.dispatch(setCurrentChatRoom(room))
        this.props.dispatch(setPrivateChatRoom(false))
        this.setState({ activeChatRoomID: room.id })
    }
    renderFavoritedChatRooms = (rooms) =>
        rooms.length > 0 &&
        rooms.map(room => (
            <li key={room.id}
                onClick={() => this.changeChatRoom(room)}
                style={{ backgroundColor: room.id === this.state.activeChatRoomID && "#ffffff45" }}
            ># {room.name}</li>
        ))
    render() {
        const { favoriteChatRooms } = this.state
        return (
            <div>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaRegSmileBeam style={{ marginRight: '3px' }} /> FAVORITED ({favoriteChatRooms.length})
                </span>
                <ul style={{ listStyleType: 'none', padding: '0' }}>
                    {this.renderFavoritedChatRooms(favoriteChatRooms)}
                </ul>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return { user: state.user.currentUser }
}
export default connect(mapStateToProps)(Favorited)
