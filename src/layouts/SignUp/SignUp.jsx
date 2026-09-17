import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
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
      setError(err.response?.data?.message || t('auth.registerFailed', 'Đăng ký thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (userData) => {
    login(userData);
    navigate(path.HOME);
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
              animationData={signUpAnimation} 
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
              {loading ? t('auth.processing', 'Đang xử lý...') : (t('auth.signUpBtn') || 'Sign Up')}
            </button>
          </form>
          
          <div className="social-login-container">
            <div className="divider">
              <span>{t('auth.or', 'HOẶC')}</span>
            </div>
            
            <GoogleAuthButton 
              onSuccess={handleSuccess} 
              onError={setError} 
              setIsLoading={setLoading} 
              text={t('auth.signUpGoogle', 'Đăng ký bằng Google')}
            />
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
