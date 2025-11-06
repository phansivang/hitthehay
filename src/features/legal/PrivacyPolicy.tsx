import React from 'react';
import { Link } from 'react-router-dom';
import { Workflow, ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Hit The Hay ("we", "us", "our", or "Service") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our automated video generation and scheduling platform.
              </p>
              <p className="text-gray-700">
                By using our Service, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Account Information</h3>
              <p className="text-gray-700 mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Email address</li>
                <li>Username and display name</li>
                <li>Password (encrypted and hashed)</li>
                <li>Profile information (if provided)</li>
                <li>Authentication information from third-party providers (Google, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Content and Workflow Data</h3>
              <p className="text-gray-700 mb-4">
                We collect and store:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Workflow configurations and node settings</li>
                <li>Uploaded video files and media content</li>
                <li>AI-generated video content</li>
                <li>Prompt configurations and text inputs</li>
                <li>Platform account connections and credentials (encrypted)</li>
                <li>Scheduling preferences and posting configurations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Usage and Analytics Data</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Workflow execution history and run logs</li>
                <li>Task creation and completion data</li>
                <li>Posting history and platform interactions</li>
                <li>Subscription usage metrics (tasks created, posts made)</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Service access logs and error reports</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Payment Information</h3>
              <p className="text-gray-700 mb-4">
                When you subscribe, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Billing address and contact information</li>
                <li>Payment method details (processed securely by payment providers)</li>
                <li>Invoice and payment history</li>
                <li>Subscription plan and billing cycle information</li>
              </ul>
              <p className="text-gray-700">
                We do not store full credit card numbers. Payment processing is handled by secure third-party payment providers (Stripe, PayPal, etc.).
              </p>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process your subscription and payment transactions</li>
                <li>Execute workflows and generate videos using AI models</li>
                <li>Post content to social media platforms as configured</li>
                <li>Enforce usage limits based on your subscription plan</li>
                <li>Send service-related communications (notifications, updates, alerts)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns to improve functionality</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
                <li>Send marketing communications (with your consent, which you can opt out of)</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We share information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Payment processing (Stripe, PayPal, etc.)</li>
                <li>Cloud storage and hosting services</li>
                <li>AI model providers (for video generation)</li>
                <li>Social media platform APIs (for posting content)</li>
                <li>Analytics and monitoring services</li>
                <li>Email delivery services</li>
              </ul>
              <p className="text-gray-700">
                These providers are contractually obligated to protect your information and use it only for specified purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Social Media Platforms</h3>
              <p className="text-gray-700 mb-4">
                When you configure workflows to post to platforms (TikTok, YouTube, Instagram, Facebook), we share:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Generated video content</li>
                <li>Captions, titles, descriptions, and hashtags as configured</li>
                <li>Platform account credentials (encrypted and securely stored)</li>
              </ul>
              <p className="text-gray-700">
                Your use of these platforms is also subject to their respective privacy policies.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose information if required by law or in response to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Valid legal requests (subpoenas, court orders, etc.)</li>
                <li>Government investigations</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Prevention of fraud or security threats</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
              <p className="text-gray-700">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                <li>Secure password hashing and authentication</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure storage of platform credentials and API keys</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide the Service and maintain your account</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="text-gray-700">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law. Some information may remain in backups for a limited period.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, contact us at privacy@hitthehay.com. We will respond within 30 days.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve the Service</li>
                <li>Provide personalized experiences</li>
              </ul>
              <p className="text-gray-700">
                You can control cookies through your browser settings. However, disabling cookies may limit some Service functionality.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will delete such information.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.
              </p>
              <p className="text-gray-700">
                We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links and Services</h2>
              <p className="text-gray-700 mb-4">
                Our Service integrates with third-party platforms and services. We are not responsible for the privacy practices of:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Social media platforms (TikTok, YouTube, Instagram, Facebook)</li>
                <li>Payment processors</li>
                <li>AI model providers</li>
                <li>Other third-party services</li>
              </ul>
              <p className="text-gray-700">
                We encourage you to review the privacy policies of these third parties.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. Material changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Email notification to your registered email address</li>
                <li>Prominent notice on the Service</li>
                <li>Updated "Last updated" date at the top of this policy</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of the Service after changes become effective constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Privacy Officer:</strong><br />
                  Email: privacy@hitthehay.com<br />
                  <strong>General Support:</strong><br />
                  Email: support@hitthehay.com
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="border-t border-gray-200 pt-8 mt-8">
              <p className="text-gray-700">
                By using Hit The Hay, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
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

export default PrivacyPolicy;

