import React, { useEffect } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';

import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from './firebase'

import { setUser, clearUser } from './redux/actions/user_actions';

function App() {
  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    const auth = getAuth(firebase);
    onAuthStateChanged(auth, user => {
      if (user) {
        history.push("/")
        dispatch(setUser(user))
      } else {
        history.push("/login")
        dispatch(clearUser())
      }
    })
  }, [])
  return (
    <Switch>
      <Route exact path='/' component={ChatPage} />
      <Route exact path='/login' component={LoginPage} />
      <Route exact path='/register' component={RegisterPage} />
    </Switch>
  );
}

export default App;
