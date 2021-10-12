import {
    SET_CURRENT_CHAT_ROOM
} from './types'

export function setCurrentChatRoom(currentRoom) {
    return { type: SET_CURRENT_CHAT_ROOM, payload: currentRoom }
}