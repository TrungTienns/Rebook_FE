import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './SignUp.scss';
import { Lottie } from 'lottie-react';
import signUpAnimation from '../../assets/Animations/SignUpAnimation.json';
import Header from '../Header/Header.jsx';

export default function SignUpLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    
    if (!fullName.trim()) {
      setFullNameError(t('auth.nameRequired') || 'Vui lòng nhập họ và tên');
      isValid = false;
    }
    
    if (!email) {
      setEmailError(t('auth.emailRequired') || 'Vui lòng nhập địa chỉ email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('auth.emailInvalid') || 'Email không hợp lệ (cần có @ và tên miền)');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError(t('auth.passwordRequired') || 'Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('auth.passwordShort') || 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }
    return isValid;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setLoading(true);
    
    try {
      // Create a username from email for manual registration
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const res = await authService.register({ username, email, password, fullName });
      if (res?.success) {
        login(res.data);
        navigate(path.HOME);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await authService.firebaseLogin(idToken);
      if (res?.success) {
        login(res.data);
        navigate(path.HOME);
      }
    } catch (err) {
      console.error(err);
      setError('Social login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header/>
    <div className="auth-layout sign-up-layout">
      <div className="auth-container reverse">
        <div className="auth-image-col">
          <motion.div 
            className="auth-watermark"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
            }}
          >
            {'Rebook'.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0, rotate: 15 },
                  visible: { opacity: 0.35, scale: 1, rotate: 0 }
                }}
                transition={{ type: 'spring', damping: 8, stiffness: 150, mass: 0.8 }}
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <div className="lottie-wrapper">
            <Lottie 
              src={signUpAnimation} 
              autoplay={true}
              loop={true} 
            />
          </div>
        </div>
        <div className="auth-form-col">
          <h1 className="auth-title">{t('auth.signUpTitle') || 'Create Account'}</h1>
          <p className="auth-subtitle">{t('auth.signUpSubtitle') || 'Join our reading community'}</p>
          
          {error && <div className="auth-error-banner">{error}</div>}
          
          <form className="auth-form" onSubmit={handleSignUp} noValidate>
            <div className="form-group">
              <label>{t('auth.name') || 'Full Name'}</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                className={`auth-input ${fullNameError ? 'input-error' : ''}`}
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setFullNameError(''); }}
              />
              {fullNameError && <div className="field-error-msg">{fullNameError}</div>}
            </div>
            
            <div className="form-group">
              <label>{t('auth.email') || 'Email'}</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className={`auth-input ${emailError ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              />
              {emailError && <div className="field-error-msg">{emailError}</div>}
            </div>
            
            <div className="form-group">
              <label>{t('auth.password') || 'Password'}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`auth-input ${passwordError ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              />
              {passwordError && <div className="field-error-msg">{passwordError}</div>}
            </div>
            
            <button type="submit" className="btn-cartoon auth-submit" disabled={loading}>
              {loading ? 'Processing...' : (t('auth.signUpBtn') || 'Sign Up')}
            </button>
          </form>
          
          <div className="social-login-container">
            <div className="divider">
              <span>OR</span>
            </div>
            
            <button 
              className="btn-cartoon google-btn" 
              onClick={() => handleSocialLogin(googleProvider)}
              disabled={loading}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>
          
          <div className="auth-switch">
            {t('auth.hasAccount') || 'Already have an account?'} <Link to={path.SIGN_IN} className="auth-link">{t('auth.signInNow') || 'Sign In Now'}</Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
