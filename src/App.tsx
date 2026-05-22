import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AnswerKey = "name" | "date" | "time";
type Scene =
  | AnswerKey
  | "code"
  | "story"
  | "finale"
  | "animalGame"
  | "wordleGame"
  | "workComputer"
  | "aiCrt"
  | "discoReturn"
  | "afterAiCrt";

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

const animalWords = new Set([
  "aardvark",
  "alligator",
  "alpaca",
  "ant",
  "anteater",
  "antelope",
  "ape",
  "armadillo",
  "baboon",
  "badger",
  "bat",
  "bear",
  "beaver",
  "bee",
  "bison",
  "buffalo",
  "butterfly",
  "camel",
  "capybara",
  "cat",
  "cheetah",
  "chicken",
  "chimpanzee",
  "cow",
  "coyote",
  "crab",
  "crocodile",
  "deer",
  "dog",
  "dolphin",
  "duck",
  "eagle",
  "elephant",
  "ferret",
  "fish",
  "flamingo",
  "fox",
  "frog",
  "giraffe",
  "goat",
  "gorilla",
  "hamster",
  "hippo",
  "horse",
  "jaguar",
  "kangaroo",
  "koala",
  "lemur",
  "leopard",
  "lion",
  "llama",
  "lobster",
  "monkey",
  "moose",
  "mouse",
  "octopus",
  "otter",
  "owl",
  "panda",
  "panther",
  "penguin",
  "pig",
  "rabbit",
  "rat",
  "rhino",
  "seal",
  "shark",
  "sheep",
  "skunk",
  "sloth",
  "snake",
  "spider",
  "squirrel",
  "swan",
  "tiger",
  "turtle",
  "walrus",
  "whale",
  "wolf",
  "zebra",
]);

const failureMessages = [
  "wrong. that's not an animal.",
  "wrong. still not an animal, somehow.",
  "no. disco dan remains unimpressed.",
  "incorrect. biology has been notified.",
  "wrong again. you have seen an animal before, right?",
];

const animalGameTitle = "name animals until failure";

const normalizeEntry = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeWordleValue = (value: string) => value.trim().toUpperCase();

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
    if (key === "name" && normalizeEntry(value) === "skip") {
      setScene("workComputer");
      return;
    }

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

        {scene === "finale" && (
          <FinaleScene key="finale" onStart={() => setScene("animalGame")} />
        )}

        {scene === "animalGame" && (
          <AnimalGameScene key="animal-game" onNext={() => setScene("wordleGame")} />
        )}

        {scene === "wordleGame" && (
          <WordleGameScene
            key="wordle-game"
            answers={answers}
            onNext={() => setScene("workComputer")}
          />
        )}

        {scene === "workComputer" && (
          <WorkComputerScene
            key="work-computer"
            onComplete={() => setScene("aiCrt")}
          />
        )}

        {scene === "aiCrt" && (
          <AiCrtScene key="ai-crt" onNext={() => setScene("discoReturn")} />
        )}

        {scene === "discoReturn" && <DiscoReturnScene key="disco-return" />}

        {scene === "afterAiCrt" && <NextPhasePlaceholder key="after-ai-crt" />}
      </AnimatePresence>
    </main>
  );
}

function NextPhasePlaceholder() {
  return (
    <motion.section
      className="next-phase-placeholder"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <button className="next-button" type="button">
        next
      </button>
    </motion.section>
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
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 350);
    return () => window.clearTimeout(focusTimer);
  }, [question.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = draft.trim();
    if (question.id === "name" && normalizeEntry(nextValue) === "skip") {
      onSubmit(question.id, nextValue);
      return;
    }

    if (nextValue.length !== 5) {
      setHasError(true);
      inputRef.current?.focus();
      return;
    }

    onSubmit(question.id, nextValue);
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
          className={hasError ? "has-error" : ""}
          onChange={(event) => {
            setDraft(event.target.value);
            setHasError(false);
          }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
        <AnimatePresence>
          {hasError && (
            <motion.p
              className="question-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
            >
              Entries must contain five characters
            </motion.p>
          )}
        </AnimatePresence>
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

function FinaleScene({ onStart }: { onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowStart(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.section
      className="finale-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      <PaintBurstCanvas />
      <RainbowFireCanvas targetRef={titleRef} />
      <div className="finale-content">
        <div className="title-anchor">
          <motion.h1
            ref={titleRef}
            initial={{ y: -260, scale: 1.55, rotate: -4 }}
            animate={{
              y: [-260, 34, -9, 0],
              scale: [1.55, 1.07, 1.02, 1],
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
        </div>
        <AnimatePresence>
          {showStart && (
            <div className="start-button-anchor">
              <motion.button
              className="start-button"
              type="button"
              onClick={onStart}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                start
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

type DiscoReturnPhase = "countdown" | "reveal";

const discoReturnCountdown = [
  { value: 10, at: 0 },
  { value: 9, at: 2300 },
  { value: 8, at: 4200 },
  { value: 7, at: 5750 },
  { value: 6, at: 7000 },
  { value: 5, at: 8000 },
  { value: 4, at: 8750 },
  { value: 3, at: 9300 },
  { value: 2, at: 9680 },
  { value: 1, at: 9940 },
  { value: 0, at: 10120 },
];

function DiscoReturnScene() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState<DiscoReturnPhase>("countdown");

  useEffect(() => {
    const timers = discoReturnCountdown.map((step) =>
      window.setTimeout(() => setCount(step.value), step.at),
    );
    timers.push(window.setTimeout(() => setPhase("reveal"), 11200));

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <motion.section
      className="finale-scene disco-return-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <AnimatePresence mode="wait">
        {phase === "countdown" ? (
          <motion.div
            className="disco-countdown"
            key="countdown"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(14px)" }}
            transition={{ duration: 0.45 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                className="disco-countdown-number"
                key={count}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.08 }}
                transition={{ duration: count > 6 ? 0.62 : count > 3 ? 0.36 : 0.18 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="disco-return-reveal"
            key="return-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <PaintBurstCanvas />
            <RainbowFireCanvas targetRef={titleRef} />
            <div className="finale-content">
              <div className="title-anchor">
                <motion.h1
                  ref={titleRef}
                  initial={{ y: -260, scale: 1.55, rotate: -4 }}
                  animate={{
                    y: [-260, 34, -9, 0],
                    scale: [1.55, 1.07, 1.02, 1],
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

type BurstSide = "left" | "right";

type RainbowBurst = {
  id: number;
  side: BurstSide;
};

type DustWord = {
  id: number;
  word: string;
};

type GamePhase = "playing" | "crumbling" | "complete";
type WordleCellState = "correct" | "present" | "absent";
type WordleStatus = "playing" | "won" | "lost";
type WordlePhase = "playing" | "clearing" | "floating" | "complete";
type WordleRow = {
  guess: string;
  result: WordleCellState[];
};

function evaluateWordleGuess(guess: string, target: string): WordleCellState[] {
  const guessChars = Array.from(guess);
  const targetChars = Array.from(target);
  const result: WordleCellState[] = Array.from({ length: 5 }, () => "absent");
  const remainingTarget: Record<string, number> = {};

  targetChars.forEach((char, index) => {
    if (guessChars[index] === char) {
      result[index] = "correct";
      return;
    }

    remainingTarget[char] = (remainingTarget[char] ?? 0) + 1;
  });

  guessChars.forEach((char, index) => {
    if (result[index] === "correct") {
      return;
    }

    if (remainingTarget[char] > 0) {
      result[index] = "present";
      remainingTarget[char] -= 1;
    }
  });

  return result;
}

function WordleGameScene({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const target = useMemo(() => {
    const candidates = [answers.name, answers.date, answers.time]
      .map(normalizeWordleValue)
      .filter((entry) => entry.length === 5);

    return candidates[Math.floor(Math.random() * candidates.length)] ?? "DISCO";
  }, [answers]);

  const [guess, setGuess] = useState("");
  const [rows, setRows] = useState<WordleRow[]>([]);
  const [status, setStatus] = useState<WordleStatus>("playing");
  const [phase, setPhase] = useState<WordlePhase>("playing");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ceremonyTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 450);
    return () => window.clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    return () => {
      ceremonyTimersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  const startAnswerCeremony = (nextStatus: Exclude<WordleStatus, "playing">) => {
    ceremonyTimersRef.current.forEach(window.clearTimeout);
    setStatus(nextStatus);
    setHasError(false);
    setMessage("");

    if (nextStatus === "won") {
      setPhase("floating");
      ceremonyTimersRef.current = [window.setTimeout(() => setPhase("complete"), 9600)];
      return;
    }

    setPhase("clearing");
    ceremonyTimersRef.current = [
      window.setTimeout(() => setPhase("floating"), 950),
      window.setTimeout(() => setPhase("complete"), 6900),
    ];
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status !== "playing" || phase !== "playing") {
      return;
    }

    const normalizedGuess = normalizeWordleValue(guess);

    if (normalizedGuess.length !== 5) {
      setHasError(true);
      setMessage("Entries must contain five characters");
      inputRef.current?.focus();
      return;
    }

    const result = evaluateWordleGuess(normalizedGuess, target);
    const nextRows = [...rows, { guess: normalizedGuess, result }];

    setRows(nextRows);
    setGuess("");
    setHasError(false);

    if (normalizedGuess === target) {
      startAnswerCeremony("won");
      return;
    }

    if (nextRows.length >= 6) {
      startAnswerCeremony("lost");
      return;
    }

    setMessage("");
  };

  const winningRowIndex = rows.findIndex((row) => row.guess === target);
  const shouldShowBoard =
    phase === "playing" || phase === "clearing" || (phase === "floating" && status === "won");

  return (
    <motion.section
      className="wordle-game-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence mode="wait">
        {shouldShowBoard && (
          <motion.div
            key="wordle-active"
            className={`wordle-content ${
              phase === "floating" && status === "won" ? "is-winning-answer" : ""
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={
              phase === "clearing"
                ? { opacity: 0, y: -16, filter: "blur(12px)" }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={{ opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2>disco dandle</h2>
            <div className="wordle-board" aria-label="Wordle board">
              {Array.from({ length: 6 }, (_, rowIndex) => {
                const row = rows[rowIndex];
                const visibleGuess = row?.guess ?? "";

                return (
                  <div
                    className={`wordle-row ${
                      phase === "floating" && status === "won" && rowIndex === winningRowIndex
                        ? "wordle-row-winning"
                        : ""
                    }`}
                    key={rowIndex}
                  >
                    {Array.from({ length: 5 }, (_, cellIndex) => {
                      const letter = visibleGuess[cellIndex] ?? "";
                      const state = row?.result[cellIndex];

                      return (
                        <span
                          className={`wordle-cell ${state ? `wordle-cell-${state}` : ""}`}
                          key={`${rowIndex}-${cellIndex}`}
                        >
                          {letter}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <form className="wordle-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                aria-label="Wordle guess"
                autoComplete="off"
                className={hasError ? "has-error" : ""}
                disabled={status !== "playing"}
                maxLength={5}
                placeholder="guess"
                value={guess}
                onChange={(event) => {
                  setGuess(event.target.value);
                  setHasError(false);
                  if (message === "Entries must contain five characters") {
                    setMessage("");
                  }
                }}
              />
            </form>

            <p className={`wordle-message ${hasError ? "is-error" : ""}`} aria-live="polite">
              {message}
            </p>
          </motion.div>
        )}

        {phase === "floating" && status === "lost" && (
          <FloatingAnswer key="floating-answer" answer={target} />
        )}

        {phase === "complete" && (
          <motion.div
            key="wordle-complete"
            className="game-complete wordle-complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="next-button" type="button" onClick={onNext}>
              next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function FloatingAnswer({ answer }: { answer: string }) {
  const letters = useMemo(
    () =>
      Array.from(answer).map((letter, index) => ({
        id: `${letter}-${index}`,
        letter,
        xA: (Math.random() - 0.5) * 18,
        yA: (Math.random() - 0.5) * 12,
        xB: (Math.random() - 0.5) * 24,
        yB: (Math.random() - 0.5) * 16,
        xEnd: (Math.random() - 0.5) * 34,
        rotate: (Math.random() - 0.5) * 18,
        delay: index * 0.08,
      })),
    [answer],
  );

  return (
    <motion.div
      className="floating-answer"
      key={answer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      aria-label={answer.toLowerCase()}
    >
      {letters.map((letter) => (
        <span
          className="floating-answer-letter"
          key={letter.id}
          aria-hidden="true"
          style={
            {
              "--float-x-a": `${letter.xA}px`,
              "--float-y-a": `${letter.yA}px`,
              "--float-x-b": `${letter.xB}px`,
              "--float-y-b": `${letter.yB}px`,
              "--float-x-end": `${letter.xEnd}px`,
              "--float-rotate": `${letter.rotate}deg`,
              animationDelay: `${letter.delay}s`,
            } as CSSProperties
          }
        >
          {letter.letter}
        </span>
      ))}
    </motion.div>
  );
}

type WorkComputerStage = "login" | "loading" | "desktop" | "excel" | "money" | "bsod";

const seededComputerRows = [
  ["Dell Optiplex 3010", "13456A", "$130"],
  ["HP Pavilion 159x", "23145Z", "$213"],
  ["Lenovo ThinkPad T450", "21345F", "$80"],
];

const excelColumnLetters = Array.from({ length: 10 }, (_, index) =>
  String.fromCharCode(65 + index),
);

function WorkComputerScene({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<WorkComputerStage>("login");
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [showStickyNote, setShowStickyNote] = useState(true);
  const [moneyOrigin, setMoneyOrigin] = useState({ row: 4, col: 2 });
  const crashTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (crashTimerRef.current !== null) {
        window.clearTimeout(crashTimerRef.current);
      }
    };
  }, []);

  const startLogin = () => {
    window.setTimeout(() => {
      setStage("loading");
      window.setTimeout(() => setStage("desktop"), 2500);
    }, 500);
  };

  const openExcel = () => {
    setIsExcelOpen(true);
    setShowStickyNote(true);
    setStage("excel");
  };

  const triggerMoneyColumn = (row: number, col: number) => {
    if (stage === "money" || stage === "bsod") {
      return;
    }

    setMoneyOrigin({ row, col });
    setShowStickyNote(false);
    setStage("money");
    crashTimerRef.current = window.setTimeout(() => setStage("bsod"), 13500);
  };

  const completeComputer = () => {
    if (crashTimerRef.current !== null) {
      window.clearTimeout(crashTimerRef.current);
    }

    onComplete();
  };

  return (
    <motion.section
      className="work-computer-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="work-computer-frame">
        {stage === "login" && <XpLoginScreen onLogin={startLogin} />}
        {stage === "loading" && <XpLoadingScreen />}
        {(stage === "desktop" || stage === "excel" || stage === "money" || stage === "bsod") && (
          <XpDesktop
            isExcelOpen={isExcelOpen}
            showStickyNote={showStickyNote}
            stage={stage}
            moneyOrigin={moneyOrigin}
            onCloseSticky={() => setShowStickyNote(false)}
            onOpenExcel={openExcel}
            onTriggerMoney={triggerMoneyColumn}
          />
        )}
        {stage === "bsod" && <BlueScreen onRestart={completeComputer} />}
      </div>
    </motion.section>
  );
}

function XpLoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="xp-login">
      <div className="xp-login-band xp-login-band-top" />
      <div className="xp-login-center">
        <div className="xp-login-copy">
          <p>to begin, click your user name</p>
        </div>
        <button className="xp-user-tile" type="button" onClick={onLogin}>
          <span className="xp-user-avatar" aria-hidden="true">SW</span>
          <span>Sam&apos;s Work Computer</span>
        </button>
      </div>
      <div className="xp-login-band xp-login-band-bottom" />
    </div>
  );
}

function XpLoadingScreen() {
  return (
    <div className="xp-loading">
      <div className="xp-loading-card">
        <div className="xp-spinner" aria-hidden="true" />
        <p>loading your personal settings...</p>
      </div>
    </div>
  );
}

function XpDesktop({
  isExcelOpen,
  showStickyNote,
  stage,
  moneyOrigin,
  onCloseSticky,
  onOpenExcel,
  onTriggerMoney,
}: {
  isExcelOpen: boolean;
  showStickyNote: boolean;
  stage: WorkComputerStage;
  moneyOrigin: { row: number; col: number };
  onCloseSticky: () => void;
  onOpenExcel: () => void;
  onTriggerMoney: (row: number, col: number) => void;
}) {
  return (
    <motion.div
      className="xp-desktop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="xp-wallpaper" />
      {!isExcelOpen && (
        <button className="desktop-excel-icon" type="button" onDoubleClick={onOpenExcel} onClick={onOpenExcel}>
          <span className="excel-icon" aria-hidden="true">X</span>
          <span>Excel</span>
        </button>
      )}
      {isExcelOpen && (
        <ExcelWindow
          showStickyNote={showStickyNote}
          stage={stage}
          moneyOrigin={moneyOrigin}
          onCloseSticky={onCloseSticky}
          onTriggerMoney={onTriggerMoney}
        />
      )}
      {stage === "money" && <MoneyPhysicsLayer />}
      <div className="xp-taskbar">
        <button className="xp-start-button" type="button">start</button>
        <button
          className={`xp-task-button ${isExcelOpen ? "is-active" : ""}`}
          type="button"
          onClick={isExcelOpen ? undefined : onOpenExcel}
        >
          Excel
        </button>
        <div className="xp-clock">4:59 PM</div>
      </div>
    </motion.div>
  );
}

function ExcelWindow({
  showStickyNote,
  stage,
  moneyOrigin,
  onCloseSticky,
  onTriggerMoney,
}: {
  showStickyNote: boolean;
  stage: WorkComputerStage;
  moneyOrigin: { row: number; col: number };
  onCloseSticky: () => void;
  onTriggerMoney: (row: number, col: number) => void;
}) {
  return (
    <div className={`excel-window ${stage === "money" ? "is-money-transforming" : ""}`}>
      <div className="excel-titlebar">
        <span>Microsoft Excel - Report.xls</span>
        <div className="excel-window-buttons" aria-hidden="true">
          <span>_</span>
          <span>[]</span>
          <span>x</span>
        </div>
      </div>
      <div className="excel-menu">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Insert</span>
        <span>Format</span>
        <span>Tools</span>
        <span>Data</span>
        <span>Window</span>
        <span>Help</span>
      </div>
      <div className="excel-toolbar" aria-hidden="true">
        {Array.from({ length: 17 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="excel-formula-bar">
        <span>Name Box</span>
        <div>fx</div>
      </div>
      <div className="excel-sheet-wrap">
        <div className="excel-sheet">
          <div className="excel-corner" />
          {excelColumnLetters.map((letter) => (
            <div className="excel-column-header" key={letter}>{letter}</div>
          ))}
          {Array.from({ length: 18 }, (_, rowIndex) => (
            <ExcelRow
              key={rowIndex}
              rowIndex={rowIndex}
              isTransforming={stage === "money"}
              moneyOrigin={moneyOrigin}
              onTriggerMoney={onTriggerMoney}
            />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {showStickyNote && stage !== "money" && (
          <motion.div
            className="boss-note"
            initial={{ opacity: 0, y: 18, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <button type="button" onClick={onCloseSticky} aria-label="Close sticky note">x</button>
            <p>Please enter the information before 5pm! This report is extremely important!</p>
            <p>- Boss</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExcelRow({
  rowIndex,
  isTransforming,
  moneyOrigin,
  onTriggerMoney,
}: {
  rowIndex: number;
  isTransforming: boolean;
  moneyOrigin: { row: number; col: number };
  onTriggerMoney: (row: number, col: number) => void;
}) {
  const displayRow = rowIndex + 1;

  return (
    <>
      <div className="excel-row-header">{displayRow}</div>
      {excelColumnLetters.map((_, colIndex) => {
        const value = getExcelCellValue(rowIndex, colIndex);
        const isEditable = colIndex < 2 && rowIndex >= 4;
        const isMoney = colIndex === 2;
        const distance = Math.abs(rowIndex - moneyOrigin.row) + Math.abs(colIndex - moneyOrigin.col);

        if (isMoney) {
          return (
            <div
              className="excel-cell is-money-column"
              key={`${rowIndex}-${colIndex}`}
              style={{ "--money-delay": `${distance * 85}ms` } as CSSProperties}
            >
              <input
                aria-label={`Row ${displayRow} money cell`}
                readOnly
                value={value}
                onClick={() => onTriggerMoney(rowIndex, colIndex)}
                onFocus={() => onTriggerMoney(rowIndex, colIndex)}
                onSelect={() => onTriggerMoney(rowIndex, colIndex)}
              />
            </div>
          );
        }

        return (
          <div
            className="excel-cell"
            key={`${rowIndex}-${colIndex}`}
            style={{ "--money-delay": `${distance * 85}ms` } as CSSProperties}
          >
            {isEditable && !isTransforming ? (
              <input aria-label={`Row ${displayRow} cell ${colIndex + 1}`} />
            ) : (
              value
            )}
          </div>
        );
      })}
    </>
  );
}

function getExcelCellValue(rowIndex: number, colIndex: number) {
  if (rowIndex === 0) {
    return ["Computer", "Id", "Money"][colIndex] ?? "";
  }

  const seededRow = seededComputerRows[rowIndex - 1];
  return seededRow?.[colIndex] ?? "";
}

type MoneyBill = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  width: number;
  height: number;
  settled: boolean;
  seed: number;
};

function MoneyPhysicsLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const bills: MoneyBill[] = [];
    const pileHeights: number[] = Array.from({ length: 16 }, () => 0);
    const maxBills = 320;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let startedAt = performance.now();
    let lastFrame = startedAt;
    let lastSpawn = 0;
    let firstBillSpawned = false;
    let rainStarted = false;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const spawnBill = (x: number, y: number, strongDrop = false) => {
      bills.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (strongDrop ? 1.2 : 2.7),
        vy: strongDrop ? 0 : Math.random() * 1.4,
        angle: (Math.random() - 0.5) * 0.38,
        va: (Math.random() - 0.5) * 0.08,
        width: Math.random() * 10 + 58,
        height: Math.random() * 4 + 28,
        settled: false,
        seed: Math.random() * Math.PI * 2,
      });
    };

    const getColumnIndex = (x: number) =>
      Math.max(0, Math.min(pileHeights.length - 1, Math.floor((x / width) * pileHeights.length)));

    const drawBill = (bill: MoneyBill) => {
      context.save();
      context.translate(bill.x, bill.y);
      context.rotate(bill.angle);
      context.fillStyle = "#dff7d7";
      context.strokeStyle = "#19763a";
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(-bill.width / 2, -bill.height / 2, bill.width, bill.height, 4);
      context.fill();
      context.stroke();
      context.strokeStyle = "rgba(25, 118, 58, 0.46)";
      context.lineWidth = 1;
      context.strokeRect(-bill.width / 2 + 7, -bill.height / 2 + 5, bill.width - 14, bill.height - 10);
      context.fillStyle = "#19763a";
      context.font = "bold 18px Georgia";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("$", 0, 1);
      context.restore();
    };

    const settleBill = (bill: MoneyBill, columnIndex: number, supportY: number) => {
      bill.y = supportY - bill.height / 2;
      bill.vx = 0;
      bill.vy = 0;
      bill.va = 0;
      bill.settled = true;
      bill.angle = (Math.random() - 0.5) * 0.26;
      pileHeights[columnIndex] += bill.height * 0.72 + Math.random() * 8;
    };

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const delta = Math.min(2.2, (now - lastFrame) / 16.67);
      lastFrame = now;

      if (!firstBillSpawned) {
        spawnBill(width / 2, height * 0.38, true);
        firstBillSpawned = true;
      }

      if (elapsed > 4300) {
        rainStarted = true;
      }

      if (rainStarted && now - lastSpawn > 35 && bills.length < maxBills) {
        const spawnCount = elapsed > 9000 ? 6 : elapsed > 6600 ? 4 : 2;
        for (let index = 0; index < spawnCount && bills.length < maxBills; index += 1) {
          spawnBill(Math.random() * (width + 260) - 130, -36 - Math.random() * 120);
        }
        lastSpawn = now;
      }

      context.clearRect(0, 0, width, height);

      bills.forEach((bill) => {
        if (!bill.settled) {
          const columnIndex = getColumnIndex(bill.x);
          const supportY = height - 44 - pileHeights[columnIndex];

          bill.vy += 0.34 * delta;
          bill.vx += Math.sin(elapsed * 0.0018 + bill.seed) * 0.025 * delta;
          bill.x += bill.vx * delta;
          bill.y += bill.vy * delta;
          bill.angle += bill.va * delta;
          bill.va *= 0.992;

          if (bill.y + bill.height / 2 >= supportY) {
            if (Math.abs(bill.vy) > 2.2) {
              bill.y = supportY - bill.height / 2;
              bill.vy *= -0.18;
              bill.vx *= 0.6;
              bill.va *= 0.55;
            } else {
              settleBill(bill, columnIndex, supportY);
            }
          }
        } else if (elapsed > 6200) {
          bill.y -= 0.055 * delta;
          bill.x += Math.sin(elapsed * 0.001 + bill.seed) * 0.02 * delta;
        }

        drawBill(bill);
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="money-physics-layer" aria-hidden="true" />;
}

function BlueScreen({ onRestart }: { onRestart: () => void }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowText(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="blue-screen">
      {!showText ? (
        <div className="bsod-loading-wheel" aria-label="Loading" />
      ) : (
        <>
          <div className="bsod-copy">
            <p>Your computer ran into a problem</p>
            <h2>ERROR: mo money mo problems</h2>
          </div>
          <button className="bsod-restart-button" type="button" onClick={onRestart}>Restart</button>
        </>
      )}
    </div>
  );
}

type AiCrtPhase =
  | "crtIn"
  | "tuning"
  | "happyFace"
  | "introFlicker"
  | "introText"
  | "introFizzle"
  | "questionText"
  | "awaitDrain"
  | "evil"
  | "tvWater"
  | "flood"
  | "survivalDrain"
  | "hydrated"
  | "hydratedDrain"
  | "apocalypse"
  | "melting"
  | "next";

type AiWaterMode = "fill" | "drain" | "tvFill";
type AiPointerSnapshot = {
  x: number;
  y: number;
  inside: boolean;
};

function AiCrtScene({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<AiCrtPhase>("crtIn");
  const [typedText, setTypedText] = useState("");
  const [blackness, setBlackness] = useState(0);
  const [apocalypseText, setApocalypseText] = useState("you watch too much tv");
  const floodResolvedRef = useRef(false);
  const pointerSnapshotRef = useRef<AiPointerSnapshot>({
    x: 0,
    y: -9999,
    inside: false,
  });

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      pointerSnapshotRef.current = {
        x: event.clientX,
        y: event.clientY,
        inside:
          event.clientX >= 0 &&
          event.clientX <= window.innerWidth &&
          event.clientY >= 0 &&
          event.clientY <= window.innerHeight,
      };
    };

    const clearPointer = () => {
      pointerSnapshotRef.current = {
        x: 0,
        y: -9999,
        inside: false,
      };
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        clearPointer();
      }
    };

    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerdown", updatePointer);
    window.addEventListener("pointerleave", clearPointer);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useEffect(() => {
    let timeout: number | undefined;
    let interval: number | undefined;

    const queue = (nextPhase: AiCrtPhase, delay: number) => {
      timeout = window.setTimeout(() => setPhase(nextPhase), delay);
    };

    const typeLine = (line: string, nextPhase: AiCrtPhase, hold: number, speed = 44) => {
      let index = 0;
      setTypedText("");
      interval = window.setInterval(() => {
        index += 1;
        setTypedText(line.slice(0, index));

        if (index >= line.length) {
          if (interval !== undefined) {
            window.clearInterval(interval);
          }
          timeout = window.setTimeout(() => setPhase(nextPhase), hold);
        }
      }, speed);
    };

    if (phase === "crtIn") {
      queue("tuning", 1900);
    } else if (phase === "tuning") {
      queue("happyFace", 3400);
    } else if (phase === "happyFace") {
      queue("introFlicker", 1050);
    } else if (phase === "introFlicker") {
      queue("introText", 290);
    } else if (phase === "introText") {
      typeLine("I wonder if anything's on Netflix", "introFizzle", 900);
    } else if (phase === "introFizzle") {
      queue("questionText", 950);
    } else if (phase === "questionText") {
      typeLine("I sure am thirsty...", "awaitDrain", 1000, 52);
    } else if (phase === "evil") {
      queue("tvWater", 800);
    } else if (phase === "tvWater") {
      queue("flood", 5600);
    } else if (phase === "survivalDrain") {
      setBlackness(0);
      queue("apocalypse", 2900);
    } else if (phase === "hydrated") {
      setBlackness(1);
      queue("hydratedDrain", 1600);
    } else if (phase === "hydratedDrain") {
      setBlackness(0.9);
      queue("apocalypse", 3600);
    } else if (phase === "apocalypse") {
      setBlackness(0);
      queue("melting", 1500);
    } else if (phase === "melting") {
      queue("next", 6100);
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }

      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [phase]);

  const startDrainCheck = () => {
    floodResolvedRef.current = false;
    setBlackness(0);
    setPhase("evil");
  };

  const resolveHydrated = () => {
    if (floodResolvedRef.current) {
      return;
    }

    floodResolvedRef.current = true;
    setApocalypseText("or your brain will melt");
    setBlackness(1);
    setPhase("hydrated");
  };

  const resolveSurvived = () => {
    if (floodResolvedRef.current) {
      return;
    }

    floodResolvedRef.current = true;
    setApocalypseText("you watch too much tv");
    setBlackness(0);
    setPhase("survivalDrain");
  };

  const showCrt = [
    "crtIn",
    "tuning",
    "happyFace",
    "introFlicker",
    "introText",
    "introFizzle",
    "questionText",
    "awaitDrain",
    "evil",
    "tvWater",
    "flood",
  ].includes(phase);
  const isEvil = ["evil", "tvWater", "flood"].includes(phase);
  const showDialogue = ["introText", "introFizzle", "questionText"].includes(phase);
  const showTvWater = phase === "tvWater" || phase === "flood";
  const showWaterCanvas = phase === "flood" || phase === "survivalDrain" || phase === "hydratedDrain";
  const waterMode: AiWaterMode = phase === "flood" ? "fill" : "drain";
  const showHydrationText = phase === "hydrated" || phase === "hydratedDrain";
  const showApocalypseText = phase === "apocalypse" || phase === "melting" || phase === "next";

  return (
    <motion.section
      className={`ai-crt-scene ai-phase-${phase}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="ai-room-noise" aria-hidden="true" />

      {showCrt && (
        <div className={`crt-shell ${phase !== "crtIn" ? "is-visible" : ""}`}>
          <div className="crt-cabinet">
            <div
              className={`crt-screen ${
                phase === "tuning" ? "is-tuning" : ""
              } ${isEvil ? "is-evil" : ""}`}
            >
              <div className="crt-static" aria-hidden="true" />
              <div className="crt-violent-static" aria-hidden="true" />
              <div className="crt-scanlines" aria-hidden="true" />

              {phase === "introFlicker" && <div className="crt-black-flicker" aria-hidden="true" />}

              {showDialogue && (
                <p className={`crt-dialogue ${phase === "introFizzle" ? "is-fizzling" : ""}`}>
                  {typedText}
                  {phase !== "introFizzle" && <span className="crt-type-caret" aria-hidden="true" />}
                </p>
              )}

              {showTvWater && (
                <AiWaterCanvas
                  key="tv-fluid"
                  className="crt-water-canvas"
                  initialPointer={pointerSnapshotRef.current}
                  mode="tvFill"
                />
              )}
            </div>
            {phase === "flood" && <div className="crt-spill-sheet" aria-hidden="true" />}

            <div className="crt-speaker" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="crt-controls" aria-hidden="true">
              <span />
              <span />
            </div>
          </div>

        </div>
      )}

      {phase === "awaitDrain" && (
        <button className="drain-check-button" type="button" onClick={startDrainCheck}>
          Watch Love Island
        </button>
      )}

      {showWaterCanvas && (
        <AiWaterCanvas
          key={phase === "flood" ? "ai-water-fill" : `ai-water-${phase}`}
          mode={waterMode}
          initialPointer={pointerSnapshotRef.current}
          onAvoided={resolveSurvived}
          onBlackness={setBlackness}
          onHydrated={resolveHydrated}
        />
      )}

      <div
        className="ai-flood-darkness"
        aria-hidden="true"
        style={{ opacity: blackness }}
      />

      {showHydrationText && (
        <DrainText text="stay hydrated" isDraining={phase === "hydratedDrain"} />
      )}

      {showApocalypseText && (
        <MeltingFinale text={apocalypseText} isMelting={phase === "melting" || phase === "next"} />
      )}

      {phase === "next" && (
        <button className="ai-next-button" type="button" onClick={onNext}>
          next
        </button>
      )}
    </motion.section>
  );
}

function AiWaterCanvas({
  className,
  initialPointer,
  mode,
  onAvoided,
  onBlackness,
  onHydrated,
}: {
  className?: string;
  initialPointer: AiPointerSnapshot;
  mode: AiWaterMode;
  onAvoided?: () => void;
  onBlackness?: (value: number) => void;
  onHydrated?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialPointerRef = useRef(initialPointer);
  const onAvoidedRef = useRef(onAvoided ?? (() => undefined));
  const onBlacknessRef = useRef(onBlackness ?? (() => undefined));
  const onHydratedRef = useRef(onHydrated ?? (() => undefined));

  useEffect(() => {
    onAvoidedRef.current = onAvoided ?? (() => undefined);
    onBlacknessRef.current = onBlackness ?? (() => undefined);
    onHydratedRef.current = onHydrated ?? (() => undefined);
  }, [onAvoided, onBlackness, onHydrated]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const bufferCanvas = document.createElement("canvas");
    const bufferContext = bufferCanvas.getContext("2d");

    if (!canvas || !context || !bufferContext) {
      return;
    }

    let width = 1;
    let height = 1;
    let cols = 96;
    let rows = 72;
    let stride = cols + 2;
    let size = (cols + 2) * (rows + 2);
    let density = new Float32Array(size);
    let densityPrevious = new Float32Array(size);
    let velocityX = new Float32Array(size);
    let velocityY = new Float32Array(size);
    let velocityXPrevious = new Float32Array(size);
    let velocityYPrevious = new Float32Array(size);
    let animationFrame = 0;
    let startedAt = performance.now();
    let lastFrame = startedAt;
    let consecutiveTouchMs = 0;
    let darknessMs = 0;
    let lastBlackness = -1;
    let hasResolved = false;

    const pointer = {
      clientX: initialPointerRef.current.x,
      clientY: initialPointerRef.current.y,
      x: 0,
      y: -9999,
      inside: initialPointerRef.current.inside,
    };

    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.max(minimum, Math.min(maximum, value));

    const getIndex = (x: number, y: number) => x + y * stride;

    const resetFluid = () => {
      stride = cols + 2;
      size = (cols + 2) * (rows + 2);
      density = new Float32Array(size);
      densityPrevious = new Float32Array(size);
      velocityX = new Float32Array(size);
      velocityY = new Float32Array(size);
      velocityXPrevious = new Float32Array(size);
      velocityYPrevious = new Float32Array(size);
      bufferCanvas.width = cols;
      bufferCanvas.height = rows;

      if (mode === "drain") {
        for (let y = 1; y <= rows; y += 1) {
          for (let x = 1; x <= cols; x += 1) {
            const id = getIndex(x, y);
            density[id] = 1.2 + (y / rows) * 0.5 + Math.sin(x * 0.31 + y * 0.19) * 0.08;
            velocityY[id] = 0.16;
          }
        }
      }
    };

    const syncPointerToCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = pointer.clientX - rect.left;
      pointer.y = pointer.clientY - rect.top;
      pointer.inside =
        pointer.inside &&
        pointer.x >= 0 &&
        pointer.x <= rect.width &&
        pointer.y >= 0 &&
        pointer.y <= rect.height;
    };

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const nextCols = clamp(Math.round(rect.width / 9), 68, 150);
      const nextRows = clamp(Math.round(rect.height / 9), 52, 112);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = true;

      if (nextCols !== cols || nextRows !== rows) {
        cols = nextCols;
        rows = nextRows;
        resetFluid();
      }

      syncPointerToCanvas();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.inside = true;
      syncPointerToCanvas();
    };

    const handlePointerLeave = () => {
      pointer.clientX = 0;
      pointer.clientY = -9999;
      pointer.inside = false;
      pointer.y = -9999;
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        handlePointerLeave();
      }
    };

    const setBoundary = (boundary: number, values: Float32Array) => {
      for (let x = 1; x <= cols; x += 1) {
        values[getIndex(x, 0)] = boundary === 2 ? -values[getIndex(x, 1)] : values[getIndex(x, 1)];
        values[getIndex(x, rows + 1)] =
          boundary === 2 ? -values[getIndex(x, rows)] : values[getIndex(x, rows)];
      }

      for (let y = 1; y <= rows; y += 1) {
        values[getIndex(0, y)] = boundary === 1 ? -values[getIndex(1, y)] : values[getIndex(1, y)];
        values[getIndex(cols + 1, y)] =
          boundary === 1 ? -values[getIndex(cols, y)] : values[getIndex(cols, y)];
      }

      values[getIndex(0, 0)] = 0.5 * (values[getIndex(1, 0)] + values[getIndex(0, 1)]);
      values[getIndex(0, rows + 1)] =
        0.5 * (values[getIndex(1, rows + 1)] + values[getIndex(0, rows)]);
      values[getIndex(cols + 1, 0)] =
        0.5 * (values[getIndex(cols, 0)] + values[getIndex(cols + 1, 1)]);
      values[getIndex(cols + 1, rows + 1)] =
        0.5 * (values[getIndex(cols, rows + 1)] + values[getIndex(cols + 1, rows)]);
    };

    const linearSolve = (
      boundary: number,
      values: Float32Array,
      previousValues: Float32Array,
      amount: number,
      divisor: number,
    ) => {
      for (let iteration = 0; iteration < 6; iteration += 1) {
        for (let y = 1; y <= rows; y += 1) {
          for (let x = 1; x <= cols; x += 1) {
            values[getIndex(x, y)] =
              (previousValues[getIndex(x, y)] +
                amount *
                  (values[getIndex(x - 1, y)] +
                    values[getIndex(x + 1, y)] +
                    values[getIndex(x, y - 1)] +
                    values[getIndex(x, y + 1)])) /
              divisor;
          }
        }

        setBoundary(boundary, values);
      }
    };

    const diffuse = (
      boundary: number,
      values: Float32Array,
      previousValues: Float32Array,
      diffusion: number,
      deltaSeconds: number,
    ) => {
      const scale = Math.max(cols, rows);
      const amount = deltaSeconds * diffusion * scale * scale;
      linearSolve(boundary, values, previousValues, amount, 1 + 4 * amount);
    };

    const advect = (
      boundary: number,
      values: Float32Array,
      previousValues: Float32Array,
      xVelocity: Float32Array,
      yVelocity: Float32Array,
      deltaSeconds: number,
    ) => {
      const deltaX = deltaSeconds * cols;
      const deltaY = deltaSeconds * rows;

      for (let y = 1; y <= rows; y += 1) {
        for (let x = 1; x <= cols; x += 1) {
          let sampleX = x - deltaX * xVelocity[getIndex(x, y)];
          let sampleY = y - deltaY * yVelocity[getIndex(x, y)];
          sampleX = clamp(sampleX, 0.5, cols + 0.5);
          sampleY = clamp(sampleY, 0.5, rows + 0.5);

          const x0 = Math.floor(sampleX);
          const x1 = x0 + 1;
          const y0 = Math.floor(sampleY);
          const y1 = y0 + 1;
          const sx1 = sampleX - x0;
          const sx0 = 1 - sx1;
          const sy1 = sampleY - y0;
          const sy0 = 1 - sy1;

          values[getIndex(x, y)] =
            sx0 *
              (sy0 * previousValues[getIndex(x0, y0)] + sy1 * previousValues[getIndex(x0, y1)]) +
            sx1 *
              (sy0 * previousValues[getIndex(x1, y0)] + sy1 * previousValues[getIndex(x1, y1)]);
        }
      }

      setBoundary(boundary, values);
    };

    const project = (
      xVelocity: Float32Array,
      yVelocity: Float32Array,
      pressure: Float32Array,
      divergence: Float32Array,
    ) => {
      for (let y = 1; y <= rows; y += 1) {
        for (let x = 1; x <= cols; x += 1) {
          divergence[getIndex(x, y)] =
            -0.5 *
            ((xVelocity[getIndex(x + 1, y)] - xVelocity[getIndex(x - 1, y)]) / cols +
              (yVelocity[getIndex(x, y + 1)] - yVelocity[getIndex(x, y - 1)]) / rows);
          pressure[getIndex(x, y)] = 0;
        }
      }

      setBoundary(0, divergence);
      setBoundary(0, pressure);
      linearSolve(0, pressure, divergence, 1, 4);

      for (let y = 1; y <= rows; y += 1) {
        for (let x = 1; x <= cols; x += 1) {
          xVelocity[getIndex(x, y)] -=
            0.5 * cols * (pressure[getIndex(x + 1, y)] - pressure[getIndex(x - 1, y)]);
          yVelocity[getIndex(x, y)] -=
            0.5 * rows * (pressure[getIndex(x, y + 1)] - pressure[getIndex(x, y - 1)]);
        }
      }

      setBoundary(1, xVelocity);
      setBoundary(2, yVelocity);
    };

    const addFluid = (
      gridX: number,
      gridY: number,
      radius: number,
      densityAmount: number,
      xForce: number,
      yForce: number,
    ) => {
      const minX = Math.max(1, Math.floor(gridX - radius));
      const maxX = Math.min(cols, Math.ceil(gridX + radius));
      const minY = Math.max(1, Math.floor(gridY - radius));
      const maxY = Math.min(rows, Math.ceil(gridY + radius));

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const distanceX = x - gridX;
          const distanceY = y - gridY;
          const falloff = Math.max(0, 1 - Math.sqrt(distanceX * distanceX + distanceY * distanceY) / radius);
          const id = getIndex(x, y);
          density[id] = Math.min(3.2, density[id] + densityAmount * falloff);
          velocityX[id] += xForce * falloff;
          velocityY[id] += yForce * falloff;
        }
      }
    };

    const injectFlood = (fill: number, now: number) => {
      const targetTop = Math.max(1, Math.floor(rows * (1 - fill)));
      const bottomRows = Math.max(4, Math.round(rows * 0.08));
      const pressureBand = Math.max(2, Math.round(rows * 0.055));

      if (mode === "fill" && fill < 0.34) {
        const sourceY = clamp(rows * 0.28 + Math.sin(now * 0.003) * 2.5, 3, rows);
        addFluid(
          cols / 2,
          sourceY,
          Math.max(5, Math.min(cols, rows) * 0.07),
          0.5,
          Math.sin(now * 0.005) * 0.45,
          0.5,
        );
      }

      for (let x = 1; x <= cols; x += 1) {
        const wave = Math.sin(now * 0.002 + x * 0.33);
        for (let y = rows - bottomRows; y <= rows; y += 1) {
          const id = getIndex(x, y);
          density[id] = Math.min(3.1, density[id] + 0.26 + wave * 0.018);
          velocityY[id] -= 0.08 + Math.random() * 0.035;
          velocityX[id] += Math.sin(now * 0.0017 + x * 0.41 + y * 0.17) * 0.05;
        }
      }

      for (let y = Math.min(rows, targetTop + pressureBand); y <= rows; y += 1) {
        const depth = (y - targetTop) / Math.max(1, rows - targetTop);
        for (let x = 1; x <= cols; x += 1) {
          const id = getIndex(x, y);
          const curl = Math.sin(now * 0.0015 + x * 0.27) * Math.cos(y * 0.21);
          const desiredDensity = 0.42 + depth * 0.72;
          density[id] = Math.max(density[id] * 0.96, desiredDensity + curl * 0.05);
          velocityX[id] += curl * 0.032;
          velocityY[id] -= Math.max(0, 0.024 * (1 - depth));
        }
      }

      for (let index = 0; index < 5; index += 1) {
        const x = 1 + ((now * 0.011 + index * 23) % cols);
        const y = clamp(targetTop + Math.sin(now * 0.003 + index) * 4, 3, rows);
        addFluid(x, y, 3 + (index % 2), 0.12, Math.sin(index + now * 0.002) * 0.28, -0.08);
      }
    };

    const pullDrain = (elapsed: number) => {
      const drainX = cols / 2;
      const drainY = rows + 4;
      const sinkRadius = Math.max(8, Math.min(cols, rows) * 0.24);
      const drainStrength = 0.08 + Math.min(0.15, elapsed / 18000);

      for (let y = 1; y <= rows; y += 1) {
        for (let x = 1; x <= cols; x += 1) {
          const id = getIndex(x, y);
          const dx = drainX - x;
          const dy = drainY - y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const pull = Math.max(0, 1 - distance / sinkRadius);
          const swirl = pull * 0.16;
          velocityX[id] += (dx / distance) * pull * 0.34 - (dy / distance) * swirl;
          velocityY[id] += (dy / distance) * pull * 0.42 + (dx / distance) * swirl;
          density[id] *= 1 - pull * drainStrength;
          density[id] *= y > rows - 3 ? 0.84 : 0.992;
        }
      }
    };

    const disturbFromPointer = () => {
      if (!pointer.inside) {
        return;
      }

      const gridX = clamp((pointer.x / width) * cols + 1, 1, cols);
      const gridY = clamp((pointer.y / height) * rows + 1, 1, rows);
      addFluid(
        gridX,
        gridY,
        Math.max(4, Math.min(cols, rows) * 0.055),
        0.025,
        Math.sin(performance.now() * 0.006) * 0.18,
        Math.cos(performance.now() * 0.004) * 0.13,
      );
    };

    const stepFluid = (deltaSeconds: number) => {
      diffuse(1, velocityXPrevious, velocityX, 0.000002, deltaSeconds);
      diffuse(2, velocityYPrevious, velocityY, 0.000002, deltaSeconds);
      project(velocityXPrevious, velocityYPrevious, velocityX, velocityY);
      advect(1, velocityX, velocityXPrevious, velocityXPrevious, velocityYPrevious, deltaSeconds);
      advect(2, velocityY, velocityYPrevious, velocityXPrevious, velocityYPrevious, deltaSeconds);
      project(velocityX, velocityY, velocityXPrevious, velocityYPrevious);
      diffuse(0, densityPrevious, density, 0.000018, deltaSeconds);
      advect(0, density, densityPrevious, velocityX, velocityY, deltaSeconds);

      const fade = mode === "drain" ? 0.991 : mode === "tvFill" ? 0.996 : 0.997;
      for (let index = 0; index < size; index += 1) {
        density[index] *= fade;
        velocityX[index] *= 0.995;
        velocityY[index] *= 0.995;
      }
    };

    const samplePointerWater = (fill: number) => {
      if (!pointer.inside) {
        return false;
      }

      const gridX = clamp(Math.round((pointer.x / width) * cols) + 1, 1, cols);
      const gridY = clamp(Math.round((pointer.y / height) * rows) + 1, 1, rows);
      const normalizedY = pointer.y / height;
      const filledByVolume = normalizedY >= 1 - fill - 0.012;

      return density[getIndex(gridX, gridY)] > 0.16 || filledByVolume;
    };

    const renderFluid = (fill: number, now: number) => {
      const image = bufferContext.createImageData(cols, rows);
      const data = image.data;

      for (let y = 1; y <= rows; y += 1) {
        const depth = y / rows;
        for (let x = 1; x <= cols; x += 1) {
          const id = getIndex(x, y);
          const pixelIndex = ((y - 1) * cols + (x - 1)) * 4;
          const surfaceNoise =
            Math.sin(x * 0.21 + now * 0.0024) * 0.012 +
            Math.sin(x * 0.07 - now * 0.0017) * 0.018;
          const isBelowFill = mode !== "drain" && depth >= 1 - fill + surfaceNoise;
          const d = Math.max(0, density[id]);
          const alpha = clamp(
            (d * 118 + (isBelowFill ? 108 : 0)) * (mode === "drain" ? 1 : 0.96),
            0,
            mode === "tvFill" ? 246 : 230,
          );
          const glow = clamp(d, 0, 1.7);

          data[pixelIndex] = 5 + glow * 18;
          data[pixelIndex + 1] = 44 + glow * 38 + depth * 20;
          data[pixelIndex + 2] = 118 + glow * 42;
          data[pixelIndex + 3] = alpha;
        }
      }

      bufferContext.putImageData(image, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.drawImage(bufferCanvas, 0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "screen";
      context.strokeStyle = "rgba(216, 250, 255, 0.32)";
      context.lineWidth = 1.5;

      for (let line = 0; line < 3; line += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 18) {
          const gridX = clamp(Math.round((x / width) * cols) + 1, 1, cols);
          let surfaceRow = rows;

          for (let y = 1; y <= rows; y += 1) {
            const depth = y / rows;
            if (density[getIndex(gridX, y)] > 0.23 || (mode !== "drain" && depth >= 1 - fill)) {
              surfaceRow = y;
              break;
            }
          }

          const y =
            (surfaceRow / rows) * height +
            Math.sin(x * 0.026 + now * 0.003 + line * 1.7) * (4 + line * 2);

          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }

      context.restore();
    };

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const deltaMs = Math.min(58, now - lastFrame);
      const deltaSeconds = deltaMs / 1000;
      lastFrame = now;
      const fill =
        mode === "drain"
          ? Math.max(0, 1 - elapsed / 3400)
          : Math.min(1, elapsed / (mode === "tvFill" ? 5200 : 11800));

      if (mode === "fill" || mode === "tvFill") {
        injectFlood(fill, now);
        if (mode === "fill") {
          disturbFromPointer();
        }
      } else {
        pullDrain(elapsed);
      }

      stepFluid(deltaSeconds);
      renderFluid(fill, now);

      if (mode === "fill" && !hasResolved) {
        const isTouchingWater = samplePointerWater(fill);

        if (isTouchingWater) {
          consecutiveTouchMs += deltaMs;
          darknessMs = Math.min(4000, darknessMs + deltaMs);
        } else {
          consecutiveTouchMs = 0;
          darknessMs = Math.max(0, darknessMs - deltaMs * 1.55);
        }

        const nextBlackness = Math.min(0.94, darknessMs / 4000);
        if (Math.abs(nextBlackness - lastBlackness) > 0.012) {
          onBlacknessRef.current(nextBlackness);
          lastBlackness = nextBlackness;
        }

        if (consecutiveTouchMs >= 4000) {
          hasResolved = true;
          onBlacknessRef.current(1);
          onHydratedRef.current();
          return;
        }

        if (fill >= 1 && !isTouchingWater) {
          hasResolved = true;
          onBlacknessRef.current(0);
          onAvoidedRef.current();
          return;
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    resetFluid();
    startedAt = performance.now();
    lastFrame = startedAt;
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className={className ?? "ai-water-canvas"} aria-hidden="true" />;
}

function DrainText({ text, isDraining }: { text: string; isDraining: boolean }) {
  const letters = useMemo(
    () =>
      Array.from(text).map((letter, index) => ({
        letter,
        id: `${letter}-${index}`,
        x: Math.sin(index * 1.71) * 92,
        rotate: Math.sin(index * 0.94) * 260,
        delay: index * 0.035,
      })),
    [text],
  );

  return (
    <div className={`hydration-text ${isDraining ? "is-draining" : ""}`} aria-label={text}>
      {letters.map((letter) => (
        <span
          key={letter.id}
          aria-hidden="true"
          style={
            {
              "--drain-x": `${letter.x}px`,
              "--drain-rotate": `${letter.rotate}deg`,
              "--drain-delay": `${letter.delay}s`,
            } as CSSProperties
          }
        >
          {letter.letter === " " ? "\u00a0" : letter.letter}
        </span>
      ))}
    </div>
  );
}

function MeltingFinale({ text, isMelting }: { text: string; isMelting: boolean }) {
  const letters = useMemo(
    () =>
      Array.from(text).map((letter, index, all) => {
        const edgeDistance = Math.min(index, all.length - 1 - index);
        return {
          letter,
          id: `${letter}-${index}`,
          delay: edgeDistance * 0.16,
          x: Math.sin(index * 1.37) * 16,
          rotate: Math.sin(index * 0.73) * 18,
        };
      }),
    [text],
  );

  return (
    <div className={`apocalypse-text ${isMelting ? "is-melting" : ""}`} aria-label={text}>
      {letters.map((letter) => (
        <span
          className="apocalypse-letter"
          key={letter.id}
          aria-hidden="true"
          style={
            {
              "--melt-delay": `${letter.delay}s`,
              "--melt-x": `${letter.x}px`,
              "--melt-rotate": `${letter.rotate}deg`,
            } as CSSProperties
          }
        >
          {letter.letter === " " ? "\u00a0" : letter.letter}
        </span>
      ))}
    </div>
  );
}

function AnimalGameScene({ onNext }: { onNext: () => void }) {
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);
  const [acceptedWords, setAcceptedWords] = useState<string[]>([]);
  const [failureCount, setFailureCount] = useState(0);
  const [message, setMessage] = useState("");
  const [bursts, setBursts] = useState<RainbowBurst[]>([]);
  const [dustWords, setDustWords] = useState<DustWord[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const inputRef = useRef<HTMLInputElement>(null);
  const eventIdRef = useRef(0);
  const showHint = score >= 5 && failureCount >= 5;

  const acceptedSet = useMemo(
    () => new Set(acceptedWords.map((word) => normalizeEntry(word))),
    [acceptedWords],
  );

  useEffect(() => {
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 450);
    return () => window.clearTimeout(focusTimer);
  }, []);

  const removeBurst = (id: number) => {
    setBursts((current) => current.filter((burst) => burst.id !== id));
  };

  const launchCorrectBursts = () => {
    const nextBursts: RainbowBurst[] = [
      { id: eventIdRef.current + 1, side: "left" },
      { id: eventIdRef.current + 2, side: "right" },
    ];

    eventIdRef.current += 2;
    setBursts((current) => [...current, ...nextBursts]);
    nextBursts.forEach((burst) => {
      window.setTimeout(() => removeBurst(burst.id), 14800);
    });
  };

  const handleIncorrect = (word: string, isRiggedPhase: boolean) => {
    const dustId = eventIdRef.current + 1;
    eventIdRef.current += 1;

    setDustWords((current) => [...current, { id: dustId, word }]);
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 520);

    if (isRiggedPhase) {
      setFailureCount((current) => {
        setMessage(failureMessages[Math.min(current, failureMessages.length - 1)]);
        return current + 1;
      });
    } else if (acceptedSet.has(normalizeEntry(word))) {
      setMessage("already counted.");
    } else {
      setMessage("that's not an animal.");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (phase !== "playing") {
      return;
    }

    const nextWord = draft.trim();
    if (!nextWord) {
      return;
    }

    const normalized = normalizeEntry(nextWord);

    if (showHint && normalized === "disco dan") {
      setDraft("");
      setMessage("");
      setBursts([]);
      setDustWords([]);
      setPhase("crumbling");
      window.setTimeout(() => setPhase("complete"), 6200);
      return;
    }

    const isScorableAnimal =
      score < 5 && animalWords.has(normalized) && !acceptedSet.has(normalized);

    if (isScorableAnimal) {
      setScore((current) => current + 1);
      setAcceptedWords((current) => [...current, nextWord]);
      setMessage("");
      setDraft("");
      launchCorrectBursts();
      return;
    }

    handleIncorrect(nextWord, score >= 5);
    setDraft("");
  };

  return (
    <motion.section
      className="animal-game-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence mode="wait">
        {phase !== "complete" ? (
          <motion.div
            key="animal-game-active"
            className={`animal-game-content ${phase === "crumbling" ? "is-crumbling" : ""}`}
            initial={{ opacity: 0, y: 18 }}
            animate={
              phase === "crumbling"
                ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }
                : { opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }
            }
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{
              duration: 0.7,
              ease: phase === "crumbling" ? [0.33, 1, 0.68, 1] : [0.22, 1, 0.36, 1],
            }}
          >
            {phase === "crumbling" && <WindDustField />}
            <div className="game-heading">
              <AnimatePresence>
                {showHint && (
                  <motion.p
                    className="game-hint"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45 }}
                  >
                    {phase === "crumbling" ? (
                      <CrumblingText text="did you try disco dan?" />
                    ) : (
                      "did you try disco dan?"
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
              <h2>
                {phase === "crumbling" ? (
                  <CrumblingText text={animalGameTitle} />
                ) : (
                  animalGameTitle
                )}
              </h2>
              <p className="game-score">
                {phase === "crumbling" ? <CrumblingText text={`score ${score}`} /> : `score ${score}`}
              </p>
            </div>

            <form className="animal-game-form" onSubmit={handleSubmit}>
              <div className="game-input-shell">
                <motion.input
                  ref={inputRef}
                  className={isShaking ? "is-shaking" : ""}
                  aria-label="Name animals until failure"
                  autoComplete="off"
                  placeholder="type here"
                  disabled={phase !== "playing"}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <AnimatePresence>
                  {bursts.map((burst) => (
                    <RainbowShot key={burst.id} side={burst.side} />
                  ))}
                </AnimatePresence>
              </div>
            </form>

            <div className="submitted-words" aria-live="polite">
              <AnimatePresence>
                {acceptedWords.map((word) => (
                  <motion.span
                    key={`${normalizeEntry(word)}-${word}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    {phase === "crumbling" ? <CrumblingText text={word} /> : word}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="dust-zone" aria-hidden="true">
              <AnimatePresence>
                {dustWords.map((dustWord) => (
                  <DustWordBreak
                    key={dustWord.id}
                    word={dustWord.word}
                    onDone={() =>
                      setDustWords((current) =>
                        current.filter((currentWord) => currentWord.id !== dustWord.id),
                      )
                    }
                  />
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {message && (
                <motion.p
                  key={message}
                  className="game-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="animal-game-complete"
            className="game-complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="next-button" type="button" onClick={onNext}>
              next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function CrumblingText({ text }: { text: string }) {
  const pieces = useMemo(
    () =>
      Array.from(text).map((letter, index) => ({
        id: `${letter}-${index}`,
        letter,
        y: (Math.random() - 0.5) * 180,
        rotate: (Math.random() - 0.5) * 260,
        delay: Math.random() * 0.95,
        duration: Math.random() * 1.35 + 4.25,
      })),
    [text],
  );

  return (
    <span className="crumble-text" aria-label={text}>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="crumble-piece"
          aria-hidden="true"
          style={
            {
              "--crumble-y": `${piece.y}px`,
              "--crumble-rotate": `${piece.rotate}deg`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            } as CSSProperties
          }
        >
          {piece.letter === " " ? "\u00a0" : piece.letter}
        </span>
      ))}
    </span>
  );
}

function WindDustField() {
  const motes = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => ({
        id: index,
        left: Math.random() * 76 + 12,
        top: Math.random() * 58 + 20,
        size: Math.random() * 2.7 + 1.1,
        y: (Math.random() - 0.5) * 140,
        delay: Math.random() * 1.25,
        duration: Math.random() * 1.65 + 3.4,
        opacity: Math.random() * 0.46 + 0.32,
      })),
    [],
  );

  return (
    <div className="wind-dust-field" aria-hidden="true">
      {motes.map((mote) => (
        <span
          key={mote.id}
          style={
            {
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              opacity: mote.opacity,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.duration}s`,
              "--wind-y": `${mote.y}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function RainbowShot({ side }: { side: BurstSide }) {
  const distance = side === "left" ? "-60vw" : "60vw";
  const floatY = side === "left" ? [0, -8, 7, -4] : [0, 7, -8, 4];

  return (
    <motion.span
      className={`white-shot white-shot-${side}`}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.62 }}
      animate={{
        opacity: [0, 0.92, 0.62, 1, 0.72, 0],
        x: distance,
        y: floatY,
        scale: [0.62, 1, 0.86, 1.08, 0.92, 0.72],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 14.4,
        times: [0, 0.12, 0.34, 0.56, 0.82, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}

function DustWordBreak({ word, onDone }: { word: string; onDone: () => void }) {
  const letters = useMemo(
    () =>
      Array.from(word).map((letter) => ({
        letter,
        x: (Math.random() - 0.5) * 92,
        y: Math.random() * 52 + 28,
        rotate: (Math.random() - 0.5) * 70,
        delay: Math.random() * 0.12,
      })),
    [word],
  );

  useEffect(() => {
    const timer = window.setTimeout(onDone, 1050);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="dust-word"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden="true"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter.letter}-${index}`}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
          animate={{
            opacity: 0,
            x: letter.x,
            y: letter.y,
            rotate: letter.rotate,
            filter: "blur(6px)",
          }}
          transition={{ duration: 0.78, delay: letter.delay, ease: "easeOut" }}
        >
          {letter.letter === " " ? "\u00a0" : letter.letter}
        </motion.span>
      ))}
    </motion.div>
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

type FireParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  life: number;
  maxLife: number;
  seed: number;
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

function RainbowFireCanvas({
  targetRef,
}: {
  targetRef: { current: HTMLHeadingElement | null };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: FireParticle[] = [];
    const maxParticles = reducedMotion ? 80 : 260;
    const emitEveryMs = reducedMotion ? 96 : 28;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastEmit = 0;

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

    const getEmissionBounds = () => {
      const rect = targetRef.current?.getBoundingClientRect();

      if (!rect || rect.width < 1 || rect.height < 1) {
        return {
          left: width * 0.25,
          top: height * 0.42,
          width: width * 0.5,
          height: Math.max(80, height * 0.15),
        };
      }

      return rect;
    };

    const emitParticle = (bounds: DOMRect | ReturnType<typeof getEmissionBounds>, now: number) => {
      const across = Math.random();
      const fromLowerHalf = Math.random() > 0.18;
      const x = bounds.left + bounds.width * across + (Math.random() - 0.5) * 18;
      const y =
        bounds.top +
        bounds.height * (fromLowerHalf ? 0.44 + Math.random() * 0.64 : Math.random() * 0.4);

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.45,
        vy: -(Math.random() * 1.45 + 0.65),
        radius: Math.random() * 20 + 16,
        hue: (now * 0.035 + across * 250 + Math.random() * 70) % 360,
        life: 0,
        maxLife: Math.random() * 55 + 42,
        seed: Math.random() * Math.PI * 2,
      });
    };

    const drawFireParticle = (particle: FireParticle, alpha: number) => {
      const gradient = context.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius,
      );

      gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 78%, ${alpha * 0.62})`);
      gradient.addColorStop(0.36, `hsla(${(particle.hue + 32) % 360}, 100%, 62%, ${alpha * 0.3})`);
      gradient.addColorStop(1, `hsla(${(particle.hue + 80) % 360}, 100%, 54%, 0)`);

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    };

    const animate = (now: number) => {
      const delta = Math.min(2, (now - lastFrame) / 16.67);
      lastFrame = now;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      if (now - lastEmit > emitEveryMs) {
        const bounds = getEmissionBounds();
        const emitCount = reducedMotion ? 2 : 7;

        for (
          let index = 0;
          index < emitCount && particles.length < maxParticles;
          index += 1
        ) {
          emitParticle(bounds, now);
        }

        lastEmit = now;
      }

      particles.forEach((particle) => {
        particle.life += delta;
        particle.x +=
          (particle.vx + Math.sin(particle.seed + particle.life * 0.12) * 0.34) * delta;
        particle.y += particle.vy * delta;
        particle.vx *= 0.992;
        particle.vy -= 0.006 * delta;
        particle.radius += 0.18 * delta;
        particle.hue = (particle.hue + 0.7 * delta) % 360;

        const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
        drawFireParticle(particle, alpha);
      });

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        if (particles[index].life >= particles[index].maxLife) {
          particles.splice(index, 1);
        }
      }

      context.globalCompositeOperation = "source-over";
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [targetRef]);

  return <canvas ref={canvasRef} className="rainbow-fire-canvas" aria-hidden="true" />;
}

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
