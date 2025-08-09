import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(identifier, password);
    if (!success) {
      setError("بيانات الدخول غير صحيحة، حاول مجددًا.");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md p-8 rounded">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          تسجيل الدخول إلى Z-Casino 🎰
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="البريد الإلكتروني / رقم الهاتف / اسم المستخدم"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
          >
            دخول
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ليس لديك حساب؟{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            سجّل الآن
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
