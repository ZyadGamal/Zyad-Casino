import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email_or_phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    const success = await register({
      username: formData.username,
      identifier: formData.email_or_phone,
      password: formData.password,
    });

    if (!success) {
      setError("فشل في إنشاء الحساب. جرب بريدًا أو رقمًا مختلفًا.");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md p-8 rounded">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          إنشاء حساب جديد في Z-Casino 🧾
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="اسم المستخدم"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <input
            type="text"
            name="email_or_phone"
            placeholder="البريد الإلكتروني أو رقم الهاتف"
            value={formData.email_or_phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded transition"
          >
            تسجيل حساب جديد
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          لديك حساب بالفعل؟{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            تسجيل الدخول
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
