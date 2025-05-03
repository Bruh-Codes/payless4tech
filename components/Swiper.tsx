"use client";

import { A11y, Scrollbar, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";

import Image, { StaticImageData } from "next/image";

const SlideShow = ({
	slides,
}: {
	slides: { img: StaticImageData; alt: string }[];
}) => {
	return (
		<Swiper
			modules={[Autoplay, Scrollbar, A11y]}
			a11y={{
				enabled: true,
				nextSlideMessage: "Next slide",
				prevSlideMessage: "Previous slide",
			}}
			autoplay={{
				delay: 3000,
				disableOnInteraction: false,
			}}
			spaceBetween={0}
			loop
			slidesPerView={1}
			navigation
			scrollbar={{ draggable: true }}
			className="w-full h-full"
			breakpoints={{
				320: { slidesPerView: 1 },
			}}
		>
			{slides.map((slide) => {
				return (
					<SwiperSlide className="w-full">
						<Image
							priority
							src={slide.img}
							alt={slide.alt}
							className="w-full h-full object-cover brightness-[0.4]"
						/>
					</SwiperSlide>
				);
			})}
			{/* ... */}
		</Swiper>
	);
};

export default SlideShow;
