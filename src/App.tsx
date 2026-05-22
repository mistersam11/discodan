import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AnswerKey = "name" | "date" | "time";
type Scene = AnswerKey | "code" | "story" | "finale";

type Answers = Record<AnswerKey, string>;

type Question = {
  id: AnswerKey;
  prompt: string;
  placeholder: string;
  inputMode?: "text" | "numeric";
};

const questions: Question[] = [
  {
    id: "name",
    prompt: "What is your name?",
    placeholder: "type your name",
  },
  {
    id: "date",
    prompt: "What is today's date?",
    placeholder: "type today's date",
  },
  {
    id: "time",
    prompt: "What time is it?",
    placeholder: "type the time",
  },
];

const storyLines = [
  "50 years ago, there was a contest...",
  "One hundred competitors... and only one came out on top",
  "His name was...",
];

const sceneOrder: Scene[] = ["name", "date", "time", "code", "story", "finale"];

function App() {
  const [scene, setScene] = useState<Scene>("name");
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    date: "",
    time: "",
  });

  const currentQuestion = questions.find((question) => question.id === scene);

  const advance = () => {
    const nextScene = sceneOrder[sceneOrder.indexOf(scene) + 1];
    if (nextScene) {
      setScene(nextScene);
    }
  };

  const saveAnswer = (key: AnswerKey, value: string) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
    advance();
  };

  return (
    <main className="experience-shell">
      <div className="screen-vignette" />
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionScene
            key={currentQuestion.id}
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onSubmit={saveAnswer}
          />
        )}

        {scene === "code" && (
          <CodeScene key="code" answers={answers} onComplete={advance} />
        )}

        {scene === "story" && <StoryScene key="story" onComplete={advance} />}

        {scene === "finale" && <FinaleScene key="finale" />}
      </AnimatePresence>
    </main>
  );
}

function QuestionScene({
  question,
  value,
  onSubmit,
}: {
  question: Question;
  value: string;
  onSubmit: (key: AnswerKey, value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 350);
    return () => window.clearTimeout(focusTimer);
  }, [question.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = draft.trim();
    if (nextValue.length > 0) {
      onSubmit(question.id, nextValue);
    }
  };

  return (
    <motion.section
      className="question-scene"
      initial={{ opacity: 0, filter: "blur(16px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(18px)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <form className="question-form" onSubmit={handleSubmit}>
        <motion.label
          htmlFor={`question-${question.id}`}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {question.prompt}
        </motion.label>
        <motion.input
          ref={inputRef}
          id={`question-${question.id}`}
          aria-label={question.prompt}
          autoComplete="off"
          inputMode={question.inputMode}
          placeholder={question.placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </form>
    </motion.section>
  );
}

function CodeScene({
  answers,
  onComplete,
}: {
  answers: Answers;
  onComplete: () => void;
}) {
  const fullText = useMemo(() => {
    const encodedName = answers.name || "unknown visitor";
    const encodedDate = answers.date || "unknown date";
    const encodedTime = answers.time || "unknown time";

    return [
      "const archive = await openVault('contest-1976');",
      `archive.identify("${encodedName}");`,
      `archive.pin("${encodedDate}", "${encodedTime}");`,
      "const field = calibrateSpectralPaint({ hue: 'unstable' });",
      "const finalists = archive.query({ competitors: 100 });",
      "const champion = finalists.find((entry) => entry.signal === 'maximum');",
      "await field.prime(champion);",
      "reveal(champion.name);",
    ].join("\n");
  }, [answers]);

  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      index += Math.ceil(Math.random() * 3);
      setVisibleText(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(interval);
        window.setTimeout(onComplete, 850);
      }
    }, 14);

    return () => window.clearInterval(interval);
  }, [fullText, onComplete]);

  return (
    <motion.section
      className="code-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <pre aria-label="system processing output">
        <code>
          {visibleText}
          <span className="code-caret" />
        </code>
      </pre>
    </motion.section>
  );
}

function StoryScene({ onComplete }: { onComplete: () => void }) {
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const timers = storyLines.map((_, index) =>
      window.setTimeout(() => {
        setLineCount(index + 1);
      }, 650 + index * 1600),
    );

    const completeTimer = window.setTimeout(onComplete, 650 + storyLines.length * 1600 + 900);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.section
      className="story-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="story-lines" aria-live="polite">
        {storyLines.slice(0, lineCount).map((line) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.section>
  );
}

function FinaleScene() {
  return (
    <motion.section
      className="finale-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      <PaintBurstCanvas />
      <motion.div
        className="impact-halo"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.78, 0], scale: [0.2, 1.15, 1.8] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.h1
        initial={{ opacity: 0, y: -220, scale: 1.7, rotate: -4 }}
        animate={{
          opacity: 1,
          y: [-220, 32, -10, 0],
          scale: [1.7, 1.08, 1.02, 1],
          rotate: [-4, 2, -1, 0],
        }}
        transition={{
          duration: 1.18,
          times: [0, 0.62, 0.82, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        Disco Dan
      </motion.h1>
    </motion.section>
  );
}

type Particle = {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  drag: number;
  gravity: number;
};

const paintColors = [
  "#ff3b7f",
  "#ff6a00",
  "#ffe45c",
  "#52ff8f",
  "#35d9ff",
  "#8d5cff",
  "#ff4bd8",
  "#ffffff",
];

function PaintBurstCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let startedAt = performance.now();

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const addParticle = (x: number, y: number, speedMultiplier = 1) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 13 + 4) * speedMultiplier;
      const radius = Math.random() * 6 + 2;

      particles.push({
        x,
        y,
        previousX: x,
        previousY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 5,
        radius,
        color: paintColors[Math.floor(Math.random() * paintColors.length)],
        life: 0,
        maxLife: Math.random() * 72 + 52,
        drag: Math.random() * 0.025 + 0.966,
        gravity: Math.random() * 0.16 + 0.05,
      });
    };

    const burst = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const count = reducedMotion ? 80 : 340;

      for (let index = 0; index < count; index += 1) {
        addParticle(
          centerX + (Math.random() - 0.5) * 90,
          centerY + (Math.random() - 0.5) * 54,
          index < 120 ? 1.45 : 1,
        );
      }

      for (let index = 0; index < 72; index += 1) {
        const x = centerX + (Math.random() - 0.5) * width * 0.72;
        const y = centerY + (Math.random() - 0.5) * height * 0.36;
        addParticle(x, y, 0.34);
      }
    };

    const drawPaintSplat = (particle: Particle, alpha: number) => {
      context.globalAlpha = alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();

      context.lineWidth = particle.radius * 1.65;
      context.lineCap = "round";
      context.strokeStyle = particle.color;
      context.beginPath();
      context.moveTo(particle.previousX, particle.previousY);
      context.lineTo(particle.x, particle.y);
      context.stroke();
    };

    const animate = (now: number) => {
      const elapsed = now - startedAt;

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = elapsed < 250 ? 1 : 0.18;
      context.fillStyle = "#020203";
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= particle.drag;
        particle.vy = particle.vy * particle.drag + particle.gravity;
        particle.life += 1;

        const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
        drawPaintSplat(particle, alpha);
      });

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        if (particles[index].life >= particles[index].maxLife) {
          particles.splice(index, 1);
        }
      }

      if (!reducedMotion && elapsed > 700 && elapsed < 2600 && particles.length < 520) {
        for (let index = 0; index < 10; index += 1) {
          addParticle(width / 2, height / 2, 0.58);
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    burst();
    startedAt = performance.now();
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="paint-canvas" aria-hidden="true" />;
}

export default App;
