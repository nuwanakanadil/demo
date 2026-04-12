import { Link, useLocation } from "react-router-dom";
import { Globe, Camera, MessageCircle } from "lucide-react";

export function Footer() {
  const location = useLocation();
  const hiddenPaths = [
    "/admin",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  // Hide footer on admin and auth-related routes.
  if (hiddenPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="mt-0 border-t border-white/70 bg-[radial-gradient(circle_at_10%_0%,rgba(66,145,114,0.16),transparent_42%),linear-gradient(145deg,#f7f8fb,#eef1f6)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              ReWear
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Swap items easily and securely with real people.
              A smarter way to exchange what you don’t need anymore.
            </p>

            <div className="mt-4 flex gap-3">
              <a
                href="https://www.facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/70 bg-white/70 hover:bg-white transition"
              >
                <Globe className="h-4 w-4 text-gray-700" />
              </a>
              <a
                href="https://www.instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/70 bg-white/70 hover:bg-white transition"
              >
                <Camera className="h-4 w-4 text-gray-700" />
              </a>
              <a
                href="https://x.com"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/70 bg-white/70 hover:bg-white transition"
              >
                <MessageCircle className="h-4 w-4 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-brand-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/items" className="hover:text-brand-600 transition">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/post-item" className="hover:text-brand-600 transition">
                  Post an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Account
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/profile" className="hover:text-brand-600 transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-brand-600 transition">
                  Messages
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Legal
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/privacy" className="hover:text-brand-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-600 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-neutral-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ReWear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}