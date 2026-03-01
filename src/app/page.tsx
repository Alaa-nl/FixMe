import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  const categories = [
    { name: "Bikes & Scooters", emoji: "🚲", slug: "bikes-scooters" },
    { name: "Phones & Tablets", emoji: "📱", slug: "phones-tablets" },
    { name: "Laptops & Computers", emoji: "💻", slug: "laptops-computers" },
    { name: "Kitchen Appliances", emoji: "🍳", slug: "kitchen-appliances" },
    { name: "Laundry Appliances", emoji: "👕", slug: "laundry-appliances" },
    { name: "Home Electronics", emoji: "📺", slug: "home-electronics" },
    { name: "Furniture", emoji: "🪑", slug: "furniture" },
    { name: "Clothing & Shoes", emoji: "👗", slug: "clothing-shoes" },
    { name: "Plumbing", emoji: "🚿", slug: "plumbing" },
    { name: "Electrical", emoji: "💡", slug: "electrical" },
    { name: "Musical Instruments", emoji: "🎸", slug: "musical-instruments" },
    { name: "Garden & Outdoor", emoji: "🌿", slug: "garden-outdoor" },
    { name: "Cameras & Optics", emoji: "📷", slug: "cameras-optics" },
    { name: "Toys & Games", emoji: "🧸", slug: "toys-games" },
    { name: "Other", emoji: "📦", slug: "other" },
  ];

  const recentRequests = [
    {
      id: 1,
      title: "Broken bike chain",
      category: "Bikes & Scooters",
      location: "Amsterdam West",
      time: "2 hours ago",
      offers: 3,
    },
    {
      id: 2,
      title: "iPhone screen cracked",
      category: "Phones & Tablets",
      location: "Rotterdam",
      time: "5 hours ago",
      offers: 7,
    },
    {
      id: 3,
      title: "Washing machine won't drain",
      category: "Laundry Appliances",
      location: "Utrecht Centrum",
      time: "1 day ago",
      offers: 5,
    },
    {
      id: 4,
      title: "Laptop keyboard not working",
      category: "Laptops & Computers",
      location: "Den Haag",
      time: "2 days ago",
      offers: 2,
    },
  ];

  const steps = [
    {
      number: 1,
      emoji: "📸",
      title: "Post your broken item",
      description:
        "Take a photo and describe what's broken. Our AI will help diagnose the problem.",
    },
    {
      number: 2,
      emoji: "💰",
      title: "Get offers from fixers",
      description:
        "Local repair people will send you offers with their price and availability.",
    },
    {
      number: 3,
      emoji: "✅",
      title: "Get it fixed",
      description:
        "Pick the best offer, get your item repaired, and pay safely through the app.",
    },
  ];

  const stats = [
    { value: "1,000+", label: "Repairs completed" },
    { value: "500+", label: "Trusted fixers" },
    { value: "4.8 ⭐", label: "Average rating" },
    { value: "€50,000+", label: "Saved from landfill" },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                Don't throw it away. Fix it.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Find trusted local repair people in your area. Bikes, phones,
                appliances — anything fixed, fast and affordable.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/post">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Post a repair request
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    I'm a fixer
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Free to post
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Pay only when fixed
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Trusted fixers
                </span>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-md h-80 bg-orange-50 rounded-2xl flex items-center justify-center border-2 border-orange-100">
                <span className="text-9xl">🔧</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            How does FixMe work?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                {/* Step Number */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4 text-center">{step.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            What needs fixing?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </div>
                  <p className="text-sm md:text-base font-medium text-gray-700 group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Repair Requests Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Recent repair requests
            </h2>
            <Link
              href="/browse"
              className="text-primary font-medium hover:underline flex items-center gap-2"
            >
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gray-200 flex items-center justify-center text-4xl">
                  🔧
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                    {request.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 bg-orange-100 text-primary text-xs font-medium rounded">
                      {request.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>📍 {request.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>{request.time}</span>
                    <span className="font-medium text-primary">
                      {request.offers} offers
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Fixers */}
      <section className="bg-secondary py-16 md:py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Are you handy? Start earning with FixMe.
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join hundreds of local repair people. Set your own hours, pick your own jobs.
          </p>

          <Link href="/register">
            <Button variant="primary" size="lg">
              Sign up as a fixer
            </Button>
          </Link>

          <p className="mt-6 text-blue-200">
            💶 Average fixer earns €500/month
          </p>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
