'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('home_page_sections', [
      {
        hps_content: `<section class="hero-section-bg relative overflow-hidden min-h-[80vh] flex items-center " style="background-image: url(""); background-size: cover; background-position: center; background-repeat: no-repeat;">
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-8">
        <span class="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold mb-6">
          Community posts first
        </span>
        <h1 class="text-5xl lg:text-7xl font-bold text-white leading-tight">
          Connect, Schedule, and Stay
          <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Informed
          </span>
        </h1>
        <p class="text-xl text-gray-100 leading-relaxed drop-shadow-md">
Your all-in-one platform for appointment scheduling and community engagement. Book appointments effortlessly and stay connected with our vibrant community.
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="/posts" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            Explore Posts
          </a>
          <a href="/posts" class="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/30 transition-all">
            Join the Conversation
          </a>
        </div>
        <div class="flex items-center gap-6 pt-4">
          <div class="flex -space-x-3">
            <div class="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">B</div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">C</div>
            <div class="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">D</div>
          </div>
          <p class="text-sm text-gray-200"><span class="font-semibold text-white">10,000+</span> users trust us</p>
        </div>
      </div>
      <div class="relative">
        <div class="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">T</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">TheAnxietyNurse</h4>
                <p class="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              🎉 Exciting news! Our new community feature is now live. Connect with fellow users and stay updated!
            </p>
            <div class="flex items-center gap-6 text-gray-500 text-sm">
              <span class="flex items-center gap-1">❤️ 234 likes</span>
              <span class="flex items-center gap-1">💬 45 comments</span>
            </div>
          </div>
          <div class="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div class="flex items-center gap-2 text-emerald-600">
              <span>💬</span>
              <span class="font-semibold text-sm">Trending Posts</span>
            </div>
          </div>
          <div class="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div class="flex items-center gap-2 text-teal-600">
              <span>👥</span>
              <span class="font-semibold text-sm">10K+ Community</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">10K+</div>
        <p class="text-gray-600 font-medium">Active Users</p>
      </div>
      <div class="text-center">
        <div class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">50K+</div>
        <p class="text-gray-600 font-medium">Posts Shared</p>
      </div>
      <div class="text-center">
        <div class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">1K+</div>
        <p class="text-gray-600 font-medium">Community Posts</p>
      </div>
      <div class="text-center">
        <div class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">99%</div>
        <p class="text-gray-600 font-medium">Satisfaction</p>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">Powerful features designed to make your experience seamless and enjoyable</p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
        <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-6">💬</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Community Posts</h3>
        <p class="text-gray-600 leading-relaxed">Discover real stories, announcements, and helpful updates from members</p>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
        <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-6">📅</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Smart Scheduling</h3>
        <p class="text-gray-600 leading-relaxed">Keep your appointments in sync while staying connected to the community</p>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
        <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-6">⏰</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
        <p class="text-gray-600 leading-relaxed">Get instant notifications about your appointments and posts</p>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
        <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-6">👥</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Connect with Others</h3>
        <p class="text-gray-600 leading-relaxed">Join a community of users and share your experiences</p>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-4xl font-bold text-gray-900 mb-6">
          Why Choose <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">TheAnxietyNurse?</span>
        </h2>
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
          We're more than just a community platform. We're a content-driven ecosystem that connects people, shares stories, and keeps everyone informed with the latest posts and announcements.
        </p>
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">🛡️</div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">Secure & Reliable</h4>
              <p class="text-gray-600">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">⚡</div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">Lightning Fast</h4>
              <p class="text-gray-600">Optimized performance for the best user experience</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">🌍</div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">Always Available</h4>
              <p class="text-gray-600">24/7 access from anywhere in the world</p>
            </div>
          </div>
        </div>
      </div>
      <div class="relative">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
          <h3 class="text-2xl font-bold mb-4">Join Our Community Today</h3>
          <p class="mb-6 text-emerald-100">
            Be part of a growing community of users who trust TheAnxietyNurse for sharing stories, engaging in posts, and staying connected.
          </p>
          <div class="flex items-center gap-4 mb-6">
            <div class="flex -space-x-3">
              <div class="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">B</div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">C</div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">D</div>
              <div class="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">E</div>
            </div>
            <span class="text-sm">+10,000 members</span>
          </div>
          <a href="/posts" class="w-full py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
            Explore Posts
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
      <p class="text-xl text-gray-600">Don't just take our word for it</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div class="flex items-center gap-1 mb-4">⭐⭐⭐⭐⭐</div>
        <p class="text-gray-700 mb-6 leading-relaxed italic">"The easiest way to stay updated with community posts. The feed keeps me informed about everything!"</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
          <div>
            <h4 class="font-semibold text-gray-900">Sarah Johnson</h4>
            <p class="text-sm text-gray-500">Regular Client</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div class="flex items-center gap-1 mb-4">⭐⭐⭐⭐⭐</div>
        <p class="text-gray-700 mb-6 leading-relaxed italic">"CMO Connect has boosted our community awareness. Our members love the engagement features."</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">M</div>
          <div>
            <h4 class="font-semibold text-gray-900">Michael Chen</h4>
            <p class="text-sm text-gray-500">Business Owner</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div class="flex items-center gap-1 mb-4">⭐⭐⭐⭐⭐</div>
        <p class="text-gray-700 mb-6 leading-relaxed italic">"Fantastic platform! The combination of community posts and collaboration features is exactly what we needed."</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">E</div>
          <div>
            <h4 class="font-semibold text-gray-900">Emily Davis</h4>
            <p class="text-sm text-gray-500">Healthcare Professional</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold text-white mb-6">Ready to Join the Conversation?</h2>
    <p class="text-xl text-emerald-100 mb-8">
      Jump into the feed, share what matters, and discover new posts from our community every day.
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="/posts" class="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2">
        Explore Posts
      </a>
      <a href="/posts" class="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all">
        Start Sharing
      </a>
    </div>
  </div>
</section>`,
        hps_status: 'active',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('home_page_sections', null, {})
  },
}
