import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

export interface MagicLinkEmailProps {
	link: string;
}

export const MagicLinkEmail = ({ link }: MagicLinkEmailProps) => {
	const previewText = "Your magic sign-in link for Payless4Tech";

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${process.env.NEXT_PUBLIC_APP_URL}/app.png`}
							width="120"
							height="120"
							alt="Payless4Tech Logo"
							style={logo}
						/>
					</Section>

					<Heading style={heading}>Welcome to Payless4Tech!</Heading>

					<Text style={paragraph}>
						You requested a magic link to sign in to your Payless4Tech account.
						Click the button below to securely sign in:
					</Text>

					<Section style={buttonContainer}>
						<Link href={link} style={button}>
							Sign In to Payless4Tech
						</Link>
					</Section>

					<Text style={paragraph}>
						This link will expire in 15 minutes for security reasons. If you
						didn't request this sign-in link, you can safely ignore this email.
					</Text>

					<Text style={paragraph}>
						If you're having trouble clicking the button, copy and paste this
						link into your browser:
					</Text>

					<Text style={linkText}>{link}</Text>

					<Hr style={hr} />

					<Text style={footer}>
						Payless4Tech Team
						<br />
						Your trusted tech partner
						<br />
						<a href="mailto:support@payless4tech.com" style={footerLink}>
							support@payless4tech.com
						</a>
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

// Styles
const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0",
	width: "100%",
	maxWidth: "600px",
};

const logoContainer = {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	marginBottom: "30px",
};

const logo = {
	borderRadius: "12px",
};

const heading = {
	fontSize: "24px",
	fontWeight: "600",
	color: "#1a1a1a",
	textAlign: "center" as const,
	marginBottom: "20px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "1.5",
	color: "#4a4a4a",
	marginBottom: "16px",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "30px 0",
};

const button = {
	backgroundColor: "#FF8904",
	color: "#ffffff",
	padding: "12px 24px",
	textDecoration: "none",
	borderRadius: "8px",
	fontWeight: "600",
	fontSize: "16px",
	display: "inline-block",
};

const linkText = {
	fontSize: "14px",
	color: "#666666",
	backgroundColor: "#f5f5f5",
	padding: "10px",
	borderRadius: "4px",
	wordBreak: "break-all" as const,
	marginBottom: "16px",
};

const hr = {
	border: "none",
	borderTop: "1px solid #e0e0e0",
	margin: "30px 0",
};

const footer = {
	fontSize: "14px",
	color: "#666666",
	textAlign: "center" as const,
	lineHeight: "1.4",
};

const footerLink = {
	color: "#FF8904",
	textDecoration: "underline",
};

export default MagicLinkEmail;
