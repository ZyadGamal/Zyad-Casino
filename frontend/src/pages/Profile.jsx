import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>جارٍ تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          الملف الشخصي
        </h1>

        <div className="space-y-4">
          <div>
            <strong>اسم المستخدم:</strong> {user.username}
          </div>
          <div>
            <strong>البريد الإلكتروني / رقم الهاتف:</strong> {user.identifier}
          </div>
          <div>
            <strong>معرف المستخدم:</strong> {user.id}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
