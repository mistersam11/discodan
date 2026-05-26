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
  | "discoReturn"
  | "discoChrome"
  | "danflixLogo"
  | "danflix";

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

const animalWordList = Array.from(animalWords);

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

const chooseWordleTarget = (answers: Answers) => {
  const candidates = [answers.name, answers.date, answers.time]
    .map(normalizeWordleValue)
    .filter((entry) => entry.length === 5);

  return candidates[Math.floor(Math.random() * candidates.length)] ?? "DISCO";
};

const devSceneShortcuts: Record<string, Scene> = {
  animal: "animalGame",
  wordle: "wordleGame",
  xp: "workComputer",
  count: "discoReturn",
  countdown: "discoReturn",
  wiki: "discoChrome",
  danflix: "danflixLogo",
  netflix: "danflixLogo",
};

const getDevSceneShortcut = (key: AnswerKey, value: string) => {
  if (key !== "name") {
    return null;
  }

  return devSceneShortcuts[normalizeEntry(value)] ?? null;
};

const danflixDescription =
  "Regular Dan was a regular man. But Dan had an irregular plan. He spiked up his hair with jelly and crisco, and found that his calling in life was the disco.";

const danflixPosters = [
  "poster-one",
  "poster-two",
  "poster-three",
  "poster-four",
  "poster-five",
  "poster-six",
  "poster-seven",
  "poster-eight",
  "poster-nine",
  "poster-ten",
  "poster-eleven",
  "poster-twelve",
  "poster-thirteen",
  "poster-fourteen",
  "poster-fifteen",
  "poster-sixteen",
  "poster-seventeen",
  "poster-eighteen",
];

function App() {
  const [scene, setScene] = useState<Scene>("name");
  const [wordleAnswer, setWordleAnswer] = useState("DISCO");
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
    const shortcutScene = getDevSceneShortcut(key, value);
    if (shortcutScene) {
      setWordleAnswer("DISCO");
      setScene(shortcutScene);
      return;
    }

    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
    advance();
  };

  const startWordleGame = () => {
    setWordleAnswer(chooseWordleTarget(answers));
    setScene("wordleGame");
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
          <AnimalGameScene key="animal-game" onNext={startWordleGame} />
        )}

        {scene === "wordleGame" && (
          <WordleGameScene
            key="wordle-game"
            target={wordleAnswer}
            onNext={() => setScene("workComputer")}
          />
        )}

        {scene === "workComputer" && (
          <WorkComputerScene
            key="work-computer"
            onComplete={() => setScene("discoReturn")}
          />
        )}

        {scene === "discoReturn" && (
          <DiscoReturnScene key="disco-return" onNext={() => setScene("discoChrome")} />
        )}

        {scene === "discoChrome" && (
          <DiscoChromeScene key="disco-chrome" onNext={() => setScene("danflix")} />
        )}

        {scene === "danflixLogo" && (
          <DanflixLogoScene key="danflix-logo" onNext={() => setScene("danflix")} />
        )}

        {scene === "danflix" && (
          <DanflixScene key="danflix" />
        )}
      </AnimatePresence>
    </main>
  );
}

function DanflixLogoScene({ onNext }: { onNext: () => void }) {
  return (
    <motion.section
      className="disco-chrome-scene danflix-logo-skip-scene"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="danflix-reveal-button is-visible" type="button" onClick={onNext}>
        Danflix
      </button>
    </motion.section>
  );
}

function DanflixScene() {
  const [introComplete, setIntroComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroComplete(true), 2850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.section
      className="danflix-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <AnimatePresence mode="wait">
        {!introComplete ? (
          <DanflixIntro key="danflix-intro" />
        ) : isPlaying ? (
          <DanflixPlayer key="danflix-player" />
        ) : (
          <DanflixHome key="danflix-home" onPlay={() => setIsPlaying(true)} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function DanflixIntro() {
  return (
    <motion.div
      className="danflix-intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(14px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="danflix-intro-beams" aria-hidden="true" />
      <motion.h1
        className="danflix-intro-logo"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.82, 1, 1.08, 14],
          filter: ["blur(8px)", "blur(0px)", "blur(0px)", "blur(18px)"],
        }}
        transition={{
          duration: 2.7,
          times: [0, 0.22, 0.62, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        Danflix
      </motion.h1>
    </motion.div>
  );
}

function DanflixHome({ onPlay }: { onPlay: () => void }) {
  const posterStripRef = useRef<HTMLDivElement>(null);

  const scrollPosters = (direction: -1 | 1) => {
    const strip = posterStripRef.current;
    if (!strip) {
      return;
    }

    strip.scrollBy({
      left: direction * strip.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      className="danflix-home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="danflix-nav">
        <div className="danflix-logo">Danflix</div>
        <nav className="danflix-nav-links" aria-label="Danflix sections">
          <button type="button" disabled>TV Shows</button>
          <button type="button" disabled>Movies</button>
          <button type="button" disabled>My Lists</button>
        </nav>
      </header>

      <section className="danflix-feature" aria-label="Featured title">
        <div className="danflix-feature-copy">
          <p className="danflix-original">A Danflix Original</p>
          <h1 className="danflix-title-logo">
            <span>Disco Dan</span>
            <span>The Documentary</span>
          </h1>
          <p className="danflix-description">{danflixDescription}</p>
          <div className="danflix-actions">
            <button className="danflix-play-button" type="button" onClick={onPlay}>
              Play
            </button>
            <button className="danflix-info-button" type="button" disabled>
              More Info
            </button>
          </div>
        </div>
        <div className="danflix-feature-art" aria-label="Disco Dan: The Documentary image placeholder">
          <div className="danflix-disco-orbit" aria-hidden="true" />
          <div className="danflix-documentary-cover" aria-hidden="true">
            <span>Disco Dan</span>
            <span>The Documentary</span>
          </div>
          <p>Disco Dan: The Documentary</p>
        </div>
      </section>

      <section className="danflix-row" aria-label="Popular on Danflix">
        <div className="danflix-row-header">
          <h2>Popular on Danflix</h2>
          <div className="danflix-row-controls" aria-label="Popular on Danflix carousel controls">
            <button type="button" aria-label="Previous posters" onClick={() => scrollPosters(-1)}>
              {"<"}
            </button>
            <button type="button" aria-label="Next posters" onClick={() => scrollPosters(1)}>
              {">"}
            </button>
          </div>
        </div>
        <div className="danflix-row-frame">
          <button
            className="danflix-row-arrow danflix-row-arrow-left"
            type="button"
            aria-label="Previous posters"
            onClick={() => scrollPosters(-1)}
          >
            {"<"}
          </button>
          <div className="danflix-poster-strip" ref={posterStripRef}>
            {danflixPosters.map((posterClass, index) => (
              <article
                className={`danflix-poster ${posterClass}`}
                key={posterClass}
                style={{ "--poster-delay": `${index * 0.035}s` } as CSSProperties}
              >
                <span>Disco Dan</span>
              </article>
            ))}
          </div>
          <button
            className="danflix-row-arrow danflix-row-arrow-right"
            type="button"
            aria-label="Next posters"
            onClick={() => scrollPosters(1)}
          >
            {">"}
          </button>
        </div>
      </section>
    </motion.div>
  );
}

function DanflixPlayer() {
  return (
    <motion.div
      className="danflix-player"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="danflix-player-glow" aria-hidden="true" />
      <p className="danflix-player-kicker">Now Playing</p>
      <h1>Disco Dan: The Documentary</h1>
      <div className="danflix-progress" aria-hidden="true">
        <span />
      </div>
    </motion.div>
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
    if (getDevSceneShortcut(question.id, nextValue)) {
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
  { value: 9, at: 2200 },
  { value: 8, at: 4000 },
  { value: 7, at: 4160 },
  { value: 6, at: 4300 },
  { value: 5, at: 4420 },
  { value: 4, at: 4520 },
  { value: 3, at: 4610 },
  { value: 2, at: 4690 },
  { value: 1, at: 4760 },
  { value: 0, at: 4820 },
];

const discoReturnRevealAt = 5200;
const discoReturnNextAt = discoReturnRevealAt + 2400;

function DiscoReturnScene({ onNext }: { onNext: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState<DiscoReturnPhase>("countdown");
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const timers = discoReturnCountdown.map((step) =>
      window.setTimeout(() => setCount(step.value), step.at),
    );
    timers.push(window.setTimeout(() => setPhase("reveal"), discoReturnRevealAt));
    timers.push(window.setTimeout(() => setShowNext(true), discoReturnNextAt));

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
                transition={{ duration: count >= 9 ? 0.32 : 0.08 }}
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
              <AnimatePresence>
                {showNext && (
                  <div className="disco-return-next-anchor">
                    <motion.button
                      className="next-button"
                      type="button"
                      onClick={onNext}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    >
                      next
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

type DiscoChromePage = "disco" | "dan";
type CrabPhase = "idle" | "animalized" | "crabWave" | "scuttling" | "exploding" | "exploded";
type AnimalizedDanPage = {
  sourceWords: string[];
  headingWords: string[];
  summaryWords: string[];
};

type DiscoWikiSection = {
  heading?: string;
  paragraphs: string[];
};

const discoInfoLinks = [
  "Philadelphia soul",
  "funk",
  "psychedelic soul",
  "pop",
  "dance-pop",
  "house",
  "post-punk",
  "synth-pop",
  "Italo disco",
  "Cosmic disco",
  "Eurodisco",
  "Hi-NRG",
  "Disco polo",
  "Disco Demolition Night",
  "Saturday Night Fever",
  "Thank God It's Friday",
];

const discoWikiSections: DiscoWikiSection[] = [
  {
    paragraphs: [
      "Disco is a genre of dance music and a subculture that emerged in the late 1960s from the United States' urban nightlife scene, particularly in African-American, Italian-American, Latino and gay and lesbian communities. Its sound is typified by four-on-the-floor beats, syncopated basslines, string sections, brass and horns, electric pianos, synthesizers, and electric rhythm guitars.",
      "Discotheques as a venue were mostly a French invention, imported to the United States with the opening of Le Club, a members-only restaurant and nightclub located at 416 East 55th Street in Manhattan, by French expatriate Olivier Coquelin, on New Year's Eve 1960.[5]",
      "Disco music as a genre started as a mixture of music from venues popular among African Americans, Latino Americans, and Italian Americans[6] in New York City (especially Brooklyn) and Philadelphia during the late 1960s to the mid-to-late 1970s. Disco can be seen as a reaction by the 1960s counterculture to both the dominance of rock music and the stigmatization of dance music at the time.[7] Several dance styles were developed during the period of '70s disco's popularity in the United States, including \"the Bump\", \"the Hustle\", \"the Watergate\", \"the Continental\",[8] and \"the Busstop\".[9]",
      "During the 1970s, disco music was developed further, mainly by artists from the United States as well as from Europe.[10][11] While performers garnered public attention, record producers working behind the scenes played an important role in developing the genre. By the late 1970s, most major U.S. cities had thriving disco club scenes, and DJs would mix dance records at clubs such as Studio 54 in Manhattan, a venue popular among celebrities. Nightclub-goers often wore expensive, extravagant outfits, consisting predominantly of loose, flowing pants or dresses for ease of movement while dancing. There was also a thriving drug subculture in the disco scene, particularly for drugs that would enhance the experience of dancing to the loud music and the flashing lights, such as cocaine and quaaludes, the latter being so common in disco subculture that they were nicknamed \"disco biscuits\". Disco clubs were also associated with promiscuity as a reflection of the sexual revolution of this era in popular history. Films such as Saturday Night Fever (1977) and Thank God It's Friday (1978) contributed to disco's mainstream popularity.",
      "Disco declined as a major trend in popular music in the United States following the infamous Disco Demolition Night on July 12, 1979, and it continued to sharply decline in popularity in the U.S. during the early 1980s; however, it remained popular in Italy and some European countries throughout the 1980s, and during this time also started becoming trendy in places elsewhere including India[12] and the Middle East,[13] where aspects of disco were blended with regional folk styles such as ghazals and belly dancing. Disco would eventually become a key influence in the development of electronic dance music, house music, hip-hop, new wave, dance-punk, and post-disco. The style has had several revivals since the 1990s, and the influence of disco remains strong across American and European pop music. A revival has been underway since the early 2010s, coming to great popularity in the early 2020s. Modern day artists have continued the genre's popularity, bringing it to a whole new younger generation.[14][15]",
    ],
  },
  {
    heading: "Etymology",
    paragraphs: [
      "The term \"disco\" is shorthand for the word discotheque, a French word for \"library of phonograph records\" derived from \"bibliotheque\". The word \"discotheque\" had the same meaning in English in the 1950s. \"Discotheque\" became used in French for a type of nightclub in Paris, after they had resorted to playing records during the Nazi occupation in the early 1940s. Some clubs used it as their proper name. In 1960, it was also used to describe a Parisian nightclub in an English magazine.",
      "The Oxford English Dictionary defines Discotheque as \"A dance hall, nightclub, or similar venue where recorded music is played for dancing, typically equipped with a large dance floor, an elaborate system of flashing coloured lights, and a powerful amplified sound system. \" Its earliest example is use as the name of a particular venue in 1952, and other examples date from 1960 onwards. The entry is annotated as \"Now somewhat dated\".[16] It defines Disco as \"A genre of strongly rhythmical pop music mainly intended for dancing in nightclubs and particularly popular in the mid to late 1970s.\", with use from 1975 onwards, describing the origin of the word as a shortened form of discotheque.[17]",
    ],
  },
];

const discoWikiLinkTerms = [
  "Oxford English Dictionary",
  "Disco Demolition Night",
  "electronic dance music",
  "Thank God It's Friday",
  "Saturday Night Fever",
  "1960s counterculture",
  "Italian-American",
  "African-American",
  "four-on-the-floor",
  "electric pianos",
  "rhythm guitars",
  "record producers",
  "sexual revolution",
  "gay and lesbian",
  "Latino Americans",
  "African Americans",
  "Italian Americans",
  "string sections",
  "New York City",
  "Olivier Coquelin",
  "discotheques",
  "Discotheques",
  "discotheque",
  "Discotheque",
  "dance music",
  "subculture",
  "nightlife",
  "basslines",
  "syncopated",
  "brass",
  "horns",
  "synthesizers",
  "Le Club",
  "Manhattan",
  "Brooklyn",
  "Philadelphia",
  "rock music",
  "the Bump",
  "the Hustle",
  "the Watergate",
  "the Continental",
  "the Busstop",
  "Europe",
  "DJs",
  "mix",
  "Studio 54",
  "celebrities",
  "drug",
  "cocaine",
  "quaaludes",
  "promiscuity",
  "Italy",
  "India",
  "Middle East",
  "ghazals",
  "belly dancing",
  "house music",
  "hip-hop",
  "new wave",
  "dance-punk",
  "post-disco",
  "1990s",
  "2010s",
  "2020s",
  "genre",
  "Latino",
  "1960s",
  "1980s",
  "nightclub",
  "Paris",
].sort((a, b) => b.length - a.length);

const danSummary =
  'Disco Dan defeated 200 people to become the disco diva that we know today. After naming hundreds of animals without fail, he invented the New York Times and purchased the hit game Dandle, renaming it "Disco Dandle."';

function DiscoChromeScene({ onNext }: { onNext: () => void }) {
  const [page, setPage] = useState<DiscoChromePage>("disco");
  const [animalizedDanPage, setAnimalizedDanPage] = useState<AnimalizedDanPage | null>(null);
  const [crabPhase, setCrabPhase] = useState<CrabPhase>("idle");
  const [crabWaveProgress, setCrabWaveProgress] = useState(0);
  const crabTimersRef = useRef<number[]>([]);
  const crabWaveIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      crabTimersRef.current.forEach(window.clearTimeout);
      if (crabWaveIntervalRef.current !== null) {
        window.clearInterval(crabWaveIntervalRef.current);
      }
    };
  }, []);

  const navigateToDan = () => {
    setPage("dan");
    setAnimalizedDanPage(null);
    setCrabPhase("idle");
    setCrabWaveProgress(0);
    crabTimersRef.current.forEach(window.clearTimeout);
    crabTimersRef.current = [];
    if (crabWaveIntervalRef.current !== null) {
      window.clearInterval(crabWaveIntervalRef.current);
      crabWaveIntervalRef.current = null;
    }
  };

  const animalizeDan = () => {
    setAnimalizedDanPage({
      sourceWords: animalWordsFromText("From Wikipedia, the free encyclopedia"),
      headingWords: animalWordsFromText("Summary"),
      summaryWords: animalWordsFromText(danSummary),
    });
    setCrabPhase("animalized");
    setCrabWaveProgress(0);
  };

  const startCrabSequence = () => {
    if (crabPhase !== "animalized") {
      return;
    }

    crabTimersRef.current.forEach(window.clearTimeout);
    if (crabWaveIntervalRef.current !== null) {
      window.clearInterval(crabWaveIntervalRef.current);
    }

    const waveDuration = 5000;
    const allCrabHold = 300;
    const scuttleDuration = 2600;
    const fragmentDuration = 12000;
    const waveStartedAt = window.performance.now();

    setCrabWaveProgress(0);
    setCrabPhase("crabWave");
    crabWaveIntervalRef.current = window.setInterval(() => {
      const progress = Math.min(1, (window.performance.now() - waveStartedAt) / waveDuration);
      setCrabWaveProgress(progress);

      if (progress >= 1 && crabWaveIntervalRef.current !== null) {
        window.clearInterval(crabWaveIntervalRef.current);
        crabWaveIntervalRef.current = null;
      }
    }, 90);

    crabTimersRef.current = [
      window.setTimeout(() => {
        setCrabWaveProgress(1);
        if (crabWaveIntervalRef.current !== null) {
          window.clearInterval(crabWaveIntervalRef.current);
          crabWaveIntervalRef.current = null;
        }
      }, waveDuration),
      window.setTimeout(() => {
        setCrabPhase("scuttling");
      }, waveDuration + allCrabHold),
      window.setTimeout(() => setCrabPhase("exploding"), waveDuration + allCrabHold + scuttleDuration),
      window.setTimeout(() => setCrabPhase("exploded"), waveDuration + allCrabHold + scuttleDuration + fragmentDuration),
    ];
  };

  return (
    <motion.section
      className="disco-chrome-scene"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        className={`danflix-reveal-button ${crabPhase === "exploded" ? "is-visible" : ""}`}
        type="button"
        onClick={onNext}
        disabled={crabPhase !== "exploded"}
      >
        Danflix
      </button>
      {(crabPhase === "exploding" || crabPhase === "exploded") && (
        <ChromeFragmentExplosion animalizedPage={animalizedDanPage} />
      )}
      <div
        className={`disco-browser-window ${
          crabPhase === "exploding" || crabPhase === "exploded" ? "is-blasted" : ""
        }`}
      >
        <div className="disco-browser-tabs">
          <div className="disco-browser-tab is-active">
            <span className="disco-tab-dot" aria-hidden="true" />
            <span>{page === "disco" ? "Disco - Wikipedia" : "Dan - Wikipedia"}</span>
          </div>
          <div className="disco-browser-title">Disco Chrome</div>
        </div>
        <div className="disco-browser-toolbar">
          <button type="button" aria-label="Back">&lt;</button>
          <button type="button" aria-label="Forward">&gt;</button>
          <button type="button" aria-label="Reload">r</button>
          <div className="disco-address-bar">
            {page === "disco" ? "https://en.wikipedia.org/wiki/Disco" : "https://en.wikipedia.org/wiki/Dan"}
          </div>
        </div>
        <article className="fake-wiki-page">
          {page === "disco" ? (
            <DiscoWikiArticle onNavigateDan={navigateToDan} />
          ) : (
            <DanWikiArticle
              animalizedPage={animalizedDanPage}
              crabPhase={crabPhase}
              crabWaveProgress={crabWaveProgress}
              onAnimalize={animalizeDan}
              onCrabClick={startCrabSequence}
            />
          )}
        </article>
      </div>
    </motion.section>
  );
}

function DiscoWikiArticle({ onNavigateDan }: { onNavigateDan: () => void }) {
  return (
    <div className="fake-wiki-layout">
      <aside className="fake-wiki-sidebar" aria-label="Article contents">
        <p>Contents</p>
        <ol>
          <li>Etymology</li>
          <li>Musical characteristics</li>
          <li>Club culture</li>
          <li>History</li>
          <li>Legacy</li>
        </ol>
      </aside>
      <div className="fake-wiki-main">
        <p className="fake-wiki-source">From Wikipedia, the free encyclopedia</p>
        <h1>Disco</h1>
        <p className="fake-wiki-description">Music genre and subculture</p>
        <div className="fake-wiki-notice">
          For more information on disco, see the page on <i>Dance Pants Revolution</i>.
        </div>
        <div className="fake-wiki-infobox">
          <h2>Disco</h2>
          <p>Stylistic origins</p>
          <div>
            {discoInfoLinks.slice(0, 4).map((link) => (
              <WikiButton key={link} onNavigateDan={onNavigateDan} text={link} />
            ))}
          </div>
          <p>Derivative forms</p>
          <div>
            {discoInfoLinks.slice(4, 9).map((link) => (
              <WikiButton key={link} onNavigateDan={onNavigateDan} text={link} />
            ))}
          </div>
          <p>Subgenres and topics</p>
          <div>
            {discoInfoLinks.slice(9).map((link) => (
              <WikiButton key={link} onNavigateDan={onNavigateDan} text={link} />
            ))}
          </div>
        </div>
        {discoWikiSections.map((section, sectionIndex) => (
          <section key={section.heading ?? `lead-${sectionIndex}`}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{renderLinkedWikiText(paragraph, onNavigateDan)}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function DanWikiArticle({
  animalizedPage,
  crabPhase,
  crabWaveProgress,
  onAnimalize,
  onCrabClick,
}: {
  animalizedPage: AnimalizedDanPage | null;
  crabPhase: CrabPhase;
  crabWaveProgress: number;
  onAnimalize: () => void;
  onCrabClick: () => void;
}) {
  if (animalizedPage) {
    return (
      <div className={`fake-wiki-main fake-wiki-dan is-animalized is-${crabPhase}`}>
        <p className="fake-wiki-source">
          <AnimalizedWords words={animalizedPage.sourceWords} phase={crabPhase} crabWaveProgress={crabWaveProgress} />
        </p>
        <h1>
          <button
            className="fake-wiki-link crab-title-link"
            type="button"
            onClick={onCrabClick}
          >
            crab
          </button>
        </h1>
        <h2>
          <AnimalizedWords words={animalizedPage.headingWords} phase={crabPhase} crabWaveProgress={crabWaveProgress} />
        </h2>
        <p>
          <AnimalizedWords words={animalizedPage.summaryWords} phase={crabPhase} crabWaveProgress={crabWaveProgress} />
        </p>
      </div>
    );
  }

  return (
    <div className="fake-wiki-main fake-wiki-dan">
      <p className="fake-wiki-source">From Wikipedia, the free encyclopedia</p>
      <h1>Dan</h1>
      <h2>Summary</h2>
      <p>
        Disco Dan defeated 200 people to become the disco diva that we know today. After naming hundreds of
        animals without fail, he invented the New York Times and purchased the hit game Dandle, renaming it{" "}
        &quot;
        <button className="fake-wiki-link" type="button" onClick={onAnimalize}>
          Disco Dandle
        </button>
        .&quot;
      </p>
    </div>
  );
}

function WikiButton({
  onNavigateDan,
  text,
}: {
  onNavigateDan: () => void;
  text: string;
}) {
  return (
    <button className="fake-wiki-link" type="button" onClick={onNavigateDan}>
      {text}
    </button>
  );
}

function renderLinkedWikiText(text: string, onNavigateDan: () => void) {
  const linkLookup = new Set(discoWikiLinkTerms.map((term) => term.toLowerCase()));
  const linkPattern = new RegExp(
    `(${discoWikiLinkTerms.map(escapeRegex).join("|")})`,
    "gi",
  );

  return text.split(linkPattern).map((part, index) => {
    if (linkLookup.has(part.toLowerCase())) {
      return <WikiButton key={`${part}-${index}`} onNavigateDan={onNavigateDan} text={part} />;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function animalWordsFromText(text: string) {
  const words = text.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) ?? [];
  return words.map(() => randomAnimalWord());
}

function randomAnimalWord() {
    const animal = animalWordList[Math.floor(Math.random() * animalWordList.length)] ?? "alpaca";
    return animal;
}

function AnimalizedWords({
  words,
  phase,
  crabWaveProgress,
}: {
  words: string[];
  phase: CrabPhase;
  crabWaveProgress: number;
}) {
  const isScuttling = phase === "scuttling" || phase === "exploding" || phase === "exploded";

  return (
    <>
      {words.map((word, index) => {
        const turnThreshold = Math.pow((index + 1) / Math.max(1, words.length), 0.72);
        const hasTurnedToCrab =
          isScuttling || (phase === "crabWave" && crabWaveProgress >= turnThreshold);
        const side = index % 2 === 0 ? -1 : 1;
        const distance = 58 + (index % 11) * 7;
        const y = Math.sin(index * 1.9) * 2.3;

        return (
          <span
            className={`animalized-word ${isScuttling ? "is-scuttling" : ""}`}
            key={`${word}-${index}`}
            style={
              {
                "--scuttle-delay": `${Math.min(0.75, index * 0.018)}s`,
                "--scuttle-x": `${side * distance}vw`,
                "--scuttle-y": `${y}rem`,
              } as CSSProperties
            }
          >
            {hasTurnedToCrab ? "crab" : word}
          </span>
        );
      })}
    </>
  );
}

function ChromeFragmentExplosion({ animalizedPage }: { animalizedPage: AnimalizedDanPage | null }) {
  const fragments = useMemo(() => {
    const columns = 20;
    const rows = 15;

    return Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const fromCenterX = (column + 0.5) / columns - 0.5;
      const fromCenterY = (row + 0.5) / rows - 0.5;
      const distance = Math.max(0.15, Math.sqrt(fromCenterX * fromCenterX + fromCenterY * fromCenterY));
      const chipA = 6 + ((index * 11) % 18);
      const chipB = 12 + ((index * 7) % 22);
      const chipC = 76 + ((index * 5) % 18);
      const chipD = 72 + ((index * 13) % 23);
      const clipPath =
        index % 4 === 0
          ? `polygon(0 ${chipA}%, ${chipB}% 0, 100% ${chipA / 2}%, ${chipC}% 100%, ${chipB / 2}% ${chipD}%)`
          : index % 4 === 1
            ? `polygon(${chipA}% 0, 100% ${chipB}%, ${chipD}% 100%, 0 ${chipC}%, 0 ${chipB / 2}%)`
            : index % 4 === 2
              ? `polygon(0 0, ${chipC}% ${chipA / 2}%, 100% ${chipD}%, ${chipB}% 100%, 0 ${chipC}%)`
              : `polygon(${chipB}% 0, 100% 0, ${chipC}% 100%, ${chipA / 2}% ${chipD}%, 0 ${chipB}%)`;

      return {
        id: index,
        column,
        row,
        columns,
        rows,
        clipPath,
        dx: (fromCenterX / distance) * (88 + (index % 9) * 9),
        dy: (fromCenterY / distance) * (76 + (index % 11) * 8),
        rotate: fromCenterX * 430 + fromCenterY * 270 + (index % 17) * 19,
        delay: (column + row) * 0.0035,
      };
    });
  }, []);

  return (
    <div className="chrome-fragment-layer" aria-hidden="true">
      <div className="chrome-fragment-stage">
        {fragments.map((fragment) => (
          <span
            className="chrome-fragment"
            key={fragment.id}
            style={
              {
                left: `${(fragment.column / fragment.columns) * 100}%`,
                top: `${(fragment.row / fragment.rows) * 100}%`,
                width: `${100 / fragment.columns}%`,
                height: `${100 / fragment.rows}%`,
                clipPath: fragment.clipPath,
                "--snapshot-width": `${fragment.columns * 100}%`,
                "--snapshot-height": `${fragment.rows * 100}%`,
                "--snapshot-x": `${-(fragment.column / fragment.columns) * 100}%`,
                "--snapshot-y": `${-(fragment.row / fragment.rows) * 100}%`,
                "--frag-x": `${fragment.dx}vw`,
                "--frag-y": `${fragment.dy}vh`,
                "--frag-rotate": `${fragment.rotate}deg`,
                "--frag-delay": `${fragment.delay}s`,
              } as CSSProperties
            }
          >
            <span className="chrome-fragment-snapshot">
              <DiscoChromeSnapshot animalizedPage={animalizedPage} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DiscoChromeSnapshot({ animalizedPage }: { animalizedPage: AnimalizedDanPage | null }) {
  const sourceWords = animalizedPage?.sourceWords ?? animalWordsFromText("From Wikipedia, the free encyclopedia");
  const headingWords = animalizedPage?.headingWords ?? animalWordsFromText("Summary");
  const summaryWords = animalizedPage?.summaryWords ?? animalWordsFromText(danSummary);

  return (
    <div className="disco-browser-window chrome-fragment-snapshot-window">
      <div className="disco-browser-tabs">
        <div className="disco-browser-tab is-active">
          <span className="disco-tab-dot" aria-hidden="true" />
          <span>Dan - Wikipedia</span>
        </div>
        <div className="disco-browser-title">Disco Chrome</div>
      </div>
      <div className="disco-browser-toolbar">
        <span aria-hidden="true">&lt;</span>
        <span aria-hidden="true">&gt;</span>
        <span aria-hidden="true">r</span>
        <div className="disco-address-bar">https://en.wikipedia.org/wiki/Dan</div>
      </div>
      <article className="fake-wiki-page">
        <div className="fake-wiki-main fake-wiki-dan is-animalized">
          <p className="fake-wiki-source">{sourceWords.map(() => "crab").join(" ")}</p>
          <h1>
            <span className="fake-wiki-link crab-title-link">crab</span>
          </h1>
          <h2>{headingWords.map(() => "crab").join(" ")}</h2>
          <p>{summaryWords.map(() => "crab").join(" ")}</p>
        </div>
      </article>
    </div>
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

function WordleGameScene({ target, onNext }: { target: string; onNext: () => void }) {
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
