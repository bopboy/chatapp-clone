import React, { Component } from 'react'
import { FaRegSmile } from 'react-icons/fa'
import { getDatabase, ref, onValue } from 'firebase/database'
import { connect } from 'react-redux'

export class DirectMessage extends Component {
    state = { userRef: ref(getDatabase(), "users"), users: [] }
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
    renderDirectMessages = () => {

    }
    render() {
        console.log('users', this.state.users)
        return (
            <div>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FaRegSmile style={{ marginRight: 3 }} /> DIRECT MESSAGES (1)
                </span>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {this.renderDirectMessages()}
                </ul>
            </div>
        )
    }
}

const mapStateToProps = state => { return { user: state.user.currentUser } }
export default connect(mapStateToProps)(DirectMessage)
