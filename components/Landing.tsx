import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Play, Calendar, Share2, Sparkles, 
  Shield, Puzzle, ArrowRight, Clock, Video,
  Instagram, Youtube, Facebook, Check,
  Workflow, Wand2, Globe, Plug
} from 'lucide-react';
import TiktokIcon from './icons/TiktokIcon';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-12 sm:px-16 lg:px-24 xl:px-32 overflow-hidden bg-white">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-orange-50 opacity-30"></div>
        
        {/* Motion lines animation */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path d="M0,200 Q300,150 600,200 T1200,200" stroke="currentColor" strokeWidth="2" className="text-[#f65e05] animate-pulse" />
            <path d="M0,400 Q400,350 800,400 T1200,400" stroke="currentColor" strokeWidth="2" className="text-[#f65e05] animate-pulse" style={{animationDelay: '0.5s'}} />
            <path d="M0,600 Q500,550 1000,600 T1200,600" stroke="currentColor" strokeWidth="2" className="text-[#f65e05] animate-pulse" style={{animationDelay: '1s'}} />
          </svg>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-5 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-[2.4rem] md:text-[3rem] lg:text-[3.0rem] font-bold text-gray-900 mb-6 leading-tight">
                Automate Your Visuals
                <span className="block text-[#f65e05]">
                  While You Sleeping
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Design automated video flows with AI models like Sora 2 and Veo 3.
                Schedule, generate, and post to all your platforms — hands-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#f65e05] text-white font-semibold rounded-full hover:bg-orange-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Free
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border-2 border-gray-300 hover:border-[#f65e05] hover:shadow-lg transition-all duration-300 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right: Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <img
                  src="/Hero_Illustration.png"
                  alt="Hero Illustration"
                  className="w-full h-auto max-w-[14rem] lg:max-w-[17rem] xl:max-w-[20rem] mx-auto rounded-2xl shadow-2xl object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Turn your ideas into automated video workflows
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set a Trigger</h3>
              <p className="text-gray-600">
                Choose your posting time or condition. Set it once and let automation handle the rest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Video</h3>
              <p className="text-gray-600">
                Upload or use AI (Sora 2, Veo 3) to create stunning videos from your prompts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Publish Everywhere</h3>
              <p className="text-gray-600">
                Auto-post to TikTok, Instagram, YouTube, and more — all at once.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-[#f65e05] text-white font-semibold rounded-full hover:bg-orange-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-lg"
            >
              Build Your First Flow
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Video Generation Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Create stunning videos with AI — in seconds.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Choose your model (Sora 2, Sora 2 Pro, Veo 3) and describe your idea.
                Our system generates high-quality videos tailored to your prompt.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Multiple AI models to choose from</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">High-quality video output in seconds</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Customizable prompts and styles</p>
                </div>
              </div>
            </div>
            
            {/* Before/After Visual */}
            <div className="relative">
              <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-2">Input:</p>
                    <p className="text-gray-900 font-medium">"A cat dancing in space"</p>
                  </div>
                  <div className="bg-[#f65e05] rounded-lg p-4 flex items-center justify-center text-white">
                    <Video className="w-12 h-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling & Automation Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-orange-50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Calendar Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">January 2025</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-sm font-semibold text-gray-600">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((day) => (
                      <div key={day} className="aspect-square flex items-center justify-center text-gray-400">{day}</div>
                    ))}
                    <div className="aspect-square flex items-center justify-center bg-[#f65e05] text-white rounded-lg font-bold">
                      6 AM
                    </div>
                    {[8, 9, 10, 11, 12, 13].map((day) => (
                      <div key={day} className="aspect-square flex items-center justify-center">
                        {day === 6 && <div className="w-1 h-1 bg-[#f65e05] rounded-full"></div>}
                        <span className={day === 6 ? 'text-[#f65e05] font-bold' : 'text-gray-900'}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[#f65e05]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">6 AM - Auto-post scheduled</span>
                  </div>
                  <div className="h-1 bg-[#f65e05] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Schedule once. Relax forever.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Set your posting time — like 6 AM every day.
                Our automation engine handles video creation and posting while you sleep.
              </p>
              <div className="flex items-start space-x-3 mb-4">
                <Zap className="w-6 h-6 text-[#f65e05] flex-shrink-0 mt-1" />
                <p className="text-gray-700">Automated scheduling with timezone support</p>
              </div>
              <div className="flex items-start space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-[#f65e05] flex-shrink-0 mt-1" />
                <p className="text-gray-700">Recurring posts and custom schedules</p>
              </div>
              <div className="flex items-start space-x-3">
                <Wand2 className="w-6 h-6 text-[#f65e05] flex-shrink-0 mt-1" />
                <p className="text-gray-700">Smart content optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Platform Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Post everywhere — automatically.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              TikTok, YouTube Shorts, Instagram, Facebook — all managed from one dashboard.
              Connect your accounts once and automate your content delivery.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {/* TikTok */}
            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-[#f65e05]">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow bg-white">
                <img src="/assets/platforms/tiktok_icon.png" alt="TikTok" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">TikTok</h3>
            </div>

            {/* YouTube */}
            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-[#f65e05]">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow bg-white">
                <img src="/assets/platforms/youtube_icon.png" alt="YouTube" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">YouTube</h3>
            </div>

            {/* Instagram */}
            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-[#f65e05]">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow bg-white">
                <img src="/assets/platforms/instagram_icon.png" alt="Instagram" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Instagram</h3>
            </div>

            {/* Facebook */}
            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-[#f65e05]">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow bg-white">
                <img src="/assets/platforms/facebook_icon.png" alt="Facebook" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Facebook</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Us
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Drag-and-Drop Builder</h3>
              <p className="text-gray-600">Design flows visually, no code required.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI + Automation</h3>
              <p className="text-gray-600">Generate and schedule videos effortlessly.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Platform</h3>
              <p className="text-gray-600">Post everywhere at once.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Integrations</h3>
              <p className="text-gray-600">Your tokens and data are encrypted.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Puzzle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Extensible</h3>
              <p className="text-gray-600">Add more models and platforms as you grow.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#f65e05] rounded-xl flex items-center justify-center mb-6">
                <Plug className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">API Access</h3>
              <p className="text-gray-600">Integrate with your existing tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Creators love how easy it is to automate their videos.
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "This replaced three different tools — I just drag, connect, and relax!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#f65e05] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alex M.</p>
                  <p className="text-sm text-gray-600">Content Creator</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "My TikTok page now posts daily, even when I'm asleep. Game changer!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#f65e05] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah K.</p>
                  <p className="text-sm text-gray-600">Social Media Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The AI video generation quality is incredible. Saved me hours every week!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#f65e05] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mike R.</p>
                  <p className="text-sm text-gray-600">Video Producer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Simple, Transparent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">3 flows</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">5 video generations/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">Basic templates</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Start for Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#f65e05] p-8 rounded-2xl shadow-2xl border-2 border-orange-600 transform scale-105">
              <div className="bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-white/80">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-1" />
                  <span className="text-white">Unlimited flows</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-1" />
                  <span className="text-white">Priority AI models</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-1" />
                  <span className="text-white">Unlimited generations</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-1" />
                  <span className="text-white">Advanced scheduling</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 bg-white text-[#f65e05] font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">Multi-user support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">API access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-12 sm:px-16 lg:px-24 xl:px-32 bg-[#f65e05] text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Let AI handle your social media routine.
          </h2>
          <p className="text-lg text-white/90">
            Join thousands of creators automating their content workflow today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-12 sm:px-16 lg:px-24 xl:px-32">
        <div className="container mx-auto max-w-3xl">
          <div className="grid md:grid-cols-3 gap-1 mb-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              Built for creators who value time more than timelines.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              © 2025 TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

