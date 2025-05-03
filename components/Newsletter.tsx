import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Newsletter = () => {
  return (
    <section className="py-12 bg-primary/5 fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Our Trusted Community
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to receive exclusive deals, quality assurance updates, and expert tips on getting the most value from your tech purchases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder="Enter your email"
              className="sm:w-72"
            />
            <Button className="bg-secondary hover:bg-secondary/90">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
};