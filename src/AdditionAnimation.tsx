import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function AdditionAnimation({ num1, num2, onComplete }: { num1: number; num2: number; onComplete: () => void }) {
	const [visibleCount, setVisibleCount] = useState(num1);
	const popRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		popRef.current = new Audio("/pop.mp3");
	}, []);

	useEffect(() => {
		if (visibleCount <= num1) return;
		if (popRef.current) {
			popRef.current.currentTime = 0;
			popRef.current.play();
		}
	}, [visibleCount]);

	useEffect(() => {
		let count = num1;
		const timeout = setTimeout(() => {
			const interval = setInterval(() => {
				if (count < num1 + num2) {
					count++;
					setVisibleCount(count);
				} else {
					clearInterval(interval);
				}
			}, 800);
			return () => clearInterval(interval);
		}, 500);

		return () => clearTimeout(timeout);
	}, [num1, num2]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="flex flex-col items-center mt-4 w-full overflow-x-auto pb-4"
		>
			<div className="flex gap-2 sm:gap-3 md:gap-4">
				{Array.from({ length: 10 }).map((_, i) => {
					const isNum1 = i < num1;
					const isVisible = i < visibleCount;

					return (
						<div key={`col-${i}`} className="flex flex-col items-center gap-3 md:gap-4">
							<div className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
								{isVisible && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", bounce: 0.6 }}
										className={`w-full h-full rounded-full shadow-md ${isNum1 ? "bg-pink-400" : "bg-purple-400"}`}
									/>
								)}
							</div>
							<div
								className={`text-center font-black text-lg sm:text-2xl md:text-3xl transition-colors duration-300 ${isVisible ? "text-gray-700" : "text-gray-300"}`}
							>
								{i + 1}
							</div>
						</div>
					);
				})}
			</div>

			<motion.button
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				onClick={onComplete}
				className="mt-8 px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-full font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
			>
				Continue
				<ArrowRight className="w-6 h-6" />
			</motion.button>
		</motion.div>
	);
}
