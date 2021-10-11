import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IoIosChatboxes } from 'react-icons/io'
import { Dropdown, Image } from 'react-bootstrap'
import mime from 'mime-types'

import { getAuth, signOut, updateProfile } from "firebase/auth";
import firebase from '../../../firebase'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as ref2, set } from 'firebase/database';

import { setPhotoURL } from '../../../redux/actions/user_actions'

function UserPanel() {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.currentUser)
    const inputOpenImageRef = useRef()
    const handleLogout = () => {
        const auth = getAuth(firebase);
        signOut(auth)
    }
    const handleOpenImageRef = () => { inputOpenImageRef.current.click() }
    const handleUploadImage = async (e) => {
        const file = e.target.files[0]
        const metadata = { contentType: mime.lookup(file.name) }
        try {
            const storage = getStorage()
            const userImages = ref(storage, `user_image/${user.uid}`)
            await uploadBytes(userImages, file, metadata)
            const downloadURL = await getDownloadURL(ref(storage, `user_image/${user.uid}`))

            const auth = getAuth(firebase);
            const currentUser = auth.currentUser
            await updateProfile(currentUser, {
                photoURL: downloadURL
            })
            dispatch(setPhotoURL(downloadURL))
            const database = getDatabase(firebase)
            set(ref2(database, 'users/' + currentUser.uid), {
                image: downloadURL
            })
        } catch (err) {
            console.log(err)
        }
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
                        <Dropdown.Item onClick={handleOpenImageRef}>프로필 사진 변경</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <input
                    type="file" style={{ display: 'none' }} accept="image/jpeg, image/png"
                    ref={inputOpenImageRef}
                    onChange={handleUploadImage}
                />
            </div>
        </div >
    )
}

export default UserPanel
