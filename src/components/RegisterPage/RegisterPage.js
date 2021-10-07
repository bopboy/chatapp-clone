import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebase from '../../firebase'


function RegisterPage() {
    const { register, watch, formState: { errors }, handleSubmit } = useForm()
    const password = useRef()
    password.current = watch("password")
    const [errorFromSubmit, seterrorFromSubmit] = useState("")
    const onSubmit = async (data) => {
        try {
            const auth = getAuth(firebase);
            const createdUser = await createUserWithEmailAndPassword(auth, data.email, data.password)
            console.log('createdUser', createdUser)
        } catch (error) {
            seterrorFromSubmit(error.message)
            setTimeout(() => { seterrorFromSubmit("") }, 5000)
        }
    }
    return (
        <div className="auth-wrapper">
            <div style={{ textAlign: 'center' }}><h3>Register</h3></div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Email</label>
                <input type="email" name="email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
                {errors.email && <p>이메일 입력은 필수입니다</p>}

                <label>Name</label>
                <input type="text" name="name" {...register("name", { required: true, maxLength: 10 })} />
                {errors.name && errors.name.type === 'required' && <p>이름 입력은 필수입니다</p>}
                {errors.name && errors.name.type === 'maxLength' && <p>글자수가 10자를 초과하면 안됩니다</p>}

                <label>Password</label>
                <input type="password" name="password" {...register("password", { required: true, minLength: 6 })} />
                {errors.password && errors.password.type === 'required' && <p>비번 입력은 필수입니다</p>}
                {errors.password && errors.password.type === 'minLength' && <p>비번은 최소 6자여야 합니다</p>}

                <label>Password Confirm</label>
                <input type="passowrd" name="password_confirm" {...register("password_confirm", { required: true, validate: v => v === password.current })} />
                {errors.password_confirm && errors.password_confirm.type === 'required' && <p>비번 재입력은 필수입니다</p>}
                {errors.password_confirm && errors.password_confirm.type === 'validate' && <p>비번과 재입력 비번이 다릅니다</p>}
                {errorFromSubmit && <p>{errorFromSubmit}</p>}
                <input type="submit" value="SUBMIT" />
                <Link style={{ color: 'gray', textDecoration: 'none' }} to="login">이미 아이디가 있다면...</Link>
            </form>
        </div>
    )
}

export default RegisterPage
