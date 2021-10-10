import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebase from '../../firebase'

function LoginPage() {
    const { register, formState: { errors }, handleSubmit } = useForm()
    const [errorFromSubmit, seterrorFromSubmit] = useState("")
    const [loading, setLoading] = useState(false)
    const onSubmit = async (data) => {
        try {
            setLoading(true)
            const auth = getAuth(firebase);
            await signInWithEmailAndPassword(auth, data.email, data.password)
            setLoading(false)
        } catch (error) {
            seterrorFromSubmit(error.message)
            setLoading(false)
            setTimeout(() => { seterrorFromSubmit("") }, 5000)
        }
    }
    return (
        <div className="auth-wrapper">
            <div style={{ textAlign: 'center' }}><h3>Login</h3></div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Email</label>
                <input type="email" name="email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
                {errors.email && <p>이메일 입력은 필수입니다</p>}

                <label>Password</label>
                <input type="password" name="password" {...register("password", { required: true, minLength: 6 })} />
                {errors.password && errors.password.type === 'required' && <p>비번 입력은 필수입니다</p>}
                {errors.password && errors.password.type === 'minLength' && <p>비번은 최소 6자여야 합니다</p>}

                <input type="submit" value="SUBMIT" disabled={loading} />
                <Link style={{ color: 'gray', textDecoration: 'none' }} to="register">아직 아이디가 없다면...</Link>
            </form>
        </div>
    )
}

export default LoginPage
