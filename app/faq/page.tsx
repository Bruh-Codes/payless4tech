import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const FAQ = () => {
	const faqs = [
		{
			question: "What warranty do your products come with?",
			answer:
				"All our laptops come with a 30-day replacement guarantee. For full details, please visit our Warranty Policy page.",
		},
		{
			question: "How long does shipping take?",
			answer:
				"Local delivery in Accra typically takes 1-2 business days. For other regions in Ghana, it's usually 2-5 business days.",
		},
		{
			question: "Can I pre-order products from the USA?",
			answer:
				"Yes! We offer a pre-order service from the USA. Products typically arrive within 21 days. You can use our pre-order form on the website.",
		},
		{
			question: "Do you offer installation services?",
			answer:
				"Yes, we offer basic software installation and setup for all purchased laptops at no additional cost.",
		},
		{
			question: "What payment methods do you accept?",
			answer:
				"We accept credit/debit cards, MTN Mobile Money, bank transfers, and cash for in-store purchases.",
		},
	];

	return (
		<>
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow container mx-auto px-4 py-12">
					<h1 className="text-3xl font-bold mb-8">
						Frequently Asked Questions
					</h1>

					<div className="max-w-3xl mx-auto">
						<Accordion type="single" collapsible className="w-full">
							{faqs.map((faq, index) => (
								<AccordionItem key={index} value={`item-${index}`}>
									<AccordionTrigger className="text-lg font-medium">
										{faq.question}
									</AccordionTrigger>
									<AccordionContent className="text-gray-600">
										{faq.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</main>
			</div>
			<Footer /> <WhatsAppButton />
		</>
	);
};

export default FAQ;
