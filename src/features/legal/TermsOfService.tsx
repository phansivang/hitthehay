import React from 'react';
import { Link } from 'react-router-dom';
import { Workflow, ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Workflow className="w-8 h-8 text-[#f65e05]" />
              <span className="font-bold text-xl text-gray-800">Hit The Hay</span>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#f65e05] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Hit The Hay ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-700">
                Hit The Hay is an automated video generation and scheduling platform that allows users to create workflows, generate videos using AI models (including Sora 2, Sora 2 Pro, and Veo 3), and schedule posts to social media platforms including TikTok, YouTube, Instagram, and Facebook.
              </p>
            </section>

            {/* Account Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration and Eligibility</h2>
              <p className="text-gray-700 mb-4">
                To use our Service, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            {/* Subscription Plans */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription Plans and Usage Limits</h2>
              <p className="text-gray-700 mb-4">
                We offer subscription plans with the following features and limits:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic Plan</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Maximum of 1 active workflow/task</li>
                  <li>Up to 5 posts per month to social media platforms</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pro Plan</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Maximum of 10 active workflows/tasks</li>
                  <li>Up to 40 posts per month to social media platforms</li>
                </ul>
              </div>

              <p className="text-gray-700 mb-4">
                Usage limits reset at the beginning of each billing cycle. You may not exceed your plan's limits. Attempts to circumvent usage limits may result in account suspension or termination.
              </p>
              <p className="text-gray-700">
                We reserve the right to modify subscription plans, features, and pricing with 30 days' notice. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment and Billing</h2>
              <p className="text-gray-700 mb-4">
                Subscription fees are billed in advance on a monthly or annual basis, as selected during signup. By subscribing, you authorize us to charge your payment method for all fees associated with your subscription.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>All fees are non-refundable except as required by law or as explicitly stated in our refund policy</li>
                <li>If payment fails, we may suspend or terminate your account</li>
                <li>You are responsible for any taxes applicable to your subscription</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period</li>
              </ul>
            </section>

            {/* User Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of all content you upload, create, or generate using our Service ("User Content"). By using our Service, you grant us a limited, non-exclusive, worldwide license to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Store, process, and transmit your content to provide the Service</li>
                <li>Use your content to generate videos using AI models</li>
                <li>Post your content to social media platforms as configured in your workflows</li>
                <li>Back up and maintain your content</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You own or have the right to use all User Content</li>
                <li>Your content does not infringe on any third-party rights</li>
                <li>Your content complies with all applicable laws and platform terms of service</li>
                <li>Your content does not contain illegal, harmful, or offensive material</li>
              </ul>
              <p className="text-gray-700">
                We reserve the right to remove any content that violates these Terms or applicable laws without notice.
              </p>
            </section>

            {/* AI-Generated Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. AI-Generated Content</h2>
              <p className="text-gray-700 mb-4">
                Our Service uses AI models (including Sora 2, Sora 2 Pro, and Veo 3) to generate videos. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>AI-generated content may not always meet your expectations</li>
                <li>We do not guarantee the quality, accuracy, or suitability of AI-generated content</li>
                <li>You are responsible for reviewing and approving all AI-generated content before posting</li>
                <li>AI models may produce content that requires editing or modification</li>
                <li>We are not liable for any issues arising from AI-generated content</li>
              </ul>
            </section>

            {/* Platform Integration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Social Media Platform Integration</h2>
              <p className="text-gray-700 mb-4">
                Our Service allows you to post content to third-party platforms including TikTok, YouTube, Instagram, and Facebook. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You must comply with each platform's terms of service and community guidelines</li>
                <li>We are not responsible for content removal, account suspension, or other actions taken by platform providers</li>
                <li>Platform APIs may change, affecting our ability to post content</li>
                <li>We do not guarantee successful posting to any platform</li>
                <li>You are responsible for maintaining valid platform account credentials</li>
              </ul>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post spam, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Attempt to reverse engineer or hack the Service</li>
                <li>Use automated systems to abuse or overload the Service</li>
                <li>Share account credentials or allow unauthorized access</li>
                <li>Circumvent usage limits or subscription restrictions</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability and Modifications</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted or error-free service. We may:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Perform scheduled maintenance with advance notice when possible</li>
                <li>Modify, suspend, or discontinue features or the entire Service</li>
                <li>Update the Service to improve functionality or security</li>
                <li>Limit access during periods of high demand or technical issues</li>
              </ul>
              <p className="text-gray-700">
                We are not liable for any loss or damage resulting from service interruptions or modifications.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by canceling your subscription. We may suspend or terminate your account immediately if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You violate these Terms</li>
                <li>You fail to pay subscription fees</li>
                <li>You engage in fraudulent or illegal activity</li>
                <li>We determine your use poses a risk to the Service or other users</li>
              </ul>
              <p className="text-gray-700">
                Upon termination, your access to the Service will cease, and we may delete your account and content. We are not obligated to retain your data after termination.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HIT THE HAY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from AI-generated content</li>
                <li>Issues with third-party platform integrations</li>
                <li>Service interruptions or technical failures</li>
                <li>Unauthorized access to your account</li>
              </ul>
              <p className="text-gray-700">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties regarding the accuracy or reliability of AI-generated content</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding third-party platform integrations</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Service. Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
              </p>
              <p className="text-gray-700">
                If you do not agree to the modified Terms, you must stop using the Service and cancel your subscription.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration or in courts of competent jurisdiction.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@hitthehay.com<br />
                  <strong>Support:</strong> support@hitthehay.com
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="border-t border-gray-200 pt-8 mt-8">
              <p className="text-gray-700">
                By using Hit The Hay, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Hit The Hay. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-600 hover:text-[#f65e05] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-[#f65e05] text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;

