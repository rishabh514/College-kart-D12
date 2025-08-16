import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faInfoCircle, 
    faUsers, 
    faShieldAlt, 
    faLock, 
    faEnvelope, 
    faHandshake,
    faFileContract
} from '@fortawesome/free-solid-svg-icons';

const InfoAndLegal = () => {
    
    const CardHeader = ({ icon, title }) => (
        <h2 className="text-2xl font-bold mb-4 flex items-center text-white gap-3">
            <FontAwesomeIcon icon={icon} className="text-indigo-400 w-6" />
            {title}
        </h2>
    );

    return (
        <div id="info-legal" className="content-section">
            <div className="mx-auto max-w-4xl p-8 md:p-12 space-y-12">

                {/* --- Main Page Header --- */}
                <header className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold title-gradient mb-3">Info & Legal</h1>
                    <p className="text-lg text-zinc-400">
                        Everything you need to know about our community and policies.
                    </p>
                </header>

                {/* --- About Us Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faInfoCircle} title="About CampusThrift" />
                    <p className="text-zinc-400 leading-relaxed">
                        <strong className="text-white">CampusThrift</strong> is a peer-to-peer marketplace designed exclusively for college students. Our platform aims to make it easy and convenient for students to connect, trade, and save money while building a supportive community. We are committed to providing a safe and user-friendly environment for all our members.
                    </p>
                    <p className="text-zinc-400 leading-relaxed mt-4">
                        CampusThrift is a product of RenderLabs, and RenderLabs holds full ownership and rights to this product as its parent organization.
                    </p>
                    <p className="text-sm text-zinc-500 italic mt-4">
                        Please note: CampusThrift is an independent service and is not affiliated with or endorsed by any college or university.
                    </p>
                    </section>
                {/* --- Our Team Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faUsers} title="Our Team" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                        <div className="bg-zinc-900/70 p-6 rounded-lg text-center border border-zinc-700">
                            <h3 className="text-lg font-semibold text-white">Rishabh Raj Gupta</h3>
                            <p className="text-zinc-500 text-sm">Founder</p>
                        </div>
                        <div className="bg-zinc-900/70 p-6 rounded-lg text-center border border-zinc-700">
                            <h3 className="text-lg font-semibold text-white">Lakshay Bansal</h3>
                            <p className="text-zinc-500 text-sm">Co-Founder</p>
                        </div>
                    </div>
                </section>
                
                {/* --- User Responsibilities Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faFileContract} title="User Responsibilities" />
                    <div className="space-y-4 text-zinc-400">
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong className="text-white">Liability:</strong> Users are solely responsible for their use of this app, including any transactions and content uploaded.</li>
                            <li><strong className="text-white">Compliance:</strong> Ensure all listings and communications comply with applicable laws and ethical standards.</li>
                            <li><strong className="text-white">Prohibited Content:</strong> You must not upload or share explicit, illegal, offensive, or inappropriate content. Violations may lead to removal of content and a permanent ban.</li>
                            <li><strong className="text-white">Safe Trading:</strong> Always practice safe trading by verifying item conditions and meeting in safe, public places.</li>
                        </ul>
                    </div>
                </section>

                {/* --- Community Guidelines Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faShieldAlt} title="Safe Practices & Community Guidelines" />
                    <div className="space-y-4 text-zinc-400">
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong className="text-white">Respect:</strong> Respect the privacy and safety of others.</li>
                            <li><strong className="text-white">Reporting:</strong> Report any harmful or guideline-violating listings or users with a clear description.</li>
                            <li><strong className="text-white">Integrity:</strong> Avoid fraudulent, deceptive, or harmful behavior.</li>
                            <li><strong className="text-white">Communication:</strong> Maintain polite and professional communication on the platform.</li>
                        </ul>
                    </div>
                </section>

                {/* --- Intellectual Property Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faFileContract} title="Intellectual Property" />
                    <div className="space-y-4 text-zinc-400">
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong className="text-white">Content Rights:</strong> Users must only upload content for which they hold the rights or necessary permissions.</li>
                            <li><strong className="text-white">Infringement:</strong> CampusThrift respects intellectual property rights and will remove infringing content upon valid notice.</li>
                        </ul>
                    </div>
                </section>

                {/* --- Transactions and Payments Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faHandshake} title="Transactions & Payments" />
                    <div className="space-y-4 text-zinc-400">
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong className="text-white">Platform Role:</strong> CampusThrift acts solely as a platform to connect buyers and sellers.</li>
                            <li><strong className="text-white">No Payment Facilitation:</strong> We do not facilitate payments or guarantee transactions.</li>
                            <li><strong className="text-white">User Risk:</strong> All financial exchanges occur directly between users and are at their own risk.</li>
                        </ul>
                    </div>
                </section>
                
                {/* --- Disclaimer and Liability Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faShieldAlt} title="Disclaimer & Limitation of Liability" />
                    <div className="space-y-4 text-zinc-400">
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li><strong className="text-white">"As Is" Basis:</strong> CampusThrift provides the platform "as is" without warranties of any kind.</li>
                            <li><strong className="text-white">No Guarantees:</strong> We do not control or guarantee the quality, safety, or legality of listings or transactions.</li>
                            <li><strong className="text-white">User Responsibility:</strong> Users engage with the platform and other users at their own risk.</li>
                            <li><strong className="text-white">Content Moderation:</strong> We reserve the right to remove content or suspend accounts that violate policies or harm the community.</li>
                        </ul>
                    </div>
                </section>

                {/* --- Privacy Policy Section --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faLock} title="Privacy Policy" />
                    <div className="space-y-4 text-zinc-400">
                        <p className="leading-relaxed">
                            At CampusThrift, your privacy and security are important to us. This Privacy Policy explains how we collect, use, and protect your personal information.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-4">Information We Collect</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>Profile Information: Name, email, and details provided during registration.</li>
                            <li>Listings Data: Item descriptions, images, and prices.</li>
                            <li>Google Authentication Data: Basic profile info and authentication tokens (when logging in via Google).</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4">How We Use Your Information</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>To provide and operate CampusThrift’s services.</li>
                            <li>To facilitate secure login and account management.</li>
                            <li>To improve safety, content moderation, and personalization.</li>
                            <li>To communicate updates, account info, and service-related notices.</li>
                            <li>To detect and prevent fraud or abuse.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4">Data Sharing & Security</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>We do not sell, rent, or share your data with third parties for marketing purposes.</li>
                            <li>Data may be shared only with trusted service providers under strict confidentiality agreements.</li>
                            <li>Security measures are implemented to prevent unauthorized access, loss, or misuse.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4">Your Rights</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>You can access, update, or delete your personal data by contacting us.</li>
                            <li>You have the right to withdraw consent or restrict certain data uses where applicable.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4">Cookies & Tracking</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>CampusThrift may use cookies or similar tools for functionality and analytics.</li>
                            <li>You can control cookie settings via your browser preferences.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4">Changes to This Policy</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>We may update this policy as practices or legal requirements evolve. Please review this page regularly for updates.</li>
                        </ul>
                    </div>
                </section>

                {/* --- Contact & Support --- */}
                <section className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
                    <CardHeader icon={faEnvelope} title="Contact Us" />
                    <p className="text-zinc-400">
                        For any questions, support, or privacy concerns, please feel free to reach out.
                    </p>
                    <div className="flex items-center text-white font-medium mt-6">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-indigo-400" />
                        <a href="mailto:campusthrift.help@gmail.com" className="text-lg hover:underline transition-colors">
                            campusthrift.help@gmail.com
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InfoAndLegal;