import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currency, setCurrency] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    country: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then((res) => res.json())
      .then((data) => setCountries(data));
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCountryChange = (e) => {
    const selectedCountry = countries.find(
      (c) => c.name.common === e.target.value
    );
    const currencyCode = selectedCountry ? Object.keys(selectedCountry.currencies)[0] : "";
    setCurrency(currencyCode);
    setFormData({ ...formData, country: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: "Passwords don't match!", type: "error" });
        return;
      }
      try {
        const res = await axios.post("http://localhost:5000/api/auth/signup", {
          company_name: formData.companyName,
          country: formData.country,
          currency: currency,
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        setMessage({ text: "Account created successfully! Redirecting...", type: "success" });
        setTimeout(() => navigate("/admindashboard"), 1500);
      } catch (err) {
        setMessage({ text: err.response?.data?.message || "Signup failed", type: "error" });
      }
    } else {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        const role = res.data.user.role;
        if (role === "ADMIN") navigate("/admindashboard");
        if (role === "MANAGER") navigate("/managerdashboard");
        if (role === "FINANCE") navigate("/financedashboard");
        if (role === "DIRECTOR") navigate("/directordashboard");
        if (role === "EMPLOYEE") navigate("/employeedashboard");
      } catch (err) {
        setMessage({ text: err.response?.data?.message || "Login failed", type: "error" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>

          {message.text && (
            <div
              className={`px-4 py-3 text-sm rounded-lg font-medium border mb-6 ${
                message.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Your Company Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((c, i) => (
                      <option key={i} value={c.name.common}>
                        {c.name.common}
                      </option>
                    ))}
                  </select>
                  {currency && (
                    <p className="text-sm text-gray-500 mt-1">
                      Currency: {currency}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;