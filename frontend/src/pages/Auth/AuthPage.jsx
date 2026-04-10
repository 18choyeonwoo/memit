import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FaGoogle, FaApple } from 'react-icons/fa';
import styles from './AuthPage.module.css';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      onAuthSuccess();
    } catch (err) {
      alert('로그인 실패: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['auth-page']}>
      {/* Background decoration */}
      <div className={styles['bg-gradient']} />
      
      <div className={styles['auth-container']}>
        {/* Left Side: Illustration / Text */}
        <div className={styles['auth-hero']}>
          <div className={styles['hero-content']}>
            <h1 className={styles['logo']}>Memit</h1>
            <h2 className={styles['hero-title']}>
              Every funny moment, <br />
              <span>captured and shared.</span>
            </h2>
            <p className={styles['hero-desc']}>
              세상의 모든 밈을 한곳에서. <br />
              나만의 밈 갤러리를 만들고 친구들과 공유해 보세요.
            </p>
          </div>
          <div className={styles['hero-footer']}>
            <p>© 2026 Memit. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles['auth-form-side']}>
          <div className={styles['form-wrapper']}>
            <div className={styles['form-header']}>
              <h3>{isLogin ? 'Welcome Back!' : 'Join Memit'}</h3>
              <p>{isLogin ? '밈잇에 오신 것을 환영합니다.' : '새로운 밈 여행을 시작해 보세요.'}</p>
            </div>

            <form className={styles['form']} onSubmit={handleSubmit}>
              {!isLogin && (
                <div className={styles['input-group']}>
                  <label>Username</label>
                  <div className={styles['input-wrapper']}>
                    <FiUser className={styles['input-icon']} />
                    <input type="text" placeholder="아이디를 입력하세요" required />
                  </div>
                </div>
              )}

              <div className={styles['input-group']}>
                <label>Email</label>
                <div className={styles['input-wrapper']}>
                  <FiMail className={styles['input-icon']} />
                  <input 
                    type="email" 
                    placeholder="example@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className={styles['input-group']}>
                <label>Password</label>
                <div className={styles['input-wrapper']}>
                  <FiLock className={styles['input-icon']} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {isLogin && <div className={styles['forgot-password']}>Forgot Password?</div>}

              <button className={styles['submit-btn']} disabled={isLoading}>
                {isLoading ? (
                  <span className={styles['loader']} />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className={styles['divider']}>
              <span>Or continue with</span>
            </div>

            <div className={styles['social-login']}>
              <button className={styles['social-btn']}>
                <FaGoogle />
              </button>
              <button className={styles['social-btn']}>
                <FaApple />
              </button>
            </div>

            <div className={styles['toggle-auth']}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button className={styles['toggle-btn']} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
