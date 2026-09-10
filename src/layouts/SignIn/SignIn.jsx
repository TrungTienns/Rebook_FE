import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './SignIn.scss';
import { Lottie } from 'lottie-react';
import signInAnimation from '../../assets/Animations/SignInAnimation.json';
import Header from '../Header/Header.jsx';

export default function SignInLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    
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
    }
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setLoading(true);
    
    try {
      const res = await authService.login({ email, password });
      if (res && res.success) {
        const userData = res.data;
        login(userData);
        if (userData.role === 'admin') {
          navigate(path.ADMIN_DASHBOARD);
        } else {
          navigate(path.HOME);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
      if (res && res.success) {
        const userData = res.data;
        login(userData);
        if (userData.role === 'admin') {
          navigate(path.ADMIN_DASHBOARD);
        } else {
          navigate(path.HOME);
        }
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
      <div className="auth-layout sign-in-layout">
      <div className="auth-container">
        <div className="auth-image-col">
          <motion.div 
            className="auth-watermark"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } }
            }}
          >
            {'Rebook'.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: -30, rotate: -10 },
                  visible: { opacity: 0.35, y: 0, rotate: 0 }
                }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <div className="lottie-wrapper">
            <Lottie 
              src={signInAnimation} 
              autoplay={true}
              loop={true} 
            />
          </div>
        </div>
        <div className="auth-form-col">
          <h1 className="auth-title">{t('auth.signInTitle') || 'Welcome Back!'}</h1>
          <p className="auth-subtitle">{t('auth.signInSubtitle') || 'Sign in to access your library'}</p>
          
          {error && <div className="auth-error-banner">{error}</div>}
          
          <form className="auth-form" onSubmit={handleLogin} noValidate>
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
              {loading ? 'Processing...' : (t('auth.signInBtn') || 'Sign In')}
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
              Sign in with Google
            </button>
          </div>
          
          <div className="auth-switch">
            {t('auth.noAccount') || "Don't have an account?"} <Link to={path.SIGN_UP} className="auth-link">{t('auth.signUpNow') || 'Sign Up Now'}</Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
