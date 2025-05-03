import { Header } from "@/components/Header";

const WarrantyPolicy = () => {
	return (
		<>
			<Header />
			<main className="container max-w-4xl mx-auto py-8 animate-fadeIn">
				<h1 className="text-4xl font-bold mb-12 text-center text-primary">
					Peace of Mind
				</h1>

				<div className="space-y-12">
					{/* Return Policy Section */}
					<section className="rounded-lg p-8 shadow-md">
						<h2 className="text-3xl text-black font-bold mb-8">
							Return Policy
						</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									30-Day Warranty Period
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Payless4Tech provides a 30-day warranty from the date of
									purchase for our computers and laptops. This warranty covers
									hardware malfunctions determined to have existed prior to the
									sale date of the asset.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Warranty Coverage
								</h3>
								<p className="text-gray-600 leading-relaxed">
									The warranty covers defects affecting the functionality of the
									electronic gadgets. The determination of whether the issue
									existed prior to the sale date will be made by our qualified
									technicians.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Return Process
								</h3>
								<ul className="space-y-3 text-gray-600">
									<li className="flex items-start">
										<span className="font-semibold mr-2">•</span>
										<div>
											<span className="font-semibold">Repair:</span>{" "}
											Payless4Tech will repair the defective electronic gadget
											at no additional cost to the customer.
										</div>
									</li>
									<li className="flex items-start">
										<span className="font-semibold mr-2">•</span>
										<div>
											<span className="font-semibold">Replace:</span> If the
											electronic gadget cannot be repaired, Payless4Tech will
											provide a replacement unit of equal or similar
											specifications.
										</div>
									</li>
									<li className="flex items-start">
										<span className="font-semibold mr-2">•</span>
										<div>
											<span className="font-semibold">Refund:</span> If neither
											repair nor replacement is feasible, the customer will be
											eligible for a refund of the purchase price. Note that a
											refund is only eligible after the first two options have
											been exhausted.
										</div>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Exclusions
								</h3>
								<p className="text-gray-600 leading-relaxed">
									The warranty does not cover issues arising from buyer's
									remorse, or damages resulting from accidental or intentional
									misuse, abuse, or neglect.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Buyer's Remorse
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Payless4Tech does not offer refunds for buyer's remorse. We
									encourage customers to carefully consider their purchase
									before buying and seek advice from our knowledgeable staff if
									needed.
								</p>
							</div>
						</div>
					</section>

					{/* Warranty Terms Section */}
					<section className="bg-white rounded-lg p-8 shadow-md">
						<h2 className="text-3xl font-bold mb-8 text-secondary">
							Warranty Terms
						</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Warranty Duration
								</h3>
								<p className="text-gray-600 leading-relaxed">
									The warranty provided by Payless4Tech is valid for 30 days
									from the original date of purchase.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Battery Exclusion for Used Items
								</h3>
								<p className="text-gray-600 leading-relaxed">
									The warranty does not cover batteries for items marked as
									used. Battery performance may naturally decline over time, and
									replacements can be purchased separately if needed.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Warranty Extension
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Customers can purchase an extended warranty for GHC 500 at the
									time of purchase, which will extend the warranty period to 1
									year. Additionally, customers may purchase extended warranties
									as needed by contacting Payless4Tech's customer service team
									for pricing and details.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Warranty Claim Process
								</h3>
								<p className="text-gray-600 leading-relaxed">
									To make a warranty claim, customers must contact
									Payless4Tech's customer service within the warranty period (30
									days or extended duration). Customers will need to present the
									original purchase receipt and describe the hardware
									malfunction.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Return Procedure
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Upon validating the warranty claim, Payless4Tech will provide
									instructions on how to return the product. Customers are
									responsible for properly packaging and shipping the item back
									to us.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Condition of Return
								</h3>
								<p className="text-gray-600 leading-relaxed">
									The electronic gadget must be returned in its original
									condition, free from physical damage, liquid damage, or
									unauthorized modifications. Failure to do so may void the
									warranty.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Assessment and Resolution
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Once we receive the returned product, our technicians will
									assess the reported issue. If the defect is covered by the
									warranty and not caused by any excluded factors, we will
									proceed with the appropriate action (repair, replace, or
									refund) within a reasonable timeframe.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-semibold mb-3 text-gray-800">
									Non-Warranty Service
								</h3>
								<p className="text-gray-600 leading-relaxed">
									If the reported issue is not covered by the warranty or falls
									under the exclusion criteria, Payless4Tech will provide a
									quote for potential repair services, subject to the customer's
									approval before proceeding.
								</p>
							</div>
						</div>
					</section>
				</div>
			</main>
		</>
	);
};

export default WarrantyPolicy;
