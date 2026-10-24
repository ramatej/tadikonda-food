import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
        The page you are looking for does not exist or has been moved. Let's get you back to the delicious food!
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-md transition-all active:scale-95"
        >
          <span>Return to Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
