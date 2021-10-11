import React from 'react'
import { useSelector } from 'react-redux'
import { IoIosChatboxes } from 'react-icons/io'
import { Dropdown, Image } from 'react-bootstrap'

import { getAuth, signOut } from "firebase/auth";
import firebase from '../../../firebase'

function UserPanel() {
    const user = useSelector(state => state.user.currentUser)
    const handleLogout = () => {
        const auth = getAuth(firebase);
        signOut(auth)
    }
    return (
        <div>
            <h3 style={{ color: 'white' }}>
                <IoIosChatboxes />{" "} Chat App
            </h3>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
                <Image src={user && user.photoURL} roundedCircle
                    style={{ width: '30px', height: '30px', marginTop: '3px' }} />
                <Dropdown>
                    < Dropdown.Toggle variant="success" id="dropdown-basic"
                        style={{ background: 'transparent', border: '0px' }}>
                        {user && user.displayName}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">프로필 사진 변경</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div >
    )
}

export default UserPanel
