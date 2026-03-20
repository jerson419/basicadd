import confetti from "canvas-confetti";
import { Frown, Heart, Smile, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AdditionAnimation } from "./AdditionAnimation";

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T,>(array: T[]) => {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
};

export default function App() {
	const [num1, setNum1] = useState(0);
	const [num2, setNum2] = useState(0);
	const [options, setOptions] = useState<number[]>([]);
	const [score, setScore] = useState(0);
	const [streak, setStreak] = useState(0);
	const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showAnimation, setShowAnimation] = useState(false);
	const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
	const confettiSoundRef = useRef<HTMLAudioElement | null>(null);
	const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		confettiSoundRef.current = new Audio("/confetti.mp3");
		wrongSoundRef.current = new Audio("/wrong.mp3");
	}, []);

	const generateQuestion = () => {
		const n1 = randomInt(1, 9);
		const n2 = randomInt(1, 10 - n1);
		const correct = n1 + n2;

		const wrongOptions = new Set<number>();
		while (wrongOptions.size < 3) {
			const wrong = randomInt(1, 10);
			if (wrong !== correct) {
				wrongOptions.add(wrong);
			}
		}

		setNum1(n1);
		setNum2(n2);
		setOptions(shuffleArray([correct, ...Array.from(wrongOptions)]));
		setFeedback(null);
		setIsAnimating(false);
		setShowAnimation(false);
		setShowCorrectAnswer(false);
	};

	useEffect(() => {
		generateQuestion();
	}, []);

	const handleAnswer = (answer: number) => {
		if (isAnimating) return;

		const correct = num1 + num2;
		setIsAnimating(true);
		setShowCorrectAnswer(true);
		if (answer === correct) {
			setFeedback("correct");
			setScore((s) => s + 10);
			setStreak((s) => s + 1);
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ["#FFC700", "#FF0000", "#2E3192", "#41BBC7"]
			});
			if (confettiSoundRef.current) {
				confettiSoundRef.current.currentTime = 0;
				confettiSoundRef.current.play();
			}
		} else {
			setFeedback("wrong");
			setStreak(0);
			if (wrongSoundRef.current) {
				wrongSoundRef.current.currentTime = 0;
				wrongSoundRef.current.play();
			}
		}

		setTimeout(() => {
			setShowAnimation(true);
			setFeedback(null);
		}, 1200);
	};

	if (num1 === 0) return null;

	return (
		<div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
			{/* Header */}
			<div className="absolute top-4 left-4 right-4 flex justify-between items-center max-w-4xl mx-auto w-full">
				<div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-sky-200">
					<Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
					<span className="text-xl font-bold text-sky-900">Score: {score}</span>
				</div>

				<AnimatePresence>
					{streak > 2 && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full shadow-sm border border-orange-200"
						>
							<Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
							<span className="text-xl font-bold text-orange-600">{streak} Streak!</span>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Game Board */}
			<div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 md:p-12 relative border-4 border-sky-200">
				{/* Equation */}
				<div className="flex justify-center items-center gap-2 md:gap-6 mb-12">
					<motion.div
						key={`n1-${num1}`}
						initial={{ y: -50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ type: "spring", bounce: 0.5 }}
						className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-pink-400 rounded-2xl flex items-center justify-center shadow-lg border-b-8 border-pink-500"
					>
						<span className="text-5xl sm:text-6xl md:text-8xl font-black text-white">{num1}</span>
					</motion.div>

					<div className="text-5xl sm:text-6xl md:text-8xl font-black text-sky-400">+</div>

					<motion.div
						key={`n2-${num2}`}
						initial={{ y: -50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
						className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-purple-400 rounded-2xl flex items-center justify-center shadow-lg border-b-8 border-purple-500"
					>
						<span className="text-5xl sm:text-6xl md:text-8xl font-black text-white">{num2}</span>
					</motion.div>

					<div className="text-5xl sm:text-6xl md:text-8xl font-black text-sky-400">=</div>

					<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner border-4 border-dashed border-gray-300 relative">
						<span data-ui="answer-box-question-mark" className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-300">
							?
						</span>

						{/* Feedback Overlay on the answer box */}
						<AnimatePresence>
							{showCorrectAnswer && (
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									className="absolute inset-0 bg-green-400 rounded-xl flex items-center justify-center shadow-lg border-b-8 border-green-500"
								>
									<span data-ui="answer-box" className="text-5xl sm:text-6xl md:text-8xl font-black text-white">
										{num1 + num2}
									</span>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Options or Animation */}
				<div className="min-h-[200px] flex flex-col justify-center">
					<AnimatePresence mode="wait">
						{!showAnimation ? (
							<motion.div
								key="options"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="grid grid-cols-2 gap-4 md:gap-6"
							>
								{options.map((opt, i) => (
									<motion.button
										key={`opt-${opt}-${i}`}
										whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => handleAnswer(opt)}
										disabled={isAnimating}
										data-ui="button-answer"
										className={`
                      h-20 md:h-28 rounded-2xl text-4xl md:text-5xl font-black text-white shadow-lg border-b-8 transition-colors
                      ${i === 0 ? "bg-blue-400 border-blue-500 hover:bg-blue-300" : ""}
                      ${i === 1 ? "bg-green-400 border-green-500 hover:bg-green-300" : ""}
                      ${i === 2 ? "bg-yellow-400 border-yellow-500 hover:bg-yellow-300" : ""}
                      ${i === 3 ? "bg-orange-400 border-orange-500 hover:bg-orange-300" : ""}
                    `}
									>
										{opt}
									</motion.button>
								))}
							</motion.div>
						) : (
							<div key="animation">
								<AdditionAnimation num1={num1} num2={num2} onComplete={generateQuestion} />
							</div>
						)}
					</AnimatePresence>
				</div>

				{/* Feedback Message */}
				<AnimatePresence>
					{feedback && (
						<motion.div
							initial={{ y: 50, opacity: 0, scale: 0.5 }}
							animate={{ y: 0, opacity: 1, scale: 1 }}
							exit={{ y: 20, opacity: 0, scale: 0.8 }}
							className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-xl border-4 flex items-center gap-3 whitespace-nowrap
                ${feedback === "correct" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}
              `}
						>
							{feedback === "correct" ? (
								<>
									<Smile className="w-8 h-8" />
									<span className="text-2xl font-bold">Awesome!</span>
								</>
							) : (
								<>
									<Frown className="w-8 h-8" />
									<span className="text-2xl font-bold">Try Again!</span>
								</>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
