import React, { useState, useEffect } from 'react';
import './Login.css';
import { toast, ToastContainer } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';
import jwtDecode from 'jwt-decode';

// ─── STEPS ────────────────────────────────────────────────────────
// 1 → Login
// 2 → Forgot Password  (email daalo, reset link aayega)
// 3 → Register         (email + password)
// 4 → OTP Verify       (register ke baad OTP verify)

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email verified! Ab login karo.');
    }
  }, []);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP field
  const [otp, setOtp] = useState('');

  // ══════════════════════════════════════════════════════════════
  // 1. LOGIN
  // ══════════════════════════════════════════════════════════════
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in both fields');

    setLoading(true);
    try {
      const loginResponse = await postData('admin/login', {
        email,
        password,
      });

      if (loginResponse?.success) {
        const token = loginResponse.token;
        try {
          const decodedToken = jwtDecode(token);

          sessionStorage.setItem(
            'Admin',
            JSON.stringify({
              token,
              user: decodedToken,
            }),
          );

          sessionStorage.setItem('token', token);
        } catch (err) {
          console.warn('Token decode error:', err);
        }
        sessionStorage.setItem('login', 'true');

        toast.success('Login successful!');

        setTimeout(() => navigate('/admin/application/banners'), 800);
      } else {
        toast.error(loginResponse?.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong during login.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 2. FORGOT PASSWORD
  // ══════════════════════════════════════════════════════════════
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email first');

    setLoading(true);
    try {
      const response = await postData('admin/forgot-password', { email });

      if (response?.success) {
        toast.success('Reset link sent! Check your email.');
        setStep(1);
        setEmail('');
      } else {
        toast.error(response?.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 3. REGISTER
  // ══════════════════════════════════════════════════════════════
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await postData('admin/register', {
        email,
        password,
      });

      if (response?.success) {
        toast.success('OTP bhej diya! Email check karo.');
        setStep(4); // OTP verify step pe jao
      } else {
        toast.error(response?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 4. VERIFY OTP
  // ══════════════════════════════════════════════════════════════
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter OTP');

    setLoading(true);
    try {
      const response = await postData('admin/verify-otp', { email, otp });

      if (response?.success) {
        toast.success('Email verified! Ab login karo.');
        setOtp('');
        setPassword('');
        setStep(1);
      } else {
        toast.error(response?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // RESEND OTP
  // ══════════════════════════════════════════════════════════════
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await postData('admin/resend-otp', { email });
      if (response?.success) {
        toast.success('Naya OTP bhej diya!');
      } else {
        toast.error(response?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // TITLES & SUBTITLES per step
  // ══════════════════════════════════════════════════════════════
  const stepConfig = {
    1: { title: 'Admin Login', subtitle: null },
    2: {
      title: 'Forgot Password',
      subtitle: 'Enter your email to receive a reset link',
    },
    3: { title: 'Register Admin', subtitle: 'Create a new admin account' },
    4: { title: 'Verify OTP', subtitle: `OTP bheja gaya: ${email}` },
  };

  const { title, subtitle } = stepConfig[step];

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="main-login">
      <ToastContainer />
      <div className="login-container">
        <h2 className="login-title">{title}</h2>
        {subtitle && <div className="login-divider">{subtitle}</div>}

        {/* ── STEP 1: LOGIN ───────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
                required
              />
              <div className="show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="show-password-checkbox"
                />
                <label htmlFor="show-password-checkbox">Show Password</label>
              </div>
              <div className="forgot-password">
                <p onClick={() => setStep(2)}>Forgot Password?</p>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>

            {/* <div
              className="back-to-login"
              style={{ textAlign: 'center', marginTop: '12px' }}
            >
              <p
                onClick={() => setStep(3)}
                style={{ cursor: 'pointer', color: '#4F46E5' }}
              >
                New here? Register
              </p>
            </div> */}
          </form>
        )}

        {/* ── STEP 2: FORGOT PASSWORD ─────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="admin@example.com"
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="back-to-login">
              <p onClick={() => setStep(1)}>← Back to Login</p>
            </div>
          </form>
        )}

        {/* ── STEP 3: REGISTER ────────────────────────────────── */}
        {/* {step === 3 && (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
                required
              />
              <div className="show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="show-password-checkbox-reg"
                />
                <label htmlFor="show-password-checkbox-reg">
                  Show Password
                </label>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="back-to-login">
              <p onClick={() => setStep(1)}>← Back to Login</p>
            </div>
          </form>
        )} */}

        {/* ── STEP 4: VERIFY OTP ──────────────────────────────── */}
        {/* {step === 4 && (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-control"
                placeholder="6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <p
                onClick={handleResendOTP}
                style={{
                  cursor: 'pointer',
                  color: '#4F46E5',
                  fontSize: '14px',
                }}
              >
                OTP nahi aaya? Resend karo
              </p>
            </div>

            <div className="back-to-login">
              <p onClick={() => setStep(3)}>← Back to Register</p>
            </div>
          </form>
        )} */}
      </div>
    </div>
  );
};

export default Login;
