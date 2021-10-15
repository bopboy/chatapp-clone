import {
    SET_CURRENT_CHAT_ROOM, SET_PRIVATE_CHAT_ROOM, SET_USER_POSTS
} from './types'

export function setCurrentChatRoom(currentRoom) {
    return { type: SET_CURRENT_CHAT_ROOM, payload: currentRoom }
}
export function setPrivateChatRoom(isPrivate) {
    return { type: SET_PRIVATE_CHAT_ROOM, payload: isPrivate }
}
export function setUserPosts(userPosts) {
    return { type: SET_USER_POSTS, payload: userPosts }
}