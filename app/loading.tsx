import React from "react";

const Loading = () => {
	return (
		<div className="grid place-content-center absolute inset-0 bg-white min-h-screen">
			<div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-[spin_0.5s_linear_infinite]" />
		</div>
	);
};

export default Loading;
