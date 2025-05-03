export const Map = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Visit our Accra location at Dworwulu</h2>
        <div className="w-full flex justify-center">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5615.358217149454!2d-0.19501521255223064!3d5.617432143540867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9bd74af9cc8d%3A0x7f0e394810bc6468!2sPayless4tech!5e0!3m2!1sen!2sus!4v1736113769756!5m2!1sen!2sus"
            width="100%"
            height="450"
            className="rounded-lg shadow-lg max-w-4xl"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};