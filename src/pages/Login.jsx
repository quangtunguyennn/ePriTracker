import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Thêm state để quản lý lỗi và trạng thái tải
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ nếu có
    setIsLoading(true);

    try {
      // Thay đổi URL dưới đây cho khớp với API ASP.NET Core của bạn
      const response = await axios.post('https://localhost:44338/api/auth/login', {
        email: email,
        password: password
      });

      // Giả sử API trả về object chứa token: { token: "eyJhbG..." }
      const token = response.data.token; 
      const userRole = response.data.userRole;
      // Lưu token vào localStorage để dùng cho các request sau
      localStorage.setItem('token', token);

      // const decodedToken = jwtDecode(token)
      // const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;

      // Chuyển hướng người dùng vào trang trong (ví dụ: /admin hoặc /)
      if(userRole === 'Admin'){
        navigate('/admin')
      }else if(userRole === 'User'){
        navigate('/')
      }

    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      // Xử lý lỗi trả về từ server (mã 400, 401, v.v.)
      if (err.response && err.response.data) {
        // Thay đổi 'err.response.data.message' tùy thuộc vào cấu trúc lỗi ASP.NET trả về
        setError(err.response.data.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">ePriTracker</h2>
          <p className="text-gray-500 mt-2">Đăng nhập vào hệ thống theo dõi giá</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài khoản / Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="admin@epritracker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-blue-200 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}