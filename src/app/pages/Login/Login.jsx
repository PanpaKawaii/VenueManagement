import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../../mocks/CallingAPI.js';
import { useAuth } from '../../hooks/AuthContext/AuthContext.jsx';
import './Login.css';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const ResetLoginInputs = () => {
        var inputs = document.querySelectorAll('input');
        inputs.forEach(function (input) {
            input.value = '';
        });
        setLoginError({ value: '', name: '' });
    };

    const [Remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [LoginError, setLoginError] = useState({ value: '', name: '' });

    const Login = async (Email, Password) => {
        if (!Email) {
            console.error('Invalid value');
            setLoginError({ value: 'Invalid email', name: 'Email' });
            return;
        }
        if (!Password) {
            console.error('Invalid value');
            setLoginError({ value: 'Invalid password', name: 'Password' });
            return;
        }

        const LoginData = {
            email: Email,
            password: Password,
        };
        console.log('LoginData:', LoginData);

        try {
            setLoading(true);
            const AccountResponse = await postData('Login/authenticate', LoginData, '');
            console.log('AccountResponse', AccountResponse);
            if (AccountResponse) {
                if (AccountResponse.role == 'Admin') {
                    login(AccountResponse);
                    navigate('/admin');
                } else if (AccountResponse.role == 'Owner') {
                    login(AccountResponse);
                    navigate('/owner');
                } else { setLoginError({ value: 'Unsupported role', name: 'Email' }); }
            } else { setLoginError({ value: 'Incorrect email', name: 'Email' }); }
        } catch (error) {
            console.log('Login failed:', error);
            setLoginError({ value: 'Login failed', name: 'Email or Password' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitLogin = (e) => {
        e.preventDefault();
        setLoginError({ value: '', name: '' });
        const Email = e.target.email.value;
        const Password = e.target.password.value;
        console.log({ Email, Password });
        Login(Email, Password);
    };

    const handleRemember = () => {
        setRemember(p => !p);
    };

    return (
        <div className='loginregister-container'>
            <div className='card-box'>
                <div className='bubble bubble1'></div>
                <div className='bubble bubble2'></div>
                <div className='bubble bubble3'></div>
                <div className='title'>LOGIN</div>
                <form onSubmit={handleSubmitLogin}>
                    <div className='form-group form-input-login'>
                        <i className={`fa-solid fa-user ${LoginError.name.includes('Email') && 'invalid-icon'}`}></i>
                        <input type='email' name='email' placeholder='Email' style={{ border: LoginError.name.includes('Email') && '2px solid #dc3545', }} />
                    </div>
                    <div className='form-group form-input-login'>
                        <i className={`fa-solid fa-key ${LoginError.name.includes('Password') && 'invalid-icon'}`}></i>
                        <input type='password' name='password' placeholder='Password' style={{ border: LoginError.name.includes('Password') && '2px solid #dc3545', }} />
                    </div>
                    <div className='form-check form-check-login'>
                        <div className='form-remember'>
                            <label className='label-remember'>
                                <input type='checkbox' id='checkbox-remember' checked={Remember} onChange={handleRemember} />
                                Remember me
                            </label>
                        </div>

                        <a href='#' className='forget-link'>Forgot password?</a>
                    </div>

                    {LoginError && <div className='message error-message'>{LoginError.value}</div>}
                    {!LoginError && <div className='message error-message'></div>}

                    <div className='btn-box'>
                        <button type='submit' className='btn-submit' disabled={loading}>SUBMIT</button>
                        <button type='reset' className='btn-reset' onClick={ResetLoginInputs}>CLEAR</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
