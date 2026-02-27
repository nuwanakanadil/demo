import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-200 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              ReWear
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Swap items easily and securely with real people.
              A smarter way to exchange what you don’t need anymore.
            </p>

            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-brand-50 transition"
              >
                <span className="text-sm font-bold text-gray-700">F</span>
              </a>
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-brand-50 transition"
              >
                <span className="text-sm font-bold text-gray-700">I</span>
              </a>
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-brand-50 transition"
              >
                <span className="text-sm font-bold text-gray-700">T</span>
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