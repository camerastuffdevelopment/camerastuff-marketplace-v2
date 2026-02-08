import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
            GearHub
          </Link>
          <div className="flex gap-4">
            <Link href="/listings" className="text-gray-700 hover:text-primary-600">
              Browse Gear
            </Link>
            <Link href="/listings/create" className="text-gray-700 hover:text-primary-600 font-semibold">
              Sell Gear
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-primary-600">
              Messages
            </Link>
            <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
              Login
            </Link>
            <Link href="/auth/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Buy & Sell Used Photography Gear
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with photographers across South Africa. Find quality used equipment or sell your gear with confidence.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/listings"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Browse Listings
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50"
          >
            Start Selling
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why GearHub?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-primary-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Buyer & seller protection with secure escrow payments via Tradesafe.
              </p>
            </div>

            <div className="p-6 bg-primary-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Messaging</h3>
              <p className="text-gray-600">
                Connect directly with buyers and sellers. Ask questions and negotiate prices.
              </p>
            </div>

            <div className="p-6 bg-primary-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Community</h3>
              <p className="text-gray-600">
                Find great deals from photographers near you across South Africa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your next gear?</h2>
          <p className="text-primary-100 mb-8">
            Join thousands of photographers buying and selling on GearHub.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">GearHub</h4>
              <p className="text-sm">Buy and sell used photography equipment in South Africa.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings">All Listings</Link></li>
                <li><Link href="/categories">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/signup">Sign Up</Link></li>
                <li><Link href="/auth/login">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-sm text-center">
            <p>&copy; 2026 GearHub. Powered by CameraStuff. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
