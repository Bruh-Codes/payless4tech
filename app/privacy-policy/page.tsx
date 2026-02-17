import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";

const Page = () => {
	return (
		<div>
			<Navbar />
			<div className="max-w-2xl mx-auto px-5 py-8 space-y-5">
				<div>
					<h1 className="text-3xl font-bold">Privacy Policy</h1>
					<p className="py-3 italic">Effective Date: July 29, 2025</p>
					<p>
						At Payless4Tech, we value your privacy and are committed to
						protecting your personal information. This Privacy Policy outlines
						how PaylessmessageBot (“the App”), operated by Payless4Tech (“we,”
						“our,” or “us”), collects, uses, and shares information when you
						interact with our services through platforms like Facebook and
						Instagram.
					</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">1. Information We Collect</h2>
					<p>
						We may collect the following information when you interact with our
						chatbot or services:
					</p>
					<ul className="list-disc list-inside">
						<li>
							Your public Facebook or Instagram profile information (e.g., name,
							profile picture)
						</li>
						<li>Messages and responses you send via the chatbot</li>
						<li>
							Any information you voluntarily share (e.g., inquiries,
							preferences)
						</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xl font-semibold">
						2. How We Use Your Information
					</h2>
					<p>We use the information we collect to:</p>
					<ul className="list-disc list-inside">
						<li>Respond to your messages and inquiries</li>
						<li>Personalize your experience</li>
						<li>Improve our products and services</li>
						<li>Communicate promotions, offers, or updates if you opt-in</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xl font-semibold">3. Data Sharing</h2>
					<p>We do not sell or rent your personal data. We may share data:</p>
					<ul className="list-disc list-inside">
						<li>
							With service providers who support our operations (e.g., hosting,
							analytics)
						</li>
						<li>
							To comply with legal obligations, regulations, or valid legal
							processes
						</li>
						<li>To protect our rights or users’ safety</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xl font-semibold">4. Data Retention</h2>
					<p>
						We retain your data only for as long as needed to fulfill the
						purposes outlined in this policy unless a longer retention period is
						required by law.
					</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">5. Your Rights and Choices</h2>
					<p>You can:</p>
					<ul className="list-disc list-inside">
						<li>Access or delete your data by contacting us</li>
						<li>Opt-out of promotional messages</li>
						<li>
							Revoke permissions from Facebook or Instagram in your account
							settings
						</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xl font-semibold">6. Security</h2>
					<p>
						We implement technical and organizational measures to protect your
						information from unauthorized access, use, or disclosure.
					</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">7. Third-Party Platforms</h2>
					<p>
						This app runs on Meta platforms (Facebook and Instagram) and is
						subject to their data policies. Please refer to{" "}
						<a
							href="https://www.facebook.com/policy.php"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline"
						>
							Meta’s Data Policy
						</a>{" "}
						for more information.
					</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
					<p>
						We may update this Privacy Policy occasionally. Any changes will be
						posted on this page with an updated effective date.
					</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">9. Contact Us</h2>
					<p>If you have questions or concerns, please contact us at:</p>
					<ul className="list-disc list-inside">
						<li>Company: Payless4Tech</li>
						<li>Email: info@payless4tech.com</li>
						<li>
							Website:{" "}
							<a
								href="https://payless4tech.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								https://payless4tech.com
							</a>
						</li>
					</ul>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Page;
