import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
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
      setError(err.response?.data?.message || t('auth.loginFailed', 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (userData) => {
    login(userData);
    if (userData.role === 'admin') {
      navigate(path.ADMIN_DASHBOARD);
    } else {
      navigate(path.HOME);
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
              animationData={signInAnimation} 
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
              {loading ? t('auth.processing', 'Đang xử lý...') : (t('auth.signInBtn') || 'Sign In')}
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
            />
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
