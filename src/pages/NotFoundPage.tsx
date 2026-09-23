import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-error-warning-line text-teal-600 text-4xl"></i>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Sahifa topilmadi</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <i className="ri-home-line mr-2"></i>Bosh sahifaga
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-8 py-3.5 rounded-full text-sm font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors"
          >
            <i className="ri-chat-3-line mr-2"></i>AI dan so'rash
          </Link>
        </div>
      </div>
    </div>
  );
}
