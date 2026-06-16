import { Link } from "react-router-dom";
import { Droplets, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Droplets className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-500 mb-8">Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to HemoLink
        </Link>
      </div>
    </div>
  );
}
