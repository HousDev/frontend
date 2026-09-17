import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  Home,
  Key,
  UserCheck,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Mail,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building,
  RotateCcw,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { integrationsAPI } from "@/lib/integrationsAPI";
import { toast } from "react-toastify";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import logo from "/logo1.png";
import {
  requestMandatoryPreLoginLocation,
  getDeviceId,
  getBrowserSource,
} from "@/utils/deviceInfo";

interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role:
  | "admin"
  | "manager"
  | "agent"
  | "buyer"
  | "seller"
  | "team leader"
  | "sales team leader"
  | "presales team leader"
  | "sales manager"
  | "marketing executive"
  | "presales executive"
  | "sales executive";
  phone?: string;
  avatar?: string;
  is_active: boolean;
  buyer_id?: number | string;
  seller_id?: number | string;
}

type Persona = "buyer" | "seller" | "owner" | "tenant" | "broker";

const PERSONAS: Array<{ id: Persona; label: string; sub: string; icon: any }> = [
  { id: "buyer", label: "Buyer", sub: "Looking to purchase", icon: ShoppingBag },
  { id: "seller", label: "Seller", sub: "Looking to sell", icon: Home },
  { id: "owner", label: "Owner", sub: "Property owner / landlord", icon: Key },
  { id: "tenant", label: "Tenant", sub: "Looking to rent", icon: UserCheck },
  { id: "broker", label: "Broker / CP", sub: "Real estate partner", icon: Briefcase },
];

// Single background image from public folder
const BACKGROUND_IMAGE = "/ig.jpg";

interface AuthPageProps {
  initialMode?: "login" | "register";
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: isSignUp = true means Register, false means Login
  const [isSignUp, setIsSignUp] = useState<boolean>(
    initialMode === "register" || location.pathname.includes("/register")
  );

  // Sync mode with URL if needed
  useEffect(() => {
    const isRegPath = location.pathname.includes("/register");
    if (isRegPath !== isSignUp) {
      setIsSignUp(isRegPath);
    }
  }, [location.pathname]);

  const toggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    const newPath = signUp ? "/register" : "/login";
    const search = location.search || "";
    navigate(`${newPath}${search}`, { replace: true });
  };

  const { login, setAuthSession } = useAuth();
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || "ResaleExpert";
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // ===== BACKGROUND FADE-IN STATE (single image) =====
  const [fadeIn, setFadeIn] = useState(true);

  // ===== GOOGLE OAUTH CONFIG =====
  const [googleActive, setGoogleActive] = useState<boolean>(false);
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const googleLoginBtnRef = useRef<HTMLDivElement>(null);
  const googleRegisterBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    integrationsAPI.getPublicGoogleConfig().then((cfg) => {
      if (cfg && cfg.client_id && cfg.is_active) {
        setGoogleClientId(cfg.client_id);
        setGoogleActive(true);
      }
    });
  }, []);

  // Initialize and Render Google Sign-In Buttons
  useEffect(() => {
    if (!googleActive || !googleClientId) return;

    let timerId: any = null;
    let attempts = 0;

    const tryRender = () => {
      attempts++;
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSuccess,
          });

          // Render on Login Button Container
          if (googleLoginBtnRef.current) {
            googleLoginBtnRef.current.innerHTML = "";
            (window as any).google.accounts.id.renderButton(googleLoginBtnRef.current, {
              theme: "outline",
              size: "large",
              type: "standard",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 250,
            });
          }

          // Render on Register Button Container
          if (googleRegisterBtnRef.current) {
            googleRegisterBtnRef.current.innerHTML = "";
            (window as any).google.accounts.id.renderButton(googleRegisterBtnRef.current, {
              theme: "outline",
              size: "large",
              type: "standard",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 250,
            });
          }
          return;
        } catch (err) {
          console.warn("Google button render note:", err);
        }
      }

      if (attempts < 30) {
        timerId = setTimeout(tryRender, 120);
      }
    };

    const initTimer = setTimeout(tryRender, 80);
    return () => {
      clearTimeout(initTimer);
      if (timerId) clearTimeout(timerId);
    };
  }, [googleActive, googleClientId, isSignUp]);

  // ===== LOGIN STATE & HANDLERS =====
  const [loginFormData, setLoginFormData] = useState({ username: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [otpStep, setOtpStep] = useState<"input_email" | "input_otp">("input_email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name]) setLoginErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateLoginForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!loginFormData.username.trim()) errs.username = "Username is required";
    if (!loginFormData.password) errs.password = "Password is required";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setLoginLoading(true);
    try {
      const locResult = await requestMandatoryPreLoginLocation();
      if (locResult.error || !locResult.latitude || !locResult.longitude) {
        const errorMsg =
          locResult.error ||
          "Location access is required to log in. Please enable location permissions in your browser and try again.";
        toast.error(errorMsg);
        setLoginErrors((prev) => ({ ...prev, password: errorMsg }));
        setLoginLoading(false);
        return;
      }

      const deviceId = getDeviceId();
      const source = getBrowserSource();

      const response = (await (login as any)({
        ...loginFormData,
        latitude: locResult.latitude,
        longitude: locResult.longitude,
        address: locResult.address,
        device_id: deviceId,
        source: source,
      })) as unknown as User;

      if (!response) {
        toast.error("Invalid login response");
        return;
      }

      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }

      const targetPath = getRoleRedirectPath(response, from);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("location")) {
        toast.error(err?.message || "Location permission is required to log in.");
      } else if (msg.includes("password") || msg.includes("incorrect")) {
        setLoginErrors((prev) => ({ ...prev, password: "Incorrect password. Please try again." }));
        toast.error("Incorrect password. Please try again.");
      } else if (msg.includes("user") || msg.includes("not found")) {
        setLoginErrors((prev) => ({ ...prev, username: "Username not found." }));
        toast.error("Username not found.");
      } else {
        setLoginErrors((prev) => ({ ...prev, password: "Invalid credentials." }));
        toast.error("Invalid username or password.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim()) {
      setLoginErrors({ otpEmail: "Email or Username is required" });
      return;
    }
    setOtpLoading(true);
    setLoginErrors({});
    try {
      const res = await authAPI.sendLoginOTP({ emailOrUsername: otpEmail.trim() });
      if (res.success) {
        toast.success(res.message || "OTP sent successfully!");
        if (res.email) setOtpEmail(res.email);
        setOtpStep("input_otp");
        setOtpCountdown(60);
      } else {
        toast.error(res.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error sending login code.";
      toast.error(msg);
      setLoginErrors({ otpEmail: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setLoginErrors({ otpCode: "Please enter the 6-digit OTP code" });
      return;
    }
    setOtpLoading(true);
    setLoginErrors({});
    try {
      const locResult = await requestMandatoryPreLoginLocation();
      const deviceId = getDeviceId();
      const source = getBrowserSource();

      const res = await authAPI.verifyOTPAndLogin({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
        latitude: locResult.latitude,
        longitude: locResult.longitude,
        address: locResult.address,
        device_id: deviceId,
        source: source,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success(`Welcome back ${res.data.user.first_name || ""}! Logged in successfully.`);

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        const targetPath = getRoleRedirectPath(res.data.user, from);
        navigate(targetPath, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "OTP verification failed.";
      toast.error(msg);
      setLoginErrors({ otpCode: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  // ===== REGISTER STATE & HANDLERS =====
  const [registerStep, setRegisterStep] = useState<"form" | "otp" | "google_phone">("form");
  const [googleCredential, setGoogleCredential] = useState<string>("");

  const [regFormData, setRegFormData] = useState({
    salutation: "Mr.",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "buyer" as Persona,
    company_name: "",
    password: "",
    confirmPassword: "",
  });

  const [regOtpCode, setRegOtpCode] = useState(["", "", "", "", "", ""]);
  const [regTimer, setRegTimer] = useState(60);
  const [canResendReg, setCanResendReg] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Check state passed from location (e.g., from Google auth redirect)
  useEffect(() => {
    if (location.state?.googleCredential) {
      setGoogleCredential(location.state.googleCredential);
      if (location.state.googleProfile) {
        setRegFormData((prev) => ({
          ...prev,
          email: location.state.googleProfile.email || prev.email,
          first_name: location.state.googleProfile.first_name || prev.first_name,
          last_name: location.state.googleProfile.last_name || prev.last_name,
          salutation: location.state.googleProfile.salutation || prev.salutation,
          role: location.state.googleProfile.role || prev.role,
        }));
      }
      setRegisterStep("google_phone");
      setIsSignUp(true);
    }
  }, [location.state]);

  useEffect(() => {
    let interval: any;
    if (registerStep === "otp" && regTimer > 0) {
      interval = setInterval(() => setRegTimer((t) => t - 1), 1000);
    } else if (regTimer === 0) {
      setCanResendReg(true);
    }
    return () => clearInterval(interval);
  }, [registerStep, regTimer]);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegFormData((prev) => ({ ...prev, [name]: value }));
    if (regErrors[name]) setRegErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateRegForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!regFormData.first_name.trim()) errs.first_name = "First name is required";
    if (!regFormData.last_name.trim()) errs.last_name = "Last name is required";
    if (!regFormData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(regFormData.email)) {
      errs.email = "Please enter a valid email";
    }
    if (!regFormData.phone || regFormData.phone.length < 8) {
      errs.phone = "Valid phone number with country code is required";
    }
    if (!regFormData.password) {
      errs.password = "Password is required";
    } else if (regFormData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (regFormData.role === "broker" && !regFormData.company_name?.trim()) {
      errs.company_name = "Company Name / Firm Name is required for brokers";
    }
    if (regFormData.password !== regFormData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendRegOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegForm()) return;
    setRegLoading(true);
    try {
      await authAPI.sendRegistrationOTP({
        email: regFormData.email,
        first_name: regFormData.first_name,
        last_name: regFormData.last_name,
        phone: regFormData.phone,
        salutation: regFormData.salutation,
      });

      toast.success(`Verification code sent to ${regFormData.email}!`);
      setRegisterStep("otp");
      setRegTimer(60);
      setCanResendReg(false);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to send verification code.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleResendRegOTP = async () => {
    if (!canResendReg) return;
    setRegLoading(true);
    try {
      await authAPI.sendRegistrationOTP({
        email: regFormData.email,
        first_name: regFormData.first_name,
        last_name: regFormData.last_name,
        phone: regFormData.phone,
        salutation: regFormData.salutation,
      });
      toast.info("A new verification code has been sent!");
      setRegTimer(60);
      setCanResendReg(false);
      setRegOtpCode(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to resend code");
    } finally {
      setRegLoading(false);
    }
  };

  const handleRegOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...regOtpCode];
    newOtp[index] = val.slice(-1);
    setRegOtpCode(newOtp);
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleRegOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !regOtpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = regOtpCode.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the full 6-digit verification code.");
      return;
    }
    setRegLoading(true);
    try {
      const res = await authAPI.verifyOTPAndRegister({
        email: regFormData.email,
        otp: fullOtp,
        password: regFormData.password,
        salutation: regFormData.salutation,
        first_name: regFormData.first_name,
        last_name: regFormData.last_name,
        phone: regFormData.phone,
        role: regFormData.role,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success("Registration and email verification successful!");

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect") || "/properties";
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Verification failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  // Google OAuth Response Handler for Both Login and Register
  const handleGoogleSuccess = async (response: any) => {
    if (!response || !response.credential) return;
    setLoginLoading(true);
    setRegLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: response.credential,
        role: regFormData.role,
        salutation: regFormData.salutation,
        phone: regFormData.phone || undefined,
      });

      if (res.requires_profile_completion) {
        toast.info("Please complete your profile details to finish setup.");
        setGoogleCredential(response.credential);
        setRegFormData((prev) => ({
          ...prev,
          email: res.data?.email || prev.email,
          first_name: res.data?.first_name || prev.first_name,
          last_name: res.data?.last_name || prev.last_name,
        }));
        setRegisterStep("google_phone");
        setIsSignUp(true);
        return;
      }

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success(`Welcome ${res.data.user.first_name || "back"}! Logged in with Google.`);

        const isNewUser = Boolean(res.is_new_user || res.data?.is_new_user);
        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");

        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        if (isNewUser) {
          navigate("/properties", { replace: true });
          return;
        }

        const targetPath = getRoleRedirectPath(res.data.user, from);
        navigate(targetPath, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Google sign-in failed.");
    } finally {
      setLoginLoading(false);
      setRegLoading(false);
    }
  };

  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regFormData.first_name?.trim()) errs.first_name = "First name is required";
    if (!regFormData.last_name?.trim()) errs.last_name = "Last name is required";
    if (!regFormData.phone || regFormData.phone.length < 8) {
      errs.phone = "Valid phone number with country code is required";
    }
    if (regFormData.role === "broker" && !regFormData.company_name?.trim()) {
      errs.company_name = "Company Name / Firm Name is required for brokers";
    }

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }

    setRegLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: googleCredential,
        phone: regFormData.phone,
        role: regFormData.role,
        salutation: regFormData.salutation,
        first_name: regFormData.first_name,
        last_name: regFormData.last_name,
        company_name: regFormData.company_name,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success(`Welcome ${res.data.user.first_name || ""}! Registration complete.`);

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect") || "/properties";
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  // Safe redirect helper
  const getRoleRedirectPath = (userData: any, fallbackFrom?: string) => {
    const role = (userData?.role ?? "").toString().trim().toLowerCase();
    const uid = userData?.id || 1;

    if (role === "buyer") return `/buyer-dashboard/${userData?.buyer_id || uid}`;
    if (role === "seller") return `/seller-dashboard/${userData?.seller_id || uid}`;
    if (role === "tenant") return `/tenant-dashboard/${userData?.tenant_id || uid}`;
    if (role === "owner") return `/owner-dashboard/${userData?.owner_id || uid}`;
    if (role === "broker") return "/properties";

    const isCustomerPortalPath = (path: string) => {
      return (
        path.startsWith("/tenant-dashboard") ||
        path.startsWith("/buyer-dashboard") ||
        path.startsWith("/seller-dashboard") ||
        path.startsWith("/owner-dashboard") ||
        path.includes("tenants-account") ||
        path.includes("buyers-account") ||
        path.includes("sellers-account") ||
        path.includes("owners-account")
      );
    };

    if (fallbackFrom && !isCustomerPortalPath(fallbackFrom) && fallbackFrom !== "/login" && fallbackFrom !== "/register") {
      return fallbackFrom;
    }
    return "/dashboard";
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-[#0b1826]">
      {/* ===== FULL-PAGE BACKGROUND IMAGE (SINGLE IMAGE FROM PUBLIC /ig) ===== */}
      <img
        src={BACKGROUND_IMAGE}
        alt="Property background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Minimal Dark Wash - Keeps full-page background photo vivid and bright */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-[#0d2035]/20 to-black/40" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Decorative radial glows */}
      <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-radial-gradient from-[rgba(193,163,120,0.18)] to-transparent pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-radial-gradient from-[rgba(26,58,92,0.50)] to-transparent pointer-events-none" />

      {/* ===== BRAND LOGO ===== */}
      <div className="absolute z-30 top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-10 flex items-center">
        <Link to="/">
          <img
            src={logo}
            alt={companyName}
            className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] cursor-pointer"
          />
        </Link>
      </div>

      {/* ===== CENTERED DUAL-PANEL AUTH CARD - ULTRA GLASSMORPHISM ===== */}
      <div className="relative z-20 min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 pt-16 sm:pt-20 md:pt-8 pb-6 md:pb-8">
        <div className="relative w-full max-w-[900px] min-h-[500px] md:min-h-[560px] rounded-[24px] sm:rounded-[36px] overflow-hidden bg-white/15 backdrop-blur-md border border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.35)] flex flex-col md:flex-row">
          {/* Gold accent bar */}
          <div className="absolute top-0 left-10 right-10 h-[3.5px] bg-gradient-to-r from-transparent via-[#c1a378] to-transparent z-40 rounded-b-md" />

          {/* ==================================================================== */}
          {/* 1. LEFT FORM PANEL: SIGN IN FORM (Sliding Panel)                     */}
          {/* ==================================================================== */}
          <div
            className={`w-full md:w-1/2 h-full flex flex-col justify-center px-6 py-8 sm:px-9 sm:py-8 md:px-11 z-20 transition-all duration-700 ease-in-out ${isSignUp
              ? "md:translate-x-full opacity-0 pointer-events-none hidden md:flex"
              : "md:translate-x-0 opacity-100"
              }`}
            style={{
              transition: "transform 700ms cubic-bezier(.65,0,.35,1), opacity 700ms cubic-bezier(.65,0,.35,1)"
            }}
          >
            <h1 className="font-premium-serif text-[24px] sm:text-[26px] font-bold text-[#1a3a5c] tracking-[-0.02em] mb-1">
              Welcome back!
            </h1>
            <p className="text-[13px] text-black font-medium mb-4">
              Sign in to continue to your account
            </p>

            {/* Login Mode Switcher Pill */}
            <div className="flex p-1 bg-white/50 backdrop-blur-md rounded-2xl mb-4 border border-white/60 max-w-[260px] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setLoginErrors({});
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${authMode === "password"
                  ? "bg-[#D06718] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setLoginErrors({});
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${authMode === "otp"
                  ? "bg-[#D06718] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                OTP Login
              </button>
            </div>

            {/* PASSWORD LOGIN FORM */}
            {authMode === "password" && (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="mb-3">
                  <label
                    className="block text-[11px] font-bold text-[#1A3A5C] tracking-[0.08em] uppercase mb-1.5"
                    htmlFor="lp-username"
                  >
                    Username or Email
                  </label>
                  <input
                    id="lp-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={loginFormData.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username or email"
                    className={`w-full p-[10px_14px] border-[1.5px] rounded-[12px] text-[13.5px] text-[#111] bg-white/60 backdrop-blur-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${loginErrors.username
                      ? "border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]"
                      : "border-white/80"
                      }`}
                  />
                  {loginErrors.username && (
                    <p className="text-xs text-[#e05555] mt-1">{loginErrors.username}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    className="block text-[11px] font-bold text-[#1A3A5C] tracking-[0.08em] uppercase mb-1.5"
                    htmlFor="lp-password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="lp-password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginFormData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className={`w-full p-[10px_40px_10px_14px] border-[1.5px] rounded-[12px] text-[13.5px] text-[#111] bg-white/60 backdrop-blur-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${loginErrors.password
                        ? "border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]"
                        : "border-white/80"
                        }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-gray-400 p-1 hover:text-[#c1a378] transition-colors"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-[#e05555] mt-1">{loginErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between my-2 mb-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-[14px] h-[14px] accent-[#c1a378] cursor-pointer"
                    />
                    <span className="text-[12.5px] text-black font-medium">Remember me</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[12.5px] font-bold text-[#1A3A5C] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-[11px] bg-gradient-to-br from-[#D06718] to-[#D06718] text-white border-none rounded-[12px] text-[14px] font-bold tracking-[0.03em] cursor-pointer relative overflow-hidden transition-all duration-200 shadow-[0_8px_20px_rgba(26,58,92,0.30)] disabled:opacity-60 cursor-pointer"
                >
                  {loginLoading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}

            {/* OTP LOGIN FORM */}
            {authMode === "otp" && (
              <div className="space-y-3">
                {otpStep === "input_email" ? (
                  <form onSubmit={handleSendLoginOtp} noValidate className="space-y-3">
                    <div>
                      <label
                        className="block text-[11px] font-bold text-[#1A3A5C] tracking-[0.08em] uppercase mb-1.5"
                        htmlFor="lp-otp-email"
                      >
                        Email or Username
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="lp-otp-email"
                          type="text"
                          value={otpEmail}
                          onChange={(e) => {
                            setOtpEmail(e.target.value);
                            if (loginErrors.otpEmail)
                              setLoginErrors((prev) => ({ ...prev, otpEmail: "" }));
                          }}
                          placeholder="Enter registered email or username"
                          className={`w-full pl-10 pr-4 py-2.5 border-[1.5px] rounded-[12px] text-[13.5px] text-[#111] bg-white/60 backdrop-blur-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${loginErrors.otpEmail ? "border-[#e05555]" : "border-white/80"
                            }`}
                        />
                      </div>
                      {loginErrors.otpEmail && (
                        <p className="text-xs text-[#e05555] mt-1">{loginErrors.otpEmail}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-[11px] flex items-center justify-center gap-2 bg-[#D06718]  text-white border-none rounded-[12px] text-[14px] font-bold tracking-[0.03em] cursor-pointer transition-all duration-200 shadow-[0_8px_20px_rgba(26,58,92,0.25)] disabled:opacity-60 cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{otpLoading ? "Sending Code..." : "SEND OTP"}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginOtp} noValidate className="space-y-3">
                    <div className="p-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl text-xs text-[#1A3A5C] flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <CheckCircle2 className="h-4 w-4 text-[#1A3A5C] shrink-0" />
                        <span className="truncate">
                          Code sent to <strong>{otpEmail}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("input_email");
                          setOtpCode("");
                        }}
                        className="text-[11px] font-bold text-[#c1a378] hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-bold text-[#1A3A5C] tracking-[0.08em] uppercase mb-1.5"
                        htmlFor="lp-otp-code"
                      >
                        6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="lp-otp-code"
                          type="text"
                          maxLength={6}
                          autoFocus
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value.replace(/\D/g, ""));
                            if (loginErrors.otpCode)
                              setLoginErrors((prev) => ({ ...prev, otpCode: "" }));
                          }}
                          placeholder="• • • • • •"
                          className={`w-full pl-10 pr-4 py-2.5 border-[1.5px] rounded-[12px] text-center tracking-[0.3em] font-mono font-bold text-[18px] text-[#111] bg-white/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-[#c1a378] focus:bg-white ${loginErrors.otpCode ? "border-[#e05555]" : "border-white/80"
                            }`}
                        />
                      </div>
                      {loginErrors.otpCode && (
                        <p className="text-xs text-[#e05555] mt-1">{loginErrors.otpCode}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading || otpCode.length < 6}
                      className="w-full py-[11px] flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#22497a] text-white border-none rounded-[12px] text-[14px] font-bold tracking-[0.03em] cursor-pointer transition-all duration-200 shadow-[0_8px_20px_rgba(26,58,92,0.25)] disabled:opacity-60 cursor-pointer"
                    >
                      <span>{otpLoading ? "Verifying..." : "Verify & Log In →"}</span>
                    </button>

                    <div className="text-center pt-1">
                      {otpCountdown > 0 ? (
                        <span className="text-xs text-gray-400">
                          Resend code in <strong className="text-gray-600">{otpCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={otpLoading}
                          className="text-xs font-bold text-[#c1a378] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" /> Resend Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Google Sign-In Button */}
            {googleActive && (
              <div className="mt-3">
                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-white/60"></div>
                  <span className="flex-shrink mx-3 text-black text-[10.5px] font-semibold uppercase tracking-wider">
                    or continue with
                  </span>
                  <div className="flex-grow border-t border-white/60"></div>
                </div>
                <div
                  ref={googleLoginBtnRef}
                  id="google-login-btn"
                  className="w-full flex justify-center min-h-[40px] mt-1"
                />
              </div>
            )}

            {/* Mobile View Toggle Button */}
            <div className="mt-4 text-center text-[13px] text-gray-600 md:hidden">
              <span>New here?</span>
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className="font-bold text-[#1A3A5C] hover:underline ml-1.5 cursor-pointer"
              >
                Create Free Account
              </button>
            </div>

            <div className="flex items-center gap-2.5 my-3 mb-1">
              <div className="flex-1 h-px bg-white/60" />
              <span className="text-[11px] text-black whitespace-nowrap tracking-[0.04em]">
                secure platform
              </span>
              <div className="flex-1 h-px bg-white/60" />
            </div>

            <div className="flex justify-center mt-1">
              <Link
                to="/"
                className="text-[12.5px] text-[#1A3A5C] no-underline inline-flex items-center gap-1 hover:text-[#555] transition-colors group font-bold"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Back to website
              </Link>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 2. RIGHT FORM PANEL: SIGN UP / REGISTER FORM (Sliding Panel)         */}
          {/* ==================================================================== */}
          <div
            className={`w-full md:w-1/2 h-full flex flex-col justify-center px-6 py-6 sm:px-8 sm:py-6 md:px-10 z-20 transition-all duration-700 ease-in-out ${!isSignUp
              ? "md:-translate-x-full opacity-0 pointer-events-none hidden md:flex"
              : "md:translate-x-0 opacity-100"
              }`}
            style={{
              transition: "transform 700ms cubic-bezier(.65,0,.35,1), opacity 700ms cubic-bezier(.65,0,.35,1)"
            }}
          >
            {/* Header / Step Indicator */}
            <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1a3a5c]">
                  {registerStep === "form"
                    ? "Create Your Account"
                    : registerStep === "google_phone"
                      ? "Complete Your Profile"
                      : "Verify Email Address"}
                </h2>
                <p className="text-[11.5px] text-gray-900 mt-0.5">
                  {registerStep === "form"
                    ? "Fill your details below to get started"
                    : registerStep === "google_phone"
                      ? `Welcome ${regFormData.first_name}! Please enter your phone to finish setup.`
                      : `We sent a 6-digit code to ${regFormData.email}`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#e87722] tracking-wider">
                  {registerStep === "form" ? "Step 1 of 2" : "Step 2 of 2"}
                </span>
                <div className="flex gap-1 mt-1">
                  <div className="w-5 h-1.5 bg-[#e87722] rounded-full" />
                  <div
                    className={`w-5 h-1.5 rounded-full ${registerStep !== "form" ? "bg-[#e87722]" : "bg-gray-300"
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* STEP 1: REGISTRATION FORM */}
            {registerStep === "form" && (
              <form onSubmit={handleSendRegOTP} className="space-y-3">
                {/* Persona Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    I am a... <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const selected = regFormData.role === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setRegFormData((prev) => ({ ...prev, role: p.id }))}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer text-center ${selected
                            ? "bg-orange-50/80 border-[#e87722] text-[#1a3a5c] ring-2 ring-orange-500/20 shadow-sm font-bold"
                            : "border-white/60 hover:border-gray-300 text-gray-600 bg-white/40 backdrop-blur-sm"
                            }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 mb-0.5 ${selected ? "text-[#e87722]" : "text-black"
                              }`}
                          />
                          <span className="text-[10.5px] leading-tight truncate w-full">
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Title
                    </label>
                    <select
                      name="salutation"
                      value={regFormData.salutation}
                      onChange={handleRegChange}
                      className="w-full px-2 py-2 text-xs border border-white/60 rounded-xl bg-white/60 backdrop-blur-sm outline-none font-medium text-gray-800"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={regFormData.first_name}
                      onChange={handleRegChange}
                      placeholder="e.g. John"
                      className={`w-full px-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.first_name
                        ? "border-red-400 bg-red-50"
                        : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                        }`}
                    />
                    {regErrors.first_name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.first_name}</p>
                    )}
                  </div>

                  <div className="col-span-5">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={regFormData.last_name}
                      onChange={handleRegChange}
                      placeholder="e.g. Doe"
                      className={`w-full px-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.last_name
                        ? "border-red-400 bg-red-50"
                        : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                        }`}
                    />
                    {regErrors.last_name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={regFormData.email}
                        onChange={handleRegChange}
                        placeholder="you@example.com"
                        className={`w-full pl-9 pr-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.email
                          ? "border-red-400 bg-red-50"
                          : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                          }`}
                      />
                    </div>
                    {regErrors.email && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={"in"}
                      value={regFormData.phone}
                      onChange={(phone) => {
                        setRegFormData((prev) => ({ ...prev, phone }));
                        if (regErrors.phone) setRegErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      inputProps={{ name: "phone", required: true }}
                      inputStyle={{
                        width: "100%",
                        height: "34px",
                        fontSize: "12px",
                        borderRadius: "0.75rem",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(4px)",
                        borderColor: regErrors.phone ? "#f87171" : "rgba(255,255,255,0.8)",
                      }}
                      buttonStyle={{
                        borderRadius: "0.75rem 0 0 0.75rem",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(4px)",
                        borderColor: regErrors.phone ? "#f87171" : "rgba(255,255,255,0.8)",
                      }}
                    />
                    {regErrors.phone && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        name="password"
                        value={regFormData.password}
                        onChange={handleRegChange}
                        placeholder="Min. 6 chars"
                        className={`w-full pr-8 pl-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.password
                          ? "border-red-400 bg-red-50"
                          : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {regErrors.password && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={regFormData.confirmPassword}
                        onChange={handleRegChange}
                        placeholder="Re-enter password"
                        className={`w-full pr-8 pl-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.confirmPassword
                          ? "border-red-400 bg-red-50"
                          : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Broker Mandatory Company Name */}
                {regFormData.role === "broker" && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Company / Firm Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={regFormData.company_name}
                        onChange={handleRegChange}
                        placeholder="e.g. Apex Realty & Consultants"
                        className={`w-full pl-8 pr-2.5 py-2 text-xs border rounded-xl outline-none transition-all bg-white/60 backdrop-blur-sm ${regErrors.company_name
                          ? "border-red-400 bg-red-50"
                          : "border-white/80 focus:ring-2 focus:ring-[#e87722]"
                          }`}
                      />
                    </div>
                    {regErrors.company_name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{regErrors.company_name}</p>
                    )}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#e87722] hover:bg-[#d06718] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-md cursor-pointer mt-1 disabled:opacity-50"
                >
                  {regLoading ? "Sending Verification Code..." : "Send Verification OTP →"}
                </button>

                {/* Google Sign-In Option */}
                {googleActive && (
                  <div className="pt-1 space-y-2">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-white/60"></div>
                      <span className="flex-shrink mx-2 text-gray-900 text-[10px] font-semibold uppercase">
                        Or continue with
                      </span>
                      <div className="flex-grow border-t border-white/60"></div>
                    </div>
                    <div
                      ref={googleRegisterBtnRef}
                      id="google-register-btn"
                      className="w-full flex justify-center min-h-[38px]"
                    />
                  </div>
                )}
              </form>
            )}

            {/* STEP 3: GOOGLE PROFILE COMPLETION */}
            {registerStep === "google_phone" && (
              <form onSubmit={handleGooglePhoneSubmit} className="space-y-3 py-1">
                <div className="p-2.5 bg-blue-50/80 backdrop-blur-md border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Authenticated as <strong>{regFormData.email}</strong>. Complete phone & role to finalize.
                  </span>
                </div>

                {/* Persona */}
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                    I am a... <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const selected = regFormData.role === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setRegFormData((prev) => ({ ...prev, role: p.id }))}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer text-center ${selected
                            ? "bg-orange-50/80 border-[#e87722] text-[#1a3a5c] ring-2 ring-orange-500/20 font-bold"
                            : "border-white/60 text-gray-600 bg-white/40 backdrop-blur-sm"
                            }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 mb-0.5 ${selected ? "text-[#e87722]" : "text-gray-400"
                              }`}
                          />
                          <span className="text-[10.5px] truncate w-full">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Title
                    </label>
                    <select
                      name="salutation"
                      value={regFormData.salutation}
                      onChange={handleRegChange}
                      className="w-full px-2 py-2 text-xs border border-white/60 rounded-xl bg-white/60 backdrop-blur-sm outline-none"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={regFormData.first_name}
                      onChange={handleRegChange}
                      className="w-full px-2.5 py-2 text-xs border border-white/80 rounded-xl bg-white/60 backdrop-blur-sm outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={regFormData.last_name}
                      onChange={handleRegChange}
                      className="w-full px-2.5 py-2 text-xs border border-white/80 rounded-xl bg-white/60 backdrop-blur-sm outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={regFormData.phone}
                    onChange={(phone) => setRegFormData((prev) => ({ ...prev, phone }))}
                    inputProps={{ required: true, autoFocus: true }}
                    inputStyle={{
                      width: "100%",
                      height: "34px",
                      fontSize: "12px",
                      borderRadius: "0.75rem",
                      backgroundColor: "rgba(255,255,255,0.6)",
                      backdropFilter: "blur(4px)",
                      borderColor: "rgba(255,255,255,0.8)",
                    }}
                    buttonStyle={{
                      borderRadius: "0.75rem 0 0 0.75rem",
                      backgroundColor: "rgba(255,255,255,0.6)",
                      backdropFilter: "blur(4px)",
                      borderColor: "rgba(255,255,255,0.8)",
                    }}
                  />
                  {regErrors.phone && (
                    <p className="text-[10px] text-red-500 mt-0.5">{regErrors.phone}</p>
                  )}
                </div>

                {regFormData.role === "broker" && (
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-700 mb-1 uppercase">
                      Company / Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={regFormData.company_name}
                      onChange={handleRegChange}
                      placeholder="e.g. Apex Realty & Consultants"
                      className="w-full px-2.5 py-2 text-xs border border-white/80 rounded-xl bg-white/60 backdrop-blur-sm outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 px-4 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {regLoading ? "Completing Registration..." : "Complete Registration & Continue →"}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION SCREEN */}
            {registerStep === "otp" && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4 py-2">
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 bg-orange-50/80 backdrop-blur-md text-[#e87722] rounded-xl mx-auto flex items-center justify-center border border-orange-100">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Enter 6-Digit Code</h3>
                  <p className="text-[11.5px] text-gray-900 max-w-xs mx-auto">
                    We sent a security code to <strong className="text-gray-800">{regFormData.email}</strong>.
                  </p>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex justify-center gap-2">
                  {regOtpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleRegOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleRegOtpKeyDown(idx, e)}
                      className="w-9 h-11 text-center text-base font-extrabold border-2 border-white/80 rounded-xl focus:border-[#e87722] focus:ring-2 focus:ring-orange-500/20 outline-none text-[#1a3a5c] bg-white/60 backdrop-blur-sm"
                    />
                  ))}
                </div>

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-2.5 px-4 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {regLoading
                      ? "Verifying & Creating Account..."
                      : "Verify OTP & Complete Registration"}
                  </button>

                  <div className="flex items-center justify-between text-xs px-1">
                    <button
                      type="button"
                      onClick={() => setRegisterStep("form")}
                      className="text-gray-900 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      ← Change Details
                    </button>
                    <div>
                      {canResendReg ? (
                        <button
                          type="button"
                          onClick={handleResendRegOTP}
                          disabled={regLoading}
                          className="text-[#e87722] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Resend Code
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          Resend in <strong className="text-gray-600">{regTimer}s</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Mobile Switch Link */}
            <div className="mt-3 text-center text-[12px] text-gray-600 md:hidden">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className="font-bold text-[#e87722] hover:underline ml-1.5 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Terms notice */}
            <p className="text-[10px] text-gray-800 text-center mt-3">
              By continuing, you agree to {companyName}'s{" "}
              <Link to="/terms-conditions" className="underline hover:text-gray-900">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="underline hover:text-gray-900">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* ==================================================================== */}
          {/* 3. DESKTOP DUAL-MODE SLIDING OVERLAY PANEL - GLASSMORPHISM          */}
          {/* ==================================================================== */}
          <div
            style={{
              transform: isSignUp ? "translateX(0%)" : "translateX(100%)",
              transition: "transform 700ms cubic-bezier(.65,0,.35,1)",
              background: isSignUp
                ? "linear-gradient(155deg, rgba(12,37,64,0.38) 0%, rgba(26,58,92,0.42) 50%, rgba(10,27,45,0.48) 100%)"
                : "linear-gradient(155deg, rgba(26,58,92,0.40) 0%, rgba(18,44,74,0.45) 45%, rgba(10,27,45,0.50) 100%)",
            }}
            className="hidden md:flex absolute top-0 left-0 w-1/2 h-full z-30 flex-col items-center justify-center text-center px-8 text-white overflow-hidden shadow-2xl backdrop-blur-md border-l border-white/25"
          >
            {/* Background design elements */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-[#c1a378]/25 pointer-events-none" />
            <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(193,163,120,0.16),transparent_55%)] pointer-events-none" />

            {/* OVERLAY CONTENT: LOGIN VIEW OVERLAY (Appears on right side when in Login Mode) */}
            {!isSignUp && (
              <div className="relative z-10 flex flex-col items-center animate-fadeIn duration-500">
                <h2 className="font-premium-serif text-[25px] font-bold mb-2.5 tracking-[-0.01em]">
                  New Here?
                </h2>
                <p className="text-[13px] text-white/75 leading-[1.65] mb-6 max-w-[240px]">
                  Create your free account and unlock a curated collection of verified resale properties.
                </p>
                <button
                  type="button"
                  onClick={() => toggleMode(true)}
                  className="px-8 py-2.5 rounded-[14px] border-[1.5px] border-[#D06718] text-[#D06718] font-bold text-[13px] tracking-[0.06em] uppercase hover:bg-[#D06718] hover:text-[#0c2136] transition-all duration-250 cursor-pointer shadow-lg"
                >
                  SIGN UP
                </button>
              </div>
            )}

            {/* OVERLAY CONTENT: REGISTER VIEW OVERLAY (Appears on left side when in Register Mode) */}
            {isSignUp && (
              <div className="relative z-10 flex flex-col items-center text-left max-w-[340px] px-2 animate-fadeIn duration-500">
                <h2 className="font-premium-serif text-[24px] font-bold text-white leading-tight mb-2">
                  Join <span className="text-[#e87722]">{companyName}</span>
                </h2>

                <p className="text-[12px] text-blue-100/80 leading-relaxed mb-4">
                  Create an account to browse verified property resale listings, connect with top agents, schedule visits, and manage inquiries seamlessly.
                </p>

                {/* Persona Feature Previews */}
                <div className="space-y-2.5 w-full mb-5">
                  <div className="flex items-start gap-2.5 p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl">
                    <div className="p-1.5 bg-[#e87722]/20 rounded-xl text-orange-400 mt-0.5 shrink-0">
                      <Home className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11.5px] font-bold text-white">Exclusive Resale Inventory</h4>
                      <p className="text-[10.5px] text-blue-200/70 leading-tight">
                        Access direct-from-owner and verified broker listings before open portals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl">
                    <div className="p-1.5 bg-blue-500/20 rounded-xl text-blue-300 mt-0.5 shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11.5px] font-bold text-white">Direct Agent & Owner Follow-Up</h4>
                      <p className="text-[10.5px] text-blue-200/70 leading-tight">
                        Get instant WhatsApp and phone notifications for property matches tailored to your persona.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex flex-col items-center w-full text-center">
                  <p className="text-xs text-blue-200/80 mb-2">
                    Already have an account?
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="px-7 py-2 rounded-[14px] border-[1.5px] border-orange-400 text-orange-400 font-bold text-[12px] tracking-[0.06em] uppercase hover:bg-orange-400 hover:text-[#0c2136] transition-all duration-250 cursor-pointer shadow-md"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        .font-premium-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        @keyframes lp-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-lp-blink {
          animation: lp-blink 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .bg-radial-gradient {
          background-image: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
        }
      `}</style>
    </div>
  );
};

export default AuthPage;