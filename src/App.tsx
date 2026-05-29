import { memo, type CSSProperties, type FormEvent, type MouseEvent, type MutableRefObject, type PointerEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AnswerKey = "name" | "date" | "time";
type Scene =
  | AnswerKey
  | "code"
  | "story"
  | "discoReveal"
  | "finale"
  | "animalGame"
  | "wordleGame"
  | "workComputer"
  | "discoReturn"
  | "discoChrome"
  | "danflixLogo"
  | "danflix"
  | "forgiveness"
  | "wordSearch"
  | "charity";

type Answers = Record<AnswerKey, string>;
type PerformanceMode = "full" | "reduced";

type NavigatorPerformanceHints = Navigator & {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
};

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

const sceneOrder: Scene[] = ["name", "date", "time", "code", "story", "discoReveal"];

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

const blogUrl = "https://blog.samsworkputer.com";

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
  jeopardy: "forgiveness",
  charity: "charity",
  finale: "finale",
  search: "wordSearch",
  wordsearch: "wordSearch",
  "word search": "wordSearch",
};

const getDevSceneShortcut = (key: AnswerKey, value: string) => {
  if (key !== "name") {
    return null;
  }

  return devSceneShortcuts[normalizeEntry(value)] ?? null;
};

const isBlogShortcut = (key: AnswerKey, value: string) =>
  key === "name" && normalizeEntry(value) === "blog";

const danflixDescription =
  "Regular Dan was a regular man. But Dan had an irregular plan. He spiked up his hair with jelly and crisco, and found that his calling in life was the disco.";

type DanflixPosterWord = {
  text: "Disco" | "Dan";
  vertical?: boolean;
};

type DanflixPoster = {
  id: string;
  className: string;
  image: string;
  words: DanflixPosterWord[];
};

const danflixImage = (fileName: string) => `/danflix/${fileName}`;

const danflixPosters: DanflixPoster[] = [
  {
    id: "fog-dance",
    className: "poster-one",
    image: danflixImage("sergiu-baica-5hCneY6YeFQ-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan" }],
  },
  {
    id: "cream-dan",
    className: "poster-two",
    image: danflixImage("klara-kulikova-x6_nIirpjKc-unsplash.jpg"),
    words: [{ text: "Dan", vertical: true }],
  },
  {
    id: "volcano-disco",
    className: "poster-three",
    image: danflixImage("alain-bonnardeaux-tLxGw_ITs7k-unsplash.jpg"),
    words: [{ text: "Disco" }],
  },
  {
    id: "number-one-dan",
    className: "poster-four",
    image: danflixImage("alex-sheldon-n6EdYIwpqp4-unsplash.jpg"),
    words: [{ text: "Disco", vertical: true }, { text: "Dan" }],
  },
  {
    id: "portrait-dan",
    className: "poster-five",
    image: danflixImage("jonathan-cosens-photography-BnIgRIBKZX8-unsplash.jpg"),
    words: [{ text: "Dan" }],
  },
  {
    id: "warehouse-disco",
    className: "poster-six",
    image: danflixImage("lance-chang-h3pVxOIpnzk-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan" }],
  },
  {
    id: "jungle-disco",
    className: "poster-seven",
    image: danflixImage("hanna-lazar-CRkxVYeYIso-unsplash.jpg"),
    words: [{ text: "Disco", vertical: true }],
  },
  {
    id: "rabbit-dan",
    className: "poster-eight",
    image: danflixImage("waranya-mooldee-Efj0HGPdPKs-unsplash.jpg"),
    words: [{ text: "Dan" }],
  },
  {
    id: "produce-dance",
    className: "poster-nine",
    image: danflixImage("nrd-D6Tu_L3chLE-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan" }],
  },
  {
    id: "aurora-dan",
    className: "poster-ten",
    image: danflixImage("nicolas-j-leclercq-va_nrBLonf8-unsplash.jpg"),
    words: [{ text: "Disco", vertical: true }, { text: "Dan" }],
  },
  {
    id: "shore-disco",
    className: "poster-eleven",
    image: danflixImage("adam-jang-MLKrf51NV8w-unsplash.jpg"),
    words: [{ text: "Disco" }],
  },
  {
    id: "library-dan",
    className: "poster-twelve",
    image: danflixImage("pickawood-YbLitAY8bPA-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan" }],
  },
  {
    id: "castle-disco",
    className: "poster-thirteen",
    image: danflixImage("k-mitch-hodge-QFQcqINA6UM-unsplash.jpg"),
    words: [{ text: "Disco" }],
  },
  {
    id: "blue-dan",
    className: "poster-fourteen",
    image: danflixImage("evgeniy-prokofiev-2kazXeobLfM-unsplash.jpg"),
    words: [{ text: "Dan", vertical: true }],
  },
  {
    id: "holiday-disco",
    className: "poster-fifteen",
    image: danflixImage("gene-gallin-D9AmgxR4Lko-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan" }],
  },
  {
    id: "mirrorball-disco",
    className: "poster-sixteen",
    image: danflixImage("matthew-lejune-onKZfGmLmgo-unsplash.jpg"),
    words: [{ text: "Disco" }],
  },
  {
    id: "fish-dance",
    className: "poster-seventeen",
    image: danflixImage("david-clode-ekthrVC_DVs-unsplash.jpg"),
    words: [{ text: "Disco" }, { text: "Dan", vertical: true }],
  },
  {
    id: "cupcake-dan",
    className: "poster-eighteen",
    image: danflixImage("brooke-lark-pGM4sjt_BdQ-unsplash.jpg"),
    words: [{ text: "Dan" }],
  },
];

function getPerformanceMode(): PerformanceMode {
  if (typeof window === "undefined") {
    return "full";
  }

  const nav = window.navigator as NavigatorPerformanceHints;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const compactViewport = window.matchMedia("(max-width: 740px)").matches;
  const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const saveData = Boolean(nav.connection?.saveData);

  return prefersReducedMotion || coarsePointer || compactViewport || lowCpu || lowMemory || saveData
    ? "reduced"
    : "full";
}

function usePerformanceMode() {
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(getPerformanceMode);

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(max-width: 740px)"),
    ];
    const updatePerformanceMode = () => setPerformanceMode(getPerformanceMode());

    mediaQueries.forEach((query) => query.addEventListener("change", updatePerformanceMode));
    window.addEventListener("resize", updatePerformanceMode);

    return () => {
      mediaQueries.forEach((query) => query.removeEventListener("change", updatePerformanceMode));
      window.removeEventListener("resize", updatePerformanceMode);
    };
  }, []);

  return performanceMode;
}

function App() {
  const [scene, setScene] = useState<Scene>("name");
  const [wordleAnswer, setWordleAnswer] = useState("DISCO");
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    date: "",
    time: "",
  });
  const performanceMode = usePerformanceMode();

  const currentQuestion = questions.find((question) => question.id === scene);

  const advance = () => {
    const nextScene = sceneOrder[sceneOrder.indexOf(scene) + 1];
    if (nextScene) {
      setScene(nextScene);
    }
  };

  const saveAnswer = (key: AnswerKey, value: string) => {
    if (isBlogShortcut(key, value)) {
      window.location.assign(blogUrl);
      return;
    }

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
    <main className="experience-shell" data-performance-mode={performanceMode}>
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

        {scene === "discoReveal" && (
          <DiscoDanRevealScene
            key="disco-reveal"
            performanceMode={performanceMode}
            onStart={() => setScene("animalGame")}
          />
        )}

        {scene === "finale" && (
          <FinaleScene
            key="finale"
            performanceMode={performanceMode}
          />
        )}

        {scene === "animalGame" && (
          <AnimalGameScene key="animal-game" onNext={startWordleGame} />
        )}

        {scene === "wordleGame" && (
          <WordleGameScene
            key="wordle-game"
            target={wordleAnswer}
            onNext={() => setScene("wordSearch")}
          />
        )}

        {scene === "wordSearch" && (
          <WordSearchScene
            key="word-search"
            performanceMode={performanceMode}
            onNext={() => setScene("workComputer")}
          />
        )}

        {scene === "workComputer" && (
          <WorkComputerScene
            key="work-computer"
            performanceMode={performanceMode}
            onComplete={() => setScene("danflix")}
          />
        )}

        {scene === "discoReturn" && (
          <DiscoReturnScene
            key="disco-return"
            performanceMode={performanceMode}
            onNext={() => setScene("discoChrome")}
          />
        )}

        {scene === "discoChrome" && (
          <DiscoChromeScene key="disco-chrome" onNext={() => setScene("danflix")} />
        )}

        {scene === "danflixLogo" && (
          <DanflixLogoScene key="danflix-logo" onNext={() => setScene("danflix")} />
        )}

        {scene === "danflix" && (
          <DanflixScene key="danflix" onNext={() => setScene("forgiveness")} />
        )}

        {scene === "forgiveness" && (
          <ForgivenessScene
            key="forgiveness"
            onFinale={() => setScene("finale")}
            performanceMode={performanceMode}
            playerName={answers.name}
          />
        )}

        {scene === "charity" && (
          <CharitySimulatorScene
            key="charity-shortcut"
            initialBalance={0}
            onNext={() => setScene("finale")}
            performanceMode={performanceMode}
          />
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

function DanflixScene({ onNext }: { onNext: () => void }) {
  const [introComplete, setIntroComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroComplete(true), 2100);
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
      {isPlaying ? (
        <AnimatePresence mode="wait">
          <DanflixPlayer key="danflix-player" onNext={onNext} />
        </AnimatePresence>
      ) : (
        <>
          <DanflixHome key="danflix-home" onPlay={() => setIsPlaying(true)} />
          <AnimatePresence>
            {!introComplete && <DanflixIntro key="danflix-intro" />}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
}

type JeopardyPhase =
  | "clock"
  | "logo"
  | "podiumsIntro"
  | "board"
  | "question"
  | "choice"
  | "result"
  | "finalCard"
  | "standings"
  | "finalIntro"
  | "finalQuestion"
  | "charityGate"
  | "charity";

type JeopardyContestant = {
  id: "dan-left" | "dan-center" | "player";
  name: string;
};

type JeopardyQuestion = {
  id: string;
  category: "DISCO" | "DAN";
  value: number;
  clue: string;
  answer: string;
  options: string[];
  allAnswersWrong?: boolean;
};

type JeopardyQuestionSeed = Omit<JeopardyQuestion, "category" | "value">;

type JeopardySpeechBubble = {
  contestantIndex: number;
  text: string;
};

type JeopardyResult = {
  contestantIndex: number;
  text: string;
  speechBubbles?: JeopardySpeechBubble[];
};

type JeopardyScoreFlash = {
  contestantIndex: number;
  tone: "positive" | "negative";
};

type JeopardyStanding = {
  contestantIndex: number;
  name: string;
  place: number;
  score: number;
};

type FinalJeopardyChoice = "yes" | "no";

type CharityPhysicsApi = {
  setCleanupFlamethrower: (state: CharityCleanupFlamethrowerState) => void;
  setFlaming: (isFlaming: boolean) => void;
  shardIce: () => void;
  spawnCoin: () => void;
  startGoldCleanup: () => void;
};

type CharityCleanupFlamethrowerState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean;
};

type CharityCoin = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  va: number;
};

type CharityParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  canBurnCoin?: boolean;
  canBurnItem?: boolean;
};

type JeopardyTileOrigin = {
  left: number;
  top: number;
  width: number;
  height: number;
  targetLeft: number;
  targetTop: number;
  targetWidth: number;
  targetHeight: number;
};

const jeopardyCategories = ["POTPOURRI", "POTPOURRI", "DISCO", "DAN", "POTPOURRI", "POTPOURRI"] as const;
const jeopardyValues = [100, 200, 400, 800, 1000];
const jeopardyPlayableCategories = ["DISCO", "DAN"] as const;

function shuffleItems<T>(items: T[]) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];
    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
}

const jeopardyQuestionSeeds: JeopardyQuestionSeed[] = [
  {
    id: "disco-dandle",
    clue: "This is the hit game purchased and renamed by Disco Dan.",
    answer: "Disco Dandle",
    options: ["Disco Dandle", "Dandle Disco", "Dan Discodle", "Discodle Dan"],
  },
  {
    id: "dan-died",
    clue: "Dan died on this day.",
    answer: "1965",
    options: ["Wednesday", "1965", "Wednesday", "Wednesday"],
  },
  {
    id: "dan-born",
    clue: "Dan was born on this day.",
    answer: "1965",
    options: ["Black Friday", "Good Friday", "Maundy Friday", "1965"],
  },
  {
    id: "danflix-suspension",
    clue: "This streaming service suspends accounts which were shared with a man in a business suit.",
    answer: "Danflix",
    options: ["Michaelsoft Excel", "Michaelsoft Excel", "The New York Times", "Danflix"],
  },
  {
    id: "eight-pm",
    clue: "This is what Dan does after the clock reaches eight in the evening.",
    answer: "Watch TV",
    options: ["Watch TV", "Observe the telly", "Eat in front of the tv", "Dance (tv)"],
  },
  {
    id: "favorite-animal",
    clue: "This is Disco Dan's favorite animal.",
    answer: "disco dan",
    options: ["pig", "cat", "disco dan", "sheep"],
  },
  {
    id: "probability-paradox",
    clue: "If you choose an answer to this question at random, what is the probability that you will be correct?",
    answer: "",
    options: ["25%", "50%", "60%", "25%."],
    allAnswersWrong: true,
  },
  {
    id: "map-riddle",
    clue: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish.",
    answer: "not a map",
    options: ["a map", "a map", "a map", "not a map"],
  },
  {
    id: "hair-gel",
    clue: "This is Disco Dan's favorite hair gel.",
    answer: "Crisco",
    options: ["Dan's Hair Gel", "Dapper Dan", "Crisco", "Dancumentary Sauce"],
  },
  {
    id: "jeopardy-feeling",
    clue: "This is how you feel about Jeopardy.",
    answer: "well",
    options: ["good", "real good", "pretty good", "well"],
  },
];

const jeopardyQuestionSlots = jeopardyPlayableCategories.flatMap((category) =>
  jeopardyValues.map((value) => ({ category, value })),
);

const jeopardyQuestions: JeopardyQuestion[] = shuffleItems(jeopardyQuestionSeeds).map((question, index) => {
  const slot = jeopardyQuestionSlots[index % jeopardyQuestionSlots.length];

  return {
    ...question,
    category: slot.category,
    value: slot.value,
    id: `${slot.category.toLowerCase()}-${slot.value}-${question.id}`,
  };
});

const getJeopardyQuestion = (category: string, value: number) =>
  jeopardyQuestions.find((question) => question.category === category && question.value === value);

function getPlayerJeopardyName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "funko";
}

function formatJeopardyMoney(score: number) {
  const roundedScore = Math.round(score);
  const prefix = roundedScore < 0 ? "-$" : "$";

  return `${prefix}${Math.abs(roundedScore).toLocaleString("en-US")}`;
}

function getJeopardyQuestionWords(question: JeopardyQuestion | null) {
  return question?.clue.match(/\S+/g) ?? [];
}

function getRandomDanIndex() {
  return Math.random() > 0.5 ? 0 : 1;
}

function getPotpourriTileId(columnIndex: number, value: number) {
  return `potpourri-${columnIndex}-${value}`;
}

function getAllPotpourriTileIds() {
  return jeopardyCategories.flatMap((category, columnIndex) =>
    category === "POTPOURRI"
      ? jeopardyValues.map((value) => getPotpourriTileId(columnIndex, value))
      : [],
  );
}

function getJeopardyStandings(contestants: JeopardyContestant[], scores: number[]): JeopardyStanding[] {
  return contestants
    .map((contestant, contestantIndex) => ({
      contestantIndex,
      name: contestant.name,
      score: scores[contestantIndex] ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.contestantIndex - b.contestantIndex)
    .map((standing, index) => ({
      ...standing,
      place: index + 1,
    }));
}

function ForgivenessScene({
  onFinale,
  performanceMode,
  playerName,
}: {
  onFinale: () => void;
  performanceMode: PerformanceMode;
  playerName: string;
}) {
  const displayName = getPlayerJeopardyName(playerName);
  const contestants: JeopardyContestant[] = useMemo(
    () => [
      { id: "dan-left", name: "Dan" },
      { id: "dan-center", name: "Dan" },
      { id: "player", name: displayName },
    ],
    [displayName],
  );
  const [phase, setPhase] = useState<JeopardyPhase>("clock");
  const [showClockTime, setShowClockTime] = useState(false);
  const [showClockCaption, setShowClockCaption] = useState(false);
  const [isClockLeaving, setIsClockLeaving] = useState(false);
  const [scores, setScores] = useState([0, 0, 0]);
  const [scoreFlash, setScoreFlash] = useState<JeopardyScoreFlash | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [missingPotpourriIds, setMissingPotpourriIds] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<JeopardyQuestion | null>(null);
  const [questionOrigin, setQuestionOrigin] = useState<JeopardyTileOrigin | null>(null);
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [buzzState, setBuzzState] = useState<"ready" | "tooEarly">("ready");
  const [choiceSeconds, setChoiceSeconds] = useState(8);
  const [result, setResult] = useState<JeopardyResult | null>(null);
  const timersRef = useRef<number[]>([]);

  const questionWords = useMemo(() => getJeopardyQuestionWords(selectedQuestion), [selectedQuestion]);
  const usedQuestionIdSet = useMemo(() => new Set(usedQuestionIds), [usedQuestionIds]);
  const missingPotpourriIdSet = useMemo(() => new Set(missingPotpourriIds), [missingPotpourriIds]);

  const clearJeopardyTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setShowClockTime(true), 5600),
      window.setTimeout(() => setShowClockCaption(true), 6800),
      window.setTimeout(() => setIsClockLeaving(true), 8600),
      window.setTimeout(() => setPhase("logo"), 9500),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      clearJeopardyTimers();
    };
  }, []);

  useEffect(() => {
    if (phase !== "podiumsIntro") {
      return undefined;
    }

    const timer = window.setTimeout(() => setPhase("board"), 4000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "question" || !selectedQuestion) {
      return undefined;
    }

    setRevealedWordCount(0);
    setBuzzState("ready");
    const interval = window.setInterval(() => {
      setRevealedWordCount((current) => {
        if (current >= questionWords.length) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 333);

    return () => window.clearInterval(interval);
  }, [phase, questionWords.length, selectedQuestion]);

  useEffect(() => {
    if (
      phase !== "question" ||
      !selectedQuestion ||
      buzzState !== "ready" ||
      revealedWordCount < questionWords.length
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => showDanAnswer(selectedQuestion), 500);
    return () => window.clearTimeout(timer);
  }, [buzzState, phase, questionWords.length, revealedWordCount, selectedQuestion]);

  useEffect(() => {
    if (phase !== "choice" || !selectedQuestion) {
      return undefined;
    }

    setChoiceSeconds(8);
    const interval = window.setInterval(() => {
      setChoiceSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          handlePlayerChoice(null);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, selectedQuestion]);

  useEffect(() => {
    if (phase !== "standings") {
      return undefined;
    }

    const timer = window.setTimeout(() => setPhase("finalIntro"), 6800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "finalIntro") {
      return undefined;
    }

    const timer = window.setTimeout(() => setPhase("finalQuestion"), 4000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const addScore = (contestantIndex: number, amount: number) => {
    setScores((current) =>
      current.map((score, index) => (index === contestantIndex ? score + amount : score)),
    );
    setScoreFlash({ contestantIndex, tone: amount >= 0 ? "positive" : "negative" });
    window.setTimeout(() => setScoreFlash(null), 1100);
  };

  const markQuestionResolved = (question: JeopardyQuestion) => {
    const nextUsedQuestionIds = usedQuestionIds.includes(question.id)
      ? usedQuestionIds
      : [...usedQuestionIds, question.id];
    const remainingQuestionCount = jeopardyQuestions.length - nextUsedQuestionIds.length;

    setUsedQuestionIds(nextUsedQuestionIds);
    setMissingPotpourriIds((current) => {
      const allIds = getAllPotpourriTileIds();

      if (remainingQuestionCount <= 1) {
        return allIds;
      }

      const availableIds = allIds.filter((id) => !current.includes(id));
      const nextIds = [...current];

      for (let count = 0; count < 2 && availableIds.length > 0; count += 1) {
        const pickIndex = Math.floor(Math.random() * availableIds.length);
        const [nextId] = availableIds.splice(pickIndex, 1);

        if (nextId) {
          nextIds.push(nextId);
        }
      }

      return nextIds;
    });

    return remainingQuestionCount <= 0;
  };

  const returnToBoard = () => {
    setSelectedQuestion(null);
    setQuestionOrigin(null);
    setResult(null);
    setPhase("board");
  };

  const showFinalCard = () => {
    setSelectedQuestion(null);
    setQuestionOrigin(null);
    setResult(null);
    setPhase("finalCard");
  };

  const showParadoxResult = (question: JeopardyQuestion) => {
    setResult({
      contestantIndex: 0,
      text: "Dan says u r dum",
      speechBubbles: [
        { contestantIndex: 0, text: "Dan says u r dum" },
        { contestantIndex: 1, text: "Ha nerd" },
      ],
    });
    setPhase("result");
    const isFinalQuestion = markQuestionResolved(question);
    timersRef.current.push(window.setTimeout(isFinalQuestion ? showFinalCard : returnToBoard, 3200));
  };

  const showDanAnswer = (question: JeopardyQuestion) => {
    if (question.allAnswersWrong) {
      showParadoxResult(question);
      return;
    }

    const danIndex = getRandomDanIndex();
    setResult({ contestantIndex: danIndex, text: `Dan says: ${question.answer}` });
    setPhase("result");
    addScore(danIndex, question.value);
    const isFinalQuestion = markQuestionResolved(question);
    timersRef.current.push(window.setTimeout(isFinalQuestion ? showFinalCard : returnToBoard, 2800));
  };

  const handleQuestionSelect = (
    question: JeopardyQuestion,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const frameElement = event.currentTarget.closest(".jeopardy-stage-frame") as HTMLElement | null;
    const targetRect = frameElement?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    clearJeopardyTimers();
    setSelectedQuestion(question);
    setQuestionOrigin({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      targetLeft: targetRect.left,
      targetTop: targetRect.top,
      targetWidth: targetRect.width,
      targetHeight: targetRect.height,
    });
    setPhase("question");
  };

  const handleBuzz = () => {
    if (!selectedQuestion) {
      return;
    }

    if (revealedWordCount < questionWords.length) {
      setBuzzState("tooEarly");
      timersRef.current.push(window.setTimeout(() => showDanAnswer(selectedQuestion), 900));
      return;
    }

    setPhase("choice");
  };

  function handlePlayerChoice(choice: string | null) {
    if (!selectedQuestion) {
      return;
    }

    clearJeopardyTimers();

    const saidAnswer = choice ?? "nothing";
    const isCorrect = choice === selectedQuestion.answer;

    if (selectedQuestion.allAnswersWrong) {
      showParadoxResult(selectedQuestion);
      return;
    }

    setResult({ contestantIndex: 2, text: `${displayName} says: ${saidAnswer}` });
    setPhase("result");

    if (isCorrect) {
      addScore(2, selectedQuestion.value);
      const isFinalQuestion = markQuestionResolved(selectedQuestion);
      timersRef.current.push(window.setTimeout(isFinalQuestion ? showFinalCard : returnToBoard, 2800));
      return;
    }

    addScore(2, -selectedQuestion.value);
    timersRef.current.push(window.setTimeout(() => showDanAnswer(selectedQuestion), 2100));
  }

  const updatePlayerFinalScore = (finalScore: number) => {
    setScores((current) =>
      current.map((score, index) => (index === 2 ? finalScore : score)),
    );
  };

  const completeFinalJeopardy = (finalScore: number) => {
    updatePlayerFinalScore(finalScore);
    setPhase("charityGate");
  };

  return (
    <motion.section
      className="forgiveness-scene jeopardy-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <AnimatePresence mode="wait">
        {phase === "clock" && (
          <JeopardyClockIntro
            isLeaving={isClockLeaving}
            showCaption={showClockCaption}
            showTime={showClockTime}
          />
        )}

        {phase === "logo" && <JeopardyLogoIntro onStart={() => setPhase("podiumsIntro")} />}

        {phase === "podiumsIntro" && (
          <JeopardyPodiums
            contestants={contestants}
            result={null}
            scoreFlash={scoreFlash}
            scores={scores}
          />
        )}

        {phase === "board" && (
          <JeopardyBoard
            missingPotpourriIdSet={missingPotpourriIdSet}
            onSelectQuestion={handleQuestionSelect}
            usedQuestionIdSet={usedQuestionIdSet}
          />
        )}

        {phase === "question" && selectedQuestion && questionOrigin && (
          <JeopardyQuestionPanel
            buzzState={buzzState}
            onBuzz={handleBuzz}
            origin={questionOrigin}
            question={selectedQuestion}
            revealedWordCount={revealedWordCount}
            words={questionWords}
          />
        )}

        {phase === "choice" && selectedQuestion && (
          <JeopardyPodiums
            choiceSeconds={choiceSeconds}
            contestants={contestants}
            onChoose={handlePlayerChoice}
            result={{ contestantIndex: 2, text: "" }}
            scoreFlash={scoreFlash}
            scores={scores}
            selectedQuestion={selectedQuestion}
          />
        )}

        {phase === "result" && (
          <JeopardyPodiums
            contestants={contestants}
            result={result}
            scoreFlash={scoreFlash}
            scores={scores}
          />
        )}

        {phase === "finalCard" && (
          <JeopardyLogoIntro
            alt="Final Jeopardy"
            imageSrc="/jeopardy/final-jeopardy-300.jpg"
            imageSrcSet="/jeopardy/final-jeopardy-300.jpg 300w"
            key="jeopardy-final-card"
            sceneKey="jeopardy-final-card"
            onStart={() => setPhase("standings")}
          />
        )}

        {phase === "standings" && (
          <JeopardyStandings
            contestants={contestants}
            scores={scores}
          />
        )}

        {phase === "finalIntro" && <JeopardyFinalIntro />}

        {phase === "finalQuestion" && (
          <JeopardyFinalQuestion
            currentScore={scores[2] ?? 0}
            onComplete={completeFinalJeopardy}
            playerName={displayName}
            onScoreSettled={updatePlayerFinalScore}
          />
        )}

        {phase === "charityGate" && (
          <CharityGate onStart={() => setPhase("charity")} />
        )}

        {phase === "charity" && (
          <CharitySimulatorScene
            initialBalance={scores[2] ?? 0}
            onNext={onFinale}
            performanceMode={performanceMode}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function JeopardyClockIntro({
  isLeaving,
  showCaption,
  showTime,
}: {
  isLeaving: boolean;
  showCaption: boolean;
  showTime: boolean;
}) {
  return (
    <motion.div
      className={`jeopardy-clock-intro ${isLeaving ? "is-leaving" : ""}`}
      key="jeopardy-clock"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
    >
      <div className="jeopardy-clock-anchor">
        <div className="jeopardy-clock" aria-label="Clock stopping at 7:00 PM">
          <span className="jeopardy-clock-tick tick-12" />
          <span className="jeopardy-clock-tick tick-3" />
          <span className="jeopardy-clock-tick tick-6" />
          <span className="jeopardy-clock-tick tick-9" />
          <span className="jeopardy-clock-hand jeopardy-clock-hour" />
          <span className="jeopardy-clock-hand jeopardy-clock-minute" />
          <span className="jeopardy-clock-pin" />
        </div>
      </div>
      <div className="jeopardy-clock-copy" aria-live="polite">
        <AnimatePresence>
          {showTime && (
            <motion.p
              className="jeopardy-clock-time"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              8:00 PM
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showCaption && (
            <motion.p
              className="jeopardy-clock-caption"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              Dan goes to watch TV...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function JeopardyLogoIntro({
  alt = "Jeopardy",
  imageSrc = "/jeopardy/jeopardy-logo-880.jpg",
  imageSrcSet = "/jeopardy/jeopardy-logo-560.jpg 560w, /jeopardy/jeopardy-logo-880.jpg 880w",
  onStart,
  sceneKey = "jeopardy-logo",
}: {
  alt?: string;
  imageSrc?: string;
  imageSrcSet?: string;
  onStart: () => void;
  sceneKey?: string;
}) {
  return (
    <motion.div
      className="jeopardy-logo-intro"
      key={sceneKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <button className="jeopardy-logo-button" type="button" onClick={onStart}>
        <span className="jeopardy-logo-card">
          <span className="jeopardy-logo-face is-front">
            <img
              src={imageSrc}
              srcSet={imageSrcSet}
              sizes="min(78vw, 42rem)"
              alt={alt}
              draggable={false}
            />
          </span>
          <span className="jeopardy-logo-face is-back" aria-hidden="true">
            <img src={imageSrc} alt="" draggable={false} />
          </span>
        </span>
      </button>
    </motion.div>
  );
}

function JeopardyPodiums({
  choiceSeconds,
  contestants,
  onChoose,
  result,
  scoreFlash,
  scores,
  selectedQuestion,
}: {
  choiceSeconds?: number;
  contestants: JeopardyContestant[];
  onChoose?: (choice: string) => void;
  result: JeopardyResult | null;
  scoreFlash: JeopardyScoreFlash | null;
  scores: number[];
  selectedQuestion?: JeopardyQuestion;
}) {
  const activeIndex = result?.contestantIndex;
  const speechBubbles =
    result?.speechBubbles ??
    (result?.text && activeIndex !== undefined
      ? [{ contestantIndex: activeIndex, text: result.text }]
      : []);

  return (
    <motion.div
      className="jeopardy-podium-scene"
      key={`jeopardy-podiums-${selectedQuestion?.id ?? result?.text ?? "intro"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
    >
      <div className="jeopardy-stage-frame">
        <img
          className="jeopardy-podiums-image"
          src="/jeopardy/podiums-1200.jpg"
          srcSet="/jeopardy/podiums-1200.jpg 1200w"
          sizes="min(100vw, 78rem)"
          alt=""
          draggable={false}
        />
        <div className="jeopardy-podium-overlays" aria-live="polite">
          {contestants.map((contestant, index) => (
            <div
              className={`jeopardy-contestant-podium podium-${index}${
                activeIndex === index ? " is-active" : ""
              }`}
              key={contestant.id}
            >
              <div
                className={`jeopardy-money${
                  scoreFlash?.contestantIndex === index ? ` is-${scoreFlash.tone}` : ""
                }`}
              >
                {formatJeopardyMoney(scores[index] ?? 0)}
              </div>
              <div className="jeopardy-name">{contestant.name}</div>
            </div>
          ))}

          {speechBubbles.map((speechBubble) => (
            <div
              className={`jeopardy-speech-bubble speech-${speechBubble.contestantIndex}`}
              key={`${speechBubble.contestantIndex}-${speechBubble.text}`}
            >
              {speechBubble.text}
            </div>
          ))}

          {selectedQuestion && onChoose && (
            <div className="jeopardy-choice-panel">
              <div className="jeopardy-choice-timer">{choiceSeconds}s</div>
              <div className="jeopardy-choice-options">
                {selectedQuestion.options.map((option, index) => (
                  <button key={`${option}-${index}`} type="button" onClick={() => onChoose(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function JeopardyBoard({
  missingPotpourriIdSet,
  onSelectQuestion,
  usedQuestionIdSet,
}: {
  missingPotpourriIdSet: Set<string>;
  onSelectQuestion: (question: JeopardyQuestion, event: MouseEvent<HTMLButtonElement>) => void;
  usedQuestionIdSet: Set<string>;
}) {
  return (
    <motion.div
      className="jeopardy-board-scene"
      key="jeopardy-board"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
    >
      <div className="jeopardy-stage-frame jeopardy-board-frame">
        <div className="jeopardy-board" aria-label="Jeopardy board">
          {jeopardyCategories.map((category, columnIndex) => (
            <div className="jeopardy-category" key={`${category}-${columnIndex}`}>
              {category}
            </div>
          ))}

          {jeopardyValues.map((value) =>
            jeopardyCategories.map((category, columnIndex) => {
              const question = getJeopardyQuestion(category, value);
              const isPotpourri = category === "POTPOURRI";
              const tileId = isPotpourri
                ? getPotpourriTileId(columnIndex, value)
                : question?.id ?? `${category}-${value}`;
              const isMissing =
                (!isPotpourri && question && usedQuestionIdSet.has(question.id)) ||
                (isPotpourri && missingPotpourriIdSet.has(tileId));

              if (isMissing) {
                return <div className="jeopardy-tile is-missing" key={tileId} />;
              }

              if (question) {
                return (
                  <button
                    className="jeopardy-tile is-playable"
                    key={tileId}
                    type="button"
                    onClick={(event) => onSelectQuestion(question, event)}
                  >
                    ${value}
                  </button>
                );
              }

              return <div className="jeopardy-tile" key={tileId} aria-disabled="true">${value}</div>;
            }),
          )}
        </div>
      </div>
    </motion.div>
  );
}

function JeopardyQuestionPanel({
  buzzState,
  onBuzz,
  origin,
  question,
  revealedWordCount,
  words,
}: {
  buzzState: "ready" | "tooEarly";
  onBuzz: () => void;
  origin: JeopardyTileOrigin;
  question: JeopardyQuestion;
  revealedWordCount: number;
  words: string[];
}) {
  return (
    <motion.div
      className="jeopardy-question-panel"
      key={question.id}
      initial={{
        left: origin.left,
        top: origin.top,
        width: origin.width,
        height: origin.height,
      }}
      animate={{
        left: origin.targetLeft,
        top: origin.targetTop,
        width: origin.targetWidth,
        height: origin.targetHeight,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="jeopardy-question-content">
        <p className="jeopardy-question-value">
          {question.category} / ${question.value}
        </p>
        <div className="jeopardy-clue">
          {words.map((word, index) => (
            <span
              className={index < revealedWordCount ? "is-read" : ""}
              key={`${word}-${index}`}
            >
              {word}
            </span>
          ))}
        </div>
        <button
          className={`jeopardy-buzz-button ${buzzState === "tooEarly" ? "is-too-early" : ""}`}
          type="button"
          onClick={onBuzz}
          disabled={buzzState === "tooEarly"}
        >
          {buzzState === "tooEarly" ? (
            <>
              TOO
              <br />
              EARLY
            </>
          ) : (
            "BUZZ"
          )}
        </button>
      </div>
    </motion.div>
  );
}

function JeopardyStandings({
  contestants,
  scores,
}: {
  contestants: JeopardyContestant[];
  scores: number[];
}) {
  const standings = getJeopardyStandings(contestants, scores);

  return (
    <motion.div
      className="jeopardy-standings-scene"
      key="jeopardy-standings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
    >
      <h2>Current Standings</h2>
      <div className="jeopardy-standings-list">
        {standings.map((standing) => (
          <div
            className="jeopardy-standing-row"
            key={`${standing.name}-${standing.contestantIndex}`}
            style={
              {
                "--standing-delay": `${0.75 + (standings.length - standing.place) * 0.65}s`,
              } as CSSProperties
            }
          >
            <span>{standing.place === 1 ? "1st" : standing.place === 2 ? "2nd" : "3rd"}</span>
            <strong>{standing.name}</strong>
            <span>{formatJeopardyMoney(standing.score)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function JeopardyFinalIntro() {
  return (
    <motion.div
      className="jeopardy-final-intro"
      key="jeopardy-final-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <p>AND NOW...</p>
      <h2>
        <span>FINAL</span>
        <span>JEOPARDY</span>
      </h2>
    </motion.div>
  );
}

function JeopardyFinalQuestion({
  currentScore,
  onComplete,
  onScoreSettled,
  playerName,
}: {
  currentScore: number;
  onComplete: (score: number) => void;
  onScoreSettled: (score: number) => void;
  playerName: string;
}) {
  const [videoComplete, setVideoComplete] = useState(false);
  const [choice, setChoice] = useState<FinalJeopardyChoice | null>(null);
  const [displayedScore, setDisplayedScore] = useState(currentScore);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (!choice) {
      setDisplayedScore(currentScore);
      setIsSettled(false);
      return undefined;
    }

    const targetScore = choice === "yes" ? 999999999 : 0;
    let animationFrame = 0;
    let completeTimer = 0;
    const startScore = currentScore;
    const timer = window.setTimeout(() => {
      const startedAt = performance.now();
      const duration = 2300;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const nextScore = Math.round(startScore + (targetScore - startScore) * easedProgress);

        setDisplayedScore(nextScore);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
          return;
        }

        setDisplayedScore(targetScore);
        setIsSettled(true);
        onScoreSettled(targetScore);
        completeTimer = window.setTimeout(() => onComplete(targetScore), 1900);
      };

      animationFrame = window.requestAnimationFrame(tick);
    }, 850);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(completeTimer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [choice]);

  return (
    <motion.div
      className="jeopardy-final-question-scene"
      key="jeopardy-final-question"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        {!videoComplete ? (
          <motion.video
            className="jeopardy-final-video"
            key="jeopardy-final-video"
            src="/jeopardy/kickflip-low.mp4"
            autoPlay
            muted
            playsInline
            preload="metadata"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55 }}
            onEnded={() => setVideoComplete(true)}
            onError={() => setVideoComplete(true)}
          />
        ) : (
          <motion.div
            className="jeopardy-final-question-card"
            key="jeopardy-final-question-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h2>Was that awesome?</h2>
            {!choice ? (
              <div className="jeopardy-final-answer-buttons">
                <button type="button" onClick={() => setChoice("yes")}>
                  Yes
                </button>
                <button type="button" onClick={() => setChoice("no")}>
                  No
                </button>
              </div>
            ) : (
              <div className="jeopardy-final-score-reveal" aria-live="polite">
                <p>{playerName}</p>
                <strong className={choice === "no" && isSettled ? "is-zero" : ""}>
                  {formatJeopardyMoney(displayedScore)}
                </strong>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const charityMilestones: Record<number, string> = {
  10: "The poor are beginning to feel new strength...",
  20: "That's worth your weight in gold...",
  30: "The impoverished begin to feel the burden of wealth...",
  40: "Seriously this stuff is heavy...",
  50: "STOP PLEASE WE CAN'T MOVE IT'S SO MUCH GOLD",
};

function getCleanupFlamethrowerLandingPosition() {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth / 2,
    y: Math.max(48, window.innerHeight - 58),
  };
}

function clampFlamethrowerPosition(x: number, y: number) {
  const margin = 34;

  return {
    x: Math.min(window.innerWidth - margin, Math.max(margin, x)),
    y: Math.min(window.innerHeight - margin, Math.max(margin, y)),
  };
}

function getContinuousFlamethrowerDirection(
  dx: number,
  dy: number,
  fallbackDx: number,
  fallbackDy: number,
) {
  const directionLength = Math.hypot(dx, dy);

  if (directionLength > 0.01) {
    return {
      dx: dx / directionLength,
      dy: dy / directionLength,
    };
  }

  const fallbackLength = Math.hypot(fallbackDx, fallbackDy);

  if (fallbackLength > 0.01) {
    return {
      dx: fallbackDx / fallbackLength,
      dy: fallbackDy / fallbackLength,
    };
  }

  return {
    dx: 0,
    dy: -1,
  };
}

function CharityGate({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="charity-gate-scene"
      key="charity-gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <button type="button" onClick={onStart}>
        Charity Simulator
      </button>
      <p>(because of your greed)</p>
    </motion.div>
  );
}

function CharitySimulatorScene({
  initialBalance,
  onNext,
  performanceMode,
}: {
  initialBalance: number;
  onNext: () => void;
  performanceMode: PerformanceMode;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [donations, setDonations] = useState(0);
  const [message, setMessage] = useState("");
  const [iceHealth, setIceHealth] = useState(0);
  const [hasFrozenButton, setHasFrozenButton] = useState(false);
  const [hasStartedGoldCleanup, setHasStartedGoldCleanup] = useState(false);
  const [isGoldCleanupComplete, setIsGoldCleanupComplete] = useState(false);
  const [isFlaming, setIsFlaming] = useState(false);
  const [isCleanupFlamethrowerDragging, setIsCleanupFlamethrowerDragging] = useState(false);
  const [showGoldCleanupTitle, setShowGoldCleanupTitle] = useState(false);
  const [cleanupFlamethrowerPosition, setCleanupFlamethrowerPosition] = useState(
    getCleanupFlamethrowerLandingPosition,
  );
  const physicsApiRef = useRef<CharityPhysicsApi | null>(null);
  const messageTimerRef = useRef<number>(0);
  const cleanupFlamethrowerRef = useRef({
    dragging: false,
    directionX: 0,
    directionY: -1,
    lastPointerX: 0,
    lastPointerY: 0,
    ...getCleanupFlamethrowerLandingPosition(),
  });

  const isButtonFrozen = hasFrozenButton && iceHealth > 0;
  const canStartGoldCleanup = hasFrozenButton && iceHealth <= 0 && !hasStartedGoldCleanup;

  useEffect(() => {
    return () => window.clearTimeout(messageTimerRef.current);
  }, []);

  useEffect(() => {
    physicsApiRef.current?.setFlaming(isFlaming && isButtonFrozen);
  }, [isButtonFrozen, isFlaming]);

  useEffect(() => {
    if (!isFlaming || !isButtonFrozen) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      physicsApiRef.current?.shardIce();
      setIceHealth((current) => Math.max(0, current - 4));
    }, performanceMode === "reduced" ? 180 : 120);

    return () => window.clearInterval(interval);
  }, [isButtonFrozen, isFlaming, performanceMode]);

  useEffect(() => {
    if (!isButtonFrozen) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      for (let index = 0; index < 3; index += 1) {
        physicsApiRef.current?.spawnCoin();
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isButtonFrozen]);

  useEffect(() => {
    if (!showGoldCleanupTitle) {
      return undefined;
    }

    const timer = window.setTimeout(() => setShowGoldCleanupTitle(false), 1700);
    return () => window.clearTimeout(timer);
  }, [showGoldCleanupTitle]);

  useEffect(() => {
    if (iceHealth <= 0) {
      setIsFlaming(false);
      physicsApiRef.current?.setFlaming(false);
    }
  }, [iceHealth]);

  const updateCleanupFlamethrower = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    active: boolean,
  ) => {
    const directionLength = Math.hypot(dx, dy);
    const nextDirectionX =
      directionLength > 0.4 ? dx / directionLength : cleanupFlamethrowerRef.current.directionX;
    const nextDirectionY =
      directionLength > 0.4 ? dy / directionLength : cleanupFlamethrowerRef.current.directionY;

    cleanupFlamethrowerRef.current = {
      ...cleanupFlamethrowerRef.current,
      directionX: nextDirectionX,
      directionY: nextDirectionY,
      x,
      y,
    };
    setCleanupFlamethrowerPosition({ x, y });
    physicsApiRef.current?.setCleanupFlamethrower({
      active,
      dx: nextDirectionX,
      dy: nextDirectionY,
      x,
      y,
    });
  };

  const stopCleanupFlamethrower = () => {
    cleanupFlamethrowerRef.current.dragging = false;
    setIsCleanupFlamethrowerDragging(false);
    physicsApiRef.current?.setCleanupFlamethrower({
      active: false,
      dx: cleanupFlamethrowerRef.current.directionX,
      dy: cleanupFlamethrowerRef.current.directionY,
      x: cleanupFlamethrowerRef.current.x,
      y: cleanupFlamethrowerRef.current.y,
    });
  };

  const handleCleanupFlamethrowerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const nextPosition = clampFlamethrowerPosition(event.clientX, event.clientY);

    cleanupFlamethrowerRef.current.dragging = true;
    setIsCleanupFlamethrowerDragging(true);
    cleanupFlamethrowerRef.current.lastPointerX = event.clientX;
    cleanupFlamethrowerRef.current.lastPointerY = event.clientY;
    updateCleanupFlamethrower(
      nextPosition.x,
      nextPosition.y,
      cleanupFlamethrowerRef.current.directionX,
      cleanupFlamethrowerRef.current.directionY,
      true,
    );
  };

  const handleCleanupFlamethrowerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!cleanupFlamethrowerRef.current.dragging) {
      return;
    }

    const dx = event.clientX - cleanupFlamethrowerRef.current.lastPointerX;
    const dy = event.clientY - cleanupFlamethrowerRef.current.lastPointerY;
    const nextPosition = clampFlamethrowerPosition(event.clientX, event.clientY);

    cleanupFlamethrowerRef.current.lastPointerX = event.clientX;
    cleanupFlamethrowerRef.current.lastPointerY = event.clientY;
    updateCleanupFlamethrower(nextPosition.x, nextPosition.y, dx, dy, true);
  };

  const handleGoldCleanupComplete = () => {
    stopCleanupFlamethrower();
    setIsGoldCleanupComplete(true);
  };

  const showCharityMessage = (nextMessage: string) => {
    window.clearTimeout(messageTimerRef.current);
    setMessage(nextMessage);
    messageTimerRef.current = window.setTimeout(() => setMessage(""), 2600);
  };

  const handleDonate = () => {
    if (isButtonFrozen) {
      return;
    }

    if (canStartGoldCleanup) {
      const landingPosition = getCleanupFlamethrowerLandingPosition();
      cleanupFlamethrowerRef.current = {
        dragging: false,
        directionX: 0,
        directionY: -1,
        lastPointerX: landingPosition.x,
        lastPointerY: landingPosition.y,
        ...landingPosition,
      };
      setCleanupFlamethrowerPosition(landingPosition);
      setHasStartedGoldCleanup(true);
      setIsGoldCleanupComplete(false);
      setShowGoldCleanupTitle(true);
      physicsApiRef.current?.setCleanupFlamethrower({
        active: false,
        dx: 0,
        dy: -1,
        ...landingPosition,
      });
      physicsApiRef.current?.startGoldCleanup();
      return;
    }

    const nextDonations = donations + 1;
    setDonations(nextDonations);
    setBalance((current) => current - 1);
    for (let index = 0; index < 5; index += 1) {
      physicsApiRef.current?.spawnCoin();
    }

    const milestoneMessage = charityMilestones[nextDonations];
    if (milestoneMessage) {
      showCharityMessage(milestoneMessage);
    }

    if (nextDonations === 50) {
      setHasFrozenButton(true);
      setIceHealth(100);
    }
  };

  const stopFlamethrower = () => {
    setIsFlaming(false);
    physicsApiRef.current?.setFlaming(false);
  };

  return (
    <motion.div
      className="charity-simulator-scene"
      key="charity-simulator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <CharityPhysicsCanvas
        apiRef={physicsApiRef}
        onCoinsCleared={handleGoldCleanupComplete}
        performanceMode={performanceMode}
      />
      {!hasStartedGoldCleanup && <h2>Charity Simulator</h2>}
      <AnimatePresence>
        {showGoldCleanupTitle && !isGoldCleanupComplete && (
          <motion.div
            aria-level={2}
            className="charity-cleanup-title"
            key="charity-cleanup-title"
            role="heading"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            MOVE THE FLAMETHROWER
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {message && (
          <motion.p
            className="charity-message"
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {!hasStartedGoldCleanup && (
        <div className="charity-action-stack">
          {isButtonFrozen && (
          <div className="charity-flamethrower-wrap">
            <button
              aria-label="flamethrower"
              className="charity-flamethrower-button"
              type="button"
              onPointerCancel={stopFlamethrower}
              onPointerDown={() => setIsFlaming(true)}
              onPointerLeave={stopFlamethrower}
              onPointerUp={stopFlamethrower}
            />
          </div>
          )}

          <div className="charity-donate-wrap">
            <button
              className="charity-donate-button"
              disabled={isButtonFrozen}
              type="button"
              onClick={handleDonate}
            >
              Give to charity
            </button>
            {isButtonFrozen && (
              <div
                className="charity-ice-cube"
                aria-hidden="true"
                style={
                  {
                    "--ice-opacity": `${0.24 + (iceHealth / 100) * 0.56}`,
                    "--ice-scale": `${0.42 + (iceHealth / 100) * 0.58}`,
                  } as CSSProperties
                }
              />
            )}
          </div>
          <p className={`charity-balance ${balance < 0 ? "is-negative" : ""}`}>
            {formatJeopardyMoney(balance)}
          </p>
        </div>
      )}

      {hasStartedGoldCleanup && !isGoldCleanupComplete && (
        <button
          aria-label="Move the flamethrower"
          className={`charity-cleanup-flamethrower-button${
            isCleanupFlamethrowerDragging ? " is-dragging" : ""
          }`}
          style={
            {
              "--flamethrower-x": `${cleanupFlamethrowerPosition.x}px`,
              "--flamethrower-y": `${cleanupFlamethrowerPosition.y}px`,
            } as CSSProperties
          }
          type="button"
          onPointerCancel={stopCleanupFlamethrower}
          onPointerDown={handleCleanupFlamethrowerDown}
          onPointerMove={handleCleanupFlamethrowerMove}
          onPointerUp={stopCleanupFlamethrower}
        />
      )}

      {isGoldCleanupComplete && (
        <button className="charity-next-button" type="button" onClick={onNext}>
          Next
        </button>
      )}
    </motion.div>
  );
}

function CharityPhysicsCanvas({
  apiRef,
  onCoinsCleared,
  performanceMode,
}: {
  apiRef: MutableRefObject<CharityPhysicsApi | null>;
  onCoinsCleared: () => void;
  performanceMode: PerformanceMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCoinsClearedRef = useRef(onCoinsCleared);

  useEffect(() => {
    onCoinsClearedRef.current = onCoinsCleared;
  }, [onCoinsCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileDevice = window.matchMedia("(pointer: coarse), (max-width: 740px)").matches;
    const reduceEffects = performanceMode === "reduced" || reducedMotion;
    const coins: CharityCoin[] = [];
    const particles: CharityParticle[] = [];
    const maxParticles = reduceEffects ? 120 : 260;
    const baseMaxCoins = reduceEffects ? 96 : 180;
    const maxCoins = isMobileDevice ? baseMaxCoins : baseMaxCoins * 3;
    const coinRadius = reduceEffects ? 10 : 13;
    const frameIntervalMs = reduceEffects ? 33 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let coinId = 0;
    let isFlaming = false;
    let isGoldCleanup = false;
    let hasNotifiedGoldCleanupComplete = false;
    const cleanupFlamethrower = {
      active: false,
      dx: 0,
      dy: -1,
      x: 0,
      y: 0,
    };
    let lastFrame = performance.now();
    let lastPaint = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, reduceEffects ? 1 : 1.4);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const normalizeCleanupDirection = (dx: number, dy: number) => {
      const length = Math.hypot(dx, dy);

      if (length <= 0.4) {
        return {
          dx: cleanupFlamethrower.dx,
          dy: cleanupFlamethrower.dy,
        };
      }

      return {
        dx: dx / length,
        dy: dy / length,
      };
    };

    const addParticle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      color: string,
      radius: number,
      life: number,
      canBurnCoin = false,
    ) => {
      if (particles.length >= maxParticles) {
        particles.shift();
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        color,
        radius,
        life,
        maxLife: life,
        canBurnCoin,
      });
    };

    const spawnCoin = () => {
      if (coins.length >= maxCoins) {
        coins.shift();
      }

      coins.push({
        id: coinId,
        x: width * (0.32 + Math.random() * 0.36),
        y: -coinRadius * (2 + Math.random() * 3.5),
        vx: (Math.random() - 0.5) * 2.7,
        vy: Math.random() * 1.7,
        radius: coinRadius,
        angle: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.16,
      });
      coinId += 1;
    };

    const shardIce = () => {
      const originX = width / 2 + (Math.random() - 0.5) * 92;
      const originY = height * 0.5 + (Math.random() - 0.5) * 46;

      for (let index = 0; index < (reduceEffects ? 1 : 2); index += 1) {
        addParticle(
          originX,
          originY,
          (Math.random() - 0.5) * 3.4,
          -Math.random() * 2.4 - 0.4,
          "rgba(198, 238, 255, 0.9)",
          Math.random() * 3 + 2,
          40 + Math.random() * 22,
        );
      }
    };

    const burstCoin = (coin: CharityCoin) => {
        const particleCount = reduceEffects ? 4 : 8;

        for (let index = 0; index < particleCount; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4.8 + 1.2;
          addParticle(
            coin.x,
            coin.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 1.6,
            index % 2 === 0 ? "#ffcc33" : "#ff3b1f",
            Math.random() * 4 + 2,
            52 + Math.random() * 28,
          );
        }
    };

    const startGoldCleanup = () => {
      isGoldCleanup = true;
      isFlaming = false;
      hasNotifiedGoldCleanupComplete = false;
      cleanupFlamethrower.active = false;

      coins.forEach((coin) => {
        coin.vx = (Math.random() - 0.5) * 2.4;
        coin.vy = -Math.random() * 2 - 0.35;
        coin.va += (Math.random() - 0.5) * 0.1;
        coin.y = Math.min(Math.max(coin.radius, coin.y), height - coin.radius);
      });
    };

    const drawCoin = (coin: CharityCoin) => {
      context.save();
      context.translate(coin.x, coin.y);
      context.rotate(coin.angle);
      context.fillStyle = "#d8a51f";
      context.strokeStyle = "#ffe082";
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(0, 0, coin.radius * 1.05, coin.radius * 0.82, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = "rgba(255, 243, 168, 0.72)";
      context.beginPath();
      context.ellipse(-coin.radius * 0.24, -coin.radius * 0.18, coin.radius * 0.3, coin.radius * 0.14, -0.2, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const resolveCoinCollisions = () => {
      for (let outer = 0; outer < coins.length; outer += 1) {
        for (let inner = outer + 1; inner < coins.length; inner += 1) {
          const first = coins[outer];
          const second = coins[inner];
          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
          const minDistance = first.radius + second.radius;

          if (distance >= minDistance) {
            continue;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          first.x -= nx * overlap * 0.5;
          first.y -= ny * overlap * 0.5;
          second.x += nx * overlap * 0.5;
          second.y += ny * overlap * 0.5;

          const relativeVelocity = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
          if (relativeVelocity > 0) {
            continue;
          }

          const impulse = -relativeVelocity * 0.45;
          first.vx -= impulse * nx;
          first.vy -= impulse * ny;
          second.vx += impulse * nx;
          second.vy += impulse * ny;
        }
      }
    };

    const animate = (now: number) => {
      if (document.hidden || now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      const delta = Math.min(2.3, (now - lastFrame) / 16.67);
      lastFrame = now;
      lastPaint = now;

      context.clearRect(0, 0, width, height);

      if (isFlaming) {
        const flameCount = reduceEffects ? 4 : 11;
        for (let index = 0; index < flameCount; index += 1) {
          addParticle(
            width / 2 + (Math.random() - 0.5) * 34,
            height * 0.34 + Math.random() * 12,
            (Math.random() - 0.5) * 2.8,
            Math.random() * 6.4 + 4.6,
            index % 4 === 0 ? "#fff4cf" : index % 2 === 0 ? "#ff3b1f" : "#ff9f1f",
            Math.random() * 7 + 3,
            36 + Math.random() * 22,
          );
        }
      }

      if (isGoldCleanup && cleanupFlamethrower.active) {
        const flameCount = reduceEffects ? 4 : 12;
        const perpendicularX = -cleanupFlamethrower.dy;
        const perpendicularY = cleanupFlamethrower.dx;

        for (let index = 0; index < flameCount; index += 1) {
          const spread = (Math.random() - 0.5) * 3.8;
          const speed = Math.random() * 4.8 + 7.2;

          addParticle(
            cleanupFlamethrower.x + perpendicularX * spread + (Math.random() - 0.5) * 5,
            cleanupFlamethrower.y + perpendicularY * spread + (Math.random() - 0.5) * 5,
            cleanupFlamethrower.dx * speed + perpendicularX * spread * 0.28,
            cleanupFlamethrower.dy * speed + perpendicularY * spread * 0.28,
            index % 5 === 0 ? "#fff4cf" : index % 2 === 0 ? "#ff3b1f" : "#ff9f1f",
            Math.random() * 5 + 3,
            28 + Math.random() * 16,
            true,
          );
        }
      }

      coins.forEach((coin) => {
        if (isGoldCleanup) {
          coin.vx += Math.sin(now * 0.0017 + coin.id) * 0.014 * delta;
          coin.vy += Math.cos(now * 0.0013 + coin.id * 1.7) * 0.014 * delta;
          coin.vx *= 0.998;
          coin.vy *= 0.998;
        } else {
          coin.vy += 0.34 * delta;
          coin.vx *= 0.994;
          coin.vy *= 0.998;
        }

        coin.x += coin.vx * delta;
        coin.y += coin.vy * delta;
        coin.angle += coin.va * delta;
        coin.va *= 0.992;

        if (coin.x - coin.radius < 0) {
          coin.x = coin.radius;
          coin.vx *= isGoldCleanup ? -0.72 : -0.42;
        } else if (coin.x + coin.radius > width) {
          coin.x = width - coin.radius;
          coin.vx *= isGoldCleanup ? -0.72 : -0.42;
        }

        if (isGoldCleanup) {
          if (coin.y - coin.radius < 0) {
            coin.y = coin.radius;
            coin.vy *= -0.72;
          } else if (coin.y + coin.radius > height) {
            coin.y = height - coin.radius;
            coin.vy *= -0.72;
          }
        } else {
          const floorY = height - coin.radius - 10;
          if (coin.y > floorY) {
            coin.y = floorY;
            coin.vy *= -0.22;
            coin.vx *= 0.82;
            coin.va *= 0.72;
          }
        }
      });

      resolveCoinCollisions();
      coins.forEach(drawCoin);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta;
        particle.vy += 0.05 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        if (isGoldCleanup && particle.canBurnCoin) {
          for (let coinIndex = coins.length - 1; coinIndex >= 0; coinIndex -= 1) {
            const coin = coins[coinIndex];
            const dx = particle.x - coin.x;
            const dy = particle.y - coin.y;
            const hitDistance = coin.radius + particle.radius * 0.9;

            if (dx * dx + dy * dy <= hitDistance * hitDistance) {
              burstCoin(coin);
              coins.splice(coinIndex, 1);
              particle.life = 0;
              break;
            }
          }
        }

        const alpha = Math.max(0, particle.life / particle.maxLife);
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * (0.65 + alpha * 0.5), 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;

        if (particle.life <= 0) {
          particles.splice(index, 1);
        }
      }

      if (isGoldCleanup && coins.length === 0 && !hasNotifiedGoldCleanupComplete) {
        hasNotifiedGoldCleanupComplete = true;
        cleanupFlamethrower.active = false;
        window.setTimeout(() => onCoinsClearedRef.current(), 350);
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    apiRef.current = {
      setCleanupFlamethrower: (nextState: CharityCleanupFlamethrowerState) => {
        const direction = normalizeCleanupDirection(nextState.dx, nextState.dy);
        cleanupFlamethrower.active = nextState.active;
        cleanupFlamethrower.dx = direction.dx;
        cleanupFlamethrower.dy = direction.dy;
        cleanupFlamethrower.x = nextState.x;
        cleanupFlamethrower.y = nextState.y;
      },
      setFlaming: (nextIsFlaming: boolean) => {
        isFlaming = nextIsFlaming;
      },
      shardIce,
      spawnCoin,
      startGoldCleanup,
    };
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      apiRef.current = null;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [apiRef, performanceMode]);

  return <canvas ref={canvasRef} className="charity-physics-canvas" aria-hidden="true" />;
}

type WordSearchAxis = "horizontal" | "vertical";
type WordSearchPhase = "idle" | "selecting" | "rejected" | "solved" | "finaleFlip" | "finale";
type WordSearchCoord = {
  row: number;
  col: number;
};
type WordSearchPoint = {
  x: number;
  y: number;
};
type WordSearchCellStyle = CSSProperties & Record<`--word-search-${string}`, string>;
type WordSearchPuzzle = {
  id: string;
  size: number;
  grid: string[][];
  targets: WordSearchTarget[];
};

type WordSearchTargetConfig = {
  id: string;
  word: string;
  clue: string;
};

type WordSearchLevel = {
  size: number;
  pulseDelayMs: number;
  targets: WordSearchTargetConfig[];
};

type WordSearchTarget = WordSearchTargetConfig & {
  solution: WordSearchCoord[];
};

const wordSearchAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const danDiscoFinalPhrase = "DANDISCO";
const wordSearchLevels: WordSearchLevel[] = [
  {
    size: 5,
    pulseDelayMs: 20000,
    targets: [{ id: "disco", word: "DISCO", clue: "1. Disco" }],
  },
  {
    size: 10,
    pulseDelayMs: 10000,
    targets: [
      { id: "disco", word: "DISCO", clue: "1. Disco" },
      { id: "dan", word: "DAN", clue: "2. Dan" },
      { id: "crab", word: "CRAB", clue: "3. Crab" },
    ],
  },
  {
    size: 20,
    pulseDelayMs: 5000,
    targets: [
      { id: "disco", word: "DISCO", clue: "1. Disco" },
      { id: "dan", word: "DAN", clue: "2. Dan" },
      { id: "crab", word: "CRAB", clue: "3. Crab" },
      { id: "dandle", word: "DANDLE", clue: "4. Dandle" },
      { id: "puter", word: "PUTER", clue: "5. Puter" },
    ],
  },
];

const wordSearchLetterSizes: Record<number, string> = {
  5: "clamp(1.55rem, 6.6vmin, 2.6rem)",
  10: "clamp(0.8rem, 3.1vmin, 1.28rem)",
  20: "clamp(0.62rem, 2.2vmin, 1.08rem)",
};
const wordSearchFinalGravityDelayMs = 5000;

function randomWordSearchLetter() {
  return wordSearchAlphabet[Math.floor(Math.random() * wordSearchAlphabet.length)] ?? "D";
}

function wordSearchCoordKey(coord: WordSearchCoord) {
  return `${coord.row}-${coord.col}`;
}

function clampWordSearchValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function canPlaceWordSearchTarget(
  target: WordSearchTargetConfig,
  grid: string[][],
  occupiedKeys: Set<string>,
  row: number,
  col: number,
  axis: WordSearchAxis,
) {
  const word = target.word.toUpperCase();
  const size = grid.length;

  if (axis === "horizontal" && col + word.length > size) {
    return false;
  }

  if (axis === "vertical" && row + word.length > size) {
    return false;
  }

  return Array.from(word).every((letter, index) => {
    const coord = {
      row: row + (axis === "vertical" ? index : 0),
      col: col + (axis === "horizontal" ? index : 0),
    };
    const key = wordSearchCoordKey(coord);

    return !occupiedKeys.has(key);
  });
}

function placeWordSearchTarget(
  target: WordSearchTargetConfig,
  grid: string[][],
  occupiedKeys: Set<string>,
) {
  const size = grid.length;
  const word = target.word.toUpperCase();

  for (let attempt = 0; attempt < 400; attempt += 1) {
    const axis: WordSearchAxis = Math.random() > 0.5 ? "horizontal" : "vertical";
    const row =
      axis === "vertical"
        ? Math.floor(Math.random() * (size - word.length + 1))
        : Math.floor(Math.random() * size);
    const col =
      axis === "horizontal"
        ? Math.floor(Math.random() * (size - word.length + 1))
        : Math.floor(Math.random() * size);

    if (!canPlaceWordSearchTarget(target, grid, occupiedKeys, row, col, axis)) {
      continue;
    }

    const solution = Array.from(word).map((letter, index) => {
      const coord = {
        row: row + (axis === "vertical" ? index : 0),
        col: col + (axis === "horizontal" ? index : 0),
      };

      grid[coord.row][coord.col] = letter;
      occupiedKeys.add(wordSearchCoordKey(coord));
      return coord;
    });

    return { ...target, word, solution };
  }

  throw new Error(`Could not place word search target ${target.word}`);
}

function createWordSearchPuzzle(level: WordSearchLevel, levelIndex: number): WordSearchPuzzle {
  const grid = Array.from({ length: level.size }, () =>
    Array.from({ length: level.size }, randomWordSearchLetter),
  );
  const occupiedKeys = new Set<string>();
  const targets = level.targets.map((target) =>
    placeWordSearchTarget(target, grid, occupiedKeys),
  );

  return {
    id: `word-search-${level.size}-${levelIndex}-${Date.now()}-${Math.random()}`,
    size: level.size,
    grid,
    targets,
  };
}

function createDanDiscoGrid(size: number): string[][] {
  return Array.from({ length: size }, (_, rowIndex) =>
    Array.from(
      { length: size },
      (_, colIndex) =>
        danDiscoFinalPhrase[(rowIndex * size + colIndex) % danDiscoFinalPhrase.length] ?? "D",
    ),
  );
}

function isFinalDiscoLetter(row: number, col: number, size: number) {
  return (row * size + col) % danDiscoFinalPhrase.length >= 3;
}

function isFinalDanLetter(row: number, col: number, size: number) {
  return (row * size + col) % danDiscoFinalPhrase.length < 3;
}

function createWordSearchFinalFallTimings(size: number) {
  return Array.from({ length: size * size }, (_, index) => {
    const staggerGroup = index % 31;
    const randomDelay = Math.random() * 1.15 + staggerGroup * 0.035;
    const duration = 1.65 + Math.random() * 0.62;

    return {
      delay: randomDelay,
      duration,
      end: randomDelay + duration,
    };
  });
}

function getWordSearchCellCoord(element: Element | null): WordSearchCoord | null {
  const cell = element?.closest("[data-word-search-cell]") as HTMLElement | null;

  if (!cell) {
    return null;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return null;
  }

  return { row, col };
}

function getWordSearchPath(
  start: WordSearchCoord,
  end: WordSearchCoord,
  lockedAxis: WordSearchAxis | null,
) {
  let axis = lockedAxis;

  if (!axis) {
    if (start.row === end.row && start.col !== end.col) {
      axis = "horizontal";
    } else if (start.col === end.col && start.row !== end.row) {
      axis = "vertical";
    } else if (start.row === end.row && start.col === end.col) {
      return { axis, coords: [start] };
    } else {
      return null;
    }
  }

  if (axis === "horizontal") {
    if (end.row !== start.row) {
      return null;
    }

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return {
      axis,
      coords: Array.from({ length: maxCol - minCol + 1 }, (_, index) => ({
        row: start.row,
        col: minCol + index,
      })),
    };
  }

  if (end.col !== start.col) {
    return null;
  }

  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  return {
    axis,
    coords: Array.from({ length: maxRow - minRow + 1 }, (_, index) => ({
      row: minRow + index,
      col: start.col,
    })),
  };
}

function wordSearchCoordsMatch(a: WordSearchCoord[], b: WordSearchCoord[]) {
  return (
    a.length === b.length &&
    a.every((coord, index) => coord.row === b[index]?.row && coord.col === b[index]?.col)
  );
}

function isCorrectWordSearchSelection(selection: WordSearchCoord[], solution: WordSearchCoord[]) {
  return (
    wordSearchCoordsMatch(selection, solution) ||
    wordSearchCoordsMatch(selection, [...solution].reverse())
  );
}

function findSelectedWordSearchTarget(
  selection: WordSearchCoord[],
  targets: WordSearchTarget[],
  foundTargetIds: string[],
) {
  const foundSet = new Set(foundTargetIds);

  return targets.find(
    (target) =>
      !foundSet.has(target.id) && isCorrectWordSearchSelection(selection, target.solution),
  );
}

function getWordSearchBoardPoint(
  event: { clientX: number; clientY: number },
  board: HTMLDivElement | null,
  size: number,
): WordSearchPoint | null {
  const rect = board?.getBoundingClientRect();

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    x: clampWordSearchValue(((event.clientX - rect.left) / rect.width) * size, 0.5, size - 0.5),
    y: clampWordSearchValue(((event.clientY - rect.top) / rect.height) * size, 0.5, size - 0.5),
  };
}

function getWordSearchCoordFromPoint(point: WordSearchPoint, size: number): WordSearchCoord {
  return {
    row: clampWordSearchValue(Math.floor(point.y), 0, size - 1),
    col: clampWordSearchValue(Math.floor(point.x), 0, size - 1),
  };
}

function createWordSearchSelectionPath({
  axis,
  dragPoint,
  puzzleSize,
  selection,
  start,
}: {
  axis: WordSearchAxis | null;
  dragPoint: WordSearchPoint | null;
  puzzleSize: number;
  selection: WordSearchCoord[];
  start: WordSearchCoord;
}) {
  const radius = 0.43;
  const startCenter = {
    x: start.col + 0.5,
    y: start.row + 0.5,
  };
  const fallbackEnd = selection[selection.length - 1] ?? start;
  const fallbackCenter = {
    x: fallbackEnd.col + 0.5,
    y: fallbackEnd.row + 0.5,
  };

  if (axis === "vertical") {
    const x = startCenter.x;
    const yEnd = clampWordSearchValue(
      dragPoint?.y ?? fallbackCenter.y,
      0.5,
      puzzleSize - 0.5,
    );
    const top = Math.min(startCenter.y, yEnd);
    const bottom = Math.max(startCenter.y, yEnd);

    return [
      `M ${x + radius} ${top}`,
      `L ${x + radius} ${bottom}`,
      `A ${radius} ${radius} 0 0 1 ${x - radius} ${bottom}`,
      `L ${x - radius} ${top}`,
      `A ${radius} ${radius} 0 0 1 ${x + radius} ${top}`,
      "Z",
    ].join(" ");
  }

  const y = startCenter.y;
  const xEnd = clampWordSearchValue(
    axis === "horizontal" ? dragPoint?.x ?? fallbackCenter.x : startCenter.x,
    0.5,
    puzzleSize - 0.5,
  );
  const left = Math.min(startCenter.x, xEnd);
  const right = Math.max(startCenter.x, xEnd);

  return [
    `M ${left} ${y - radius}`,
    `L ${right} ${y - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${y + radius}`,
    `L ${left} ${y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${left} ${y - radius}`,
    "Z",
  ].join(" ");
}

function WordSearchSelectionOutline({
  isRejected,
  axis,
  dragPoint,
  puzzleSize,
  selection,
  start,
}: {
  isRejected: boolean;
  axis: WordSearchAxis | null;
  dragPoint: WordSearchPoint | null;
  puzzleSize: number;
  selection: WordSearchCoord[];
  start: WordSearchCoord;
}) {
  const selectionPath = useMemo(() => {
    return createWordSearchSelectionPath({
      axis,
      dragPoint,
      puzzleSize,
      selection,
      start,
    });
  }, [axis, dragPoint, puzzleSize, selection, start]);

  return (
    <svg
      className={`word-search-selection-outline${isRejected ? " is-rejected" : ""}`}
      viewBox={`0 0 ${puzzleSize} ${puzzleSize}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        className="word-search-selection-outline-path"
        d={selectionPath}
        animate={{ d: selectionPath }}
        initial={false}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function WordSearchScene({
  performanceMode,
  onNext,
}: {
  performanceMode: PerformanceMode;
  onNext: () => void;
}) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(() =>
    createWordSearchPuzzle(wordSearchLevels[0], 0),
  );
  const [selection, setSelection] = useState<WordSearchCoord[]>([]);
  const [selectionAxis, setSelectionAxis] = useState<WordSearchAxis | null>(null);
  const [selectionStart, setSelectionStart] = useState<WordSearchCoord | null>(null);
  const [dragPoint, setDragPoint] = useState<WordSearchPoint | null>(null);
  const [foundTargetIds, setFoundTargetIds] = useState<string[]>([]);
  const [shouldPulseSolution, setShouldPulseSolution] = useState(false);
  const [successOutlines, setSuccessOutlines] = useState<number[]>([]);
  const [isFinalGravityActive, setIsFinalGravityActive] = useState(false);
  const [showWordSearchNext, setShowWordSearchNext] = useState(false);
  const [phase, setPhase] = useState<WordSearchPhase>("idle");
  const boardRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const phaseRef = useRef<WordSearchPhase>("idle");
  const selectionRef = useRef<WordSearchCoord[]>([]);
  const selectionStartRef = useRef<WordSearchCoord | null>(null);
  const selectionAxisRef = useRef<WordSearchAxis | null>(null);
  const pendingDragPointRef = useRef<WordSearchPoint | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const successOutlineIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const activeLevel = wordSearchLevels[levelIndex] ?? wordSearchLevels[wordSearchLevels.length - 1];
  const isFinale = phase === "finale";
  const isFinaleTransition = phase === "finaleFlip";
  const isLastLevel = levelIndex === wordSearchLevels.length - 1;
  const selectionKeys = useMemo(
    () => new Set(selection.map(wordSearchCoordKey)),
    [selection],
  );
  const foundTargetIdSet = useMemo(() => new Set(foundTargetIds), [foundTargetIds]);
  const foundCellKeys = useMemo(() => {
    const keys = new Set<string>();

    puzzle.targets.forEach((target) => {
      if (!foundTargetIdSet.has(target.id)) {
        return;
      }

      target.solution.forEach((coord) => keys.add(wordSearchCoordKey(coord)));
    });

    return keys;
  }, [foundTargetIdSet, puzzle.targets]);
  const pulseIndexes = useMemo(
    () => {
      const indexes = new Map<string, number>();
      let pulseIndex = 0;

      puzzle.targets.forEach((target) => {
        if (foundTargetIdSet.has(target.id)) {
          return;
        }

        target.solution.forEach((coord) => {
          indexes.set(wordSearchCoordKey(coord), pulseIndex);
          pulseIndex += 1;
        });
      });

      return indexes;
    },
    [foundTargetIdSet, puzzle.targets],
  );
  const areAllTargetsFound =
    puzzle.targets.length > 0 && puzzle.targets.every((target) => foundTargetIdSet.has(target.id));
  const finalFallTimings = useMemo(
    () => createWordSearchFinalFallTimings(puzzle.size),
    [puzzle.id, puzzle.size],
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    selectionAxisRef.current = selectionAxis;
  }, [selectionAxis]);

  useEffect(
    () => () => {
      timersRef.current.forEach(window.clearTimeout);
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setSuccessOutlines([]);
  }, [puzzle.id]);

  useEffect(() => {
    setShouldPulseSolution(false);
    const pulseDelay = activeLevel.pulseDelayMs;
    const timer = window.setTimeout(() => setShouldPulseSolution(true), pulseDelay);
    return () => window.clearTimeout(timer);
  }, [activeLevel.pulseDelayMs, puzzle.id]);

  useEffect(() => {
    if (!isFinale) {
      setIsFinalGravityActive(false);
      setShowWordSearchNext(false);
      return undefined;
    }

    setIsFinalGravityActive(false);
    setShowWordSearchNext(false);
    const latestFallEnd = Math.max(...finalFallTimings.map((timing) => timing.end));
    const gravityTimer = window.setTimeout(
      () => setIsFinalGravityActive(true),
      wordSearchFinalGravityDelayMs,
    );
    const nextTimer = window.setTimeout(
      () => setShowWordSearchNext(true),
      wordSearchFinalGravityDelayMs + latestFallEnd * 1000 + 260,
    );

    return () => {
      window.clearTimeout(gravityTimer);
      window.clearTimeout(nextTimer);
    };
  }, [finalFallTimings, isFinale]);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  const setWordSearchPhase = (nextPhase: WordSearchPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  };

  const launchSuccessOutline = () => {
    const outlineId = successOutlineIdRef.current;
    successOutlineIdRef.current += 1;
    setSuccessOutlines((current) => [...current, outlineId]);
  };

  const startSelection = (coord: WordSearchCoord, pointerId: number, target: EventTarget) => {
    if (phaseRef.current !== "idle") {
      return;
    }

    clearTimers();
    pendingDragPointRef.current = null;
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    activePointerRef.current = pointerId;
    selectionStartRef.current = coord;
    selectionAxisRef.current = null;
    selectionRef.current = [coord];
    setSelection([coord]);
    setSelectionStart(coord);
    setSelectionAxis(null);
    setDragPoint({ x: coord.col + 0.5, y: coord.row + 0.5 });
    setWordSearchPhase("selecting");

    if (target instanceof Element) {
      boardRef.current?.setPointerCapture(pointerId);
    }
  };

  const extendSelection = (coord: WordSearchCoord) => {
    if (phaseRef.current !== "selecting") {
      return;
    }

    const start = selectionStartRef.current;

    if (!start) {
      return;
    }

    const projectedCoord =
      selectionAxisRef.current === "horizontal"
        ? { row: start.row, col: coord.col }
        : selectionAxisRef.current === "vertical"
          ? { row: coord.row, col: start.col }
          : coord;
    const nextPath = getWordSearchPath(start, projectedCoord, selectionAxisRef.current);

    if (!nextPath) {
      return;
    }

    if (nextPath.axis !== selectionAxisRef.current) {
      selectionAxisRef.current = nextPath.axis;
      setSelectionAxis(nextPath.axis);
    }

    selectionRef.current = nextPath.coords;
    setSelection(nextPath.coords);
  };

  const scheduleDragUpdate = (point: WordSearchPoint) => {
    pendingDragPointRef.current = point;

    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = window.requestAnimationFrame(() => {
      const nextPoint = pendingDragPointRef.current;
      pendingDragPointRef.current = null;
      dragFrameRef.current = null;

      if (!nextPoint || phaseRef.current !== "selecting") {
        return;
      }

      setDragPoint(nextPoint);
      extendSelection(getWordSearchCoordFromPoint(nextPoint, puzzle.size));
    });
  };

  const flushDragUpdate = () => {
    const nextPoint = pendingDragPointRef.current;
    pendingDragPointRef.current = null;

    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    if (!nextPoint || phaseRef.current !== "selecting") {
      return;
    }

    setDragPoint(nextPoint);
    extendSelection(getWordSearchCoordFromPoint(nextPoint, puzzle.size));
  };

  const finishSelection = (pointerId: number) => {
    if (phaseRef.current !== "selecting" || activePointerRef.current !== pointerId) {
      return;
    }

    flushDragUpdate();

    if (boardRef.current?.hasPointerCapture(pointerId)) {
      boardRef.current.releasePointerCapture(pointerId);
    }

    activePointerRef.current = null;
    selectionStartRef.current = null;

    const selectedTarget = findSelectedWordSearchTarget(
      selectionRef.current,
      puzzle.targets,
      foundTargetIds,
    );

    if (selectedTarget) {
      const nextFoundTargetIds = [...foundTargetIds, selectedTarget.id];
      const didFindAllTargets = puzzle.targets.every((target) =>
        nextFoundTargetIds.includes(target.id),
      );

      setFoundTargetIds(nextFoundTargetIds);
      setSelection([]);
      setSelectionStart(null);
      setSelectionAxis(null);
      setDragPoint(null);
      selectionRef.current = [];
      selectionAxisRef.current = null;
      launchSuccessOutline();

      if (didFindAllTargets && levelIndex === wordSearchLevels.length - 1) {
        setSelection([]);
        setSelectionStart(null);
        setSelectionAxis(null);
        setDragPoint(null);
        selectionRef.current = [];
        selectionAxisRef.current = null;
        setShouldPulseSolution(false);
        setWordSearchPhase("solved");
        timersRef.current = [
          window.setTimeout(() => setWordSearchPhase("finaleFlip"), 2350),
          window.setTimeout(() => {
            setPuzzle((currentPuzzle) => ({
              ...currentPuzzle,
              grid: createDanDiscoGrid(currentPuzzle.size),
              targets: [],
            }));
          }, 2840),
          window.setTimeout(() => setWordSearchPhase("finale"), 3330),
        ];
        return;
      }

      if (!didFindAllTargets) {
        setWordSearchPhase("idle");
        return;
      }

      setWordSearchPhase("solved");
      timersRef.current = [
        window.setTimeout(() => {
          if (didFindAllTargets) {
            const nextLevelIndex = levelIndex + 1;
            setLevelIndex(nextLevelIndex);
            setFoundTargetIds([]);
            setPuzzle(createWordSearchPuzzle(wordSearchLevels[nextLevelIndex], nextLevelIndex));
          }

          setWordSearchPhase("idle");
        }, 2350),
      ];
      return;
    }

    setWordSearchPhase("rejected");
    timersRef.current = [
      window.setTimeout(() => {
        selectionRef.current = [];
        selectionAxisRef.current = null;
        setSelection([]);
        setSelectionStart(null);
        setSelectionAxis(null);
        setDragPoint(null);
        setWordSearchPhase("idle");
      }, 760),
    ];
  };

  return (
    <motion.section
      className={`word-search-scene is-${phase}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence>
        {!isFinale && !isFinaleTransition && (
          <motion.h1
            className="word-search-title"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Word Search
          </motion.h1>
        )}
      </AnimatePresence>

      <div className="word-search-board-anchor">
        <AnimatePresence mode="wait">
          <motion.div
            key={puzzle.id}
            className={`word-search-board-wrap${
              phase === "finaleFlip" ? " is-finale-flipping" : ""
            }${
              isFinale ? " is-finale" : ""
            }`}
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.96 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              ref={boardRef}
              className="word-search-board"
              role="grid"
              aria-label={`${puzzle.size} by ${puzzle.size} word search`}
              style={
                {
                  "--word-search-size": puzzle.size,
                  "--word-search-letter-size":
                    wordSearchLetterSizes[puzzle.size] ?? wordSearchLetterSizes[20],
                } as CSSProperties
              }
              onPointerDown={(event) => {
                const coord = getWordSearchCellCoord(event.target as Element);

                if (coord) {
                  startSelection(coord, event.pointerId, event.target);
                }
              }}
              onPointerMove={(event) => {
                if (activePointerRef.current !== event.pointerId) {
                  return;
                }

                const point = getWordSearchBoardPoint(event, boardRef.current, puzzle.size);

                if (point) {
                  scheduleDragUpdate(point);
                }
              }}
              onPointerUp={(event) => finishSelection(event.pointerId)}
              onPointerCancel={(event) => finishSelection(event.pointerId)}
            >
              {puzzle.grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const coord = { row: rowIndex, col: colIndex };
                  const coordKey = wordSearchCoordKey(coord);
                  const isSelected = selectionKeys.has(coordKey);
                  const isFoundLetter = foundCellKeys.has(coordKey);
                  const pulseIndex = pulseIndexes.get(coordKey);
                  const shouldPulse =
                    shouldPulseSolution &&
                    pulseIndex !== undefined &&
                    !isFoundLetter &&
                    phase !== "solved" &&
                    !isFinale &&
                    !isFinaleTransition;
                  const shouldPulseFinalDisco =
                    isFinale && isFinalDiscoLetter(rowIndex, colIndex, puzzle.size);
                  const shouldCycleFinalDan =
                    isFinale && isFinalDanLetter(rowIndex, colIndex, puzzle.size);
                  const finalCellIndex = rowIndex * puzzle.size + colIndex;
                  const fallTiming = finalFallTimings[finalCellIndex];
                  const cellStyle = {} as WordSearchCellStyle;

                  if (shouldPulse) {
                    cellStyle["--word-search-pulse-delay"] = `${
                      pulseIndex * (isLastLevel ? 0.09 : 0.18)
                    }s`;
                  }

                  if (shouldCycleFinalDan) {
                    cellStyle["--word-search-rainbow-delay"] = `-${
                      (finalCellIndex % 23) * 0.18
                    }s`;
                  }

                  if (isFoundLetter) {
                    cellStyle["--word-search-fire-delay"] = `-${(finalCellIndex % 13) * 0.07}s`;
                  }

                  if (isFinalGravityActive && fallTiming) {
                    cellStyle["--word-search-fall-delay"] = `${fallTiming.delay}s`;
                    cellStyle["--word-search-fall-duration"] = `${fallTiming.duration}s`;
                  }

                  return (
                    <span
                      className={`word-search-cell${isSelected ? " is-selected" : ""}${
                        isFoundLetter ? " is-found-letter" : ""
                      }${
                        shouldPulse ? " is-solution-pulsing" : ""
                      }${shouldPulse && isLastLevel ? " is-final-solution-pulsing" : ""}${
                        isFinalGravityActive ? " is-final-falling" : ""
                      }`}
                      data-word-search-cell
                      data-row={rowIndex}
                      data-col={colIndex}
                      key={`${puzzle.id}-${rowIndex}-${colIndex}`}
                      role="gridcell"
                      aria-label={letter}
                      style={Object.keys(cellStyle).length > 0 ? cellStyle : undefined}
                    >
                      <span
                        className={`word-search-letter-glyph${
                          shouldPulseFinalDisco ? " is-final-disco-pulsing" : ""
                        }${
                          shouldCycleFinalDan ? " is-final-dan-rainbow" : ""
                        }`}
                        data-letter={letter}
                      >
                        {letter}
                      </span>
                    </span>
                  );
                }),
              )}
              {selection.length > 0 &&
                selectionStart &&
                phase !== "solved" &&
                !isFinale &&
                !isFinaleTransition && (
                  <WordSearchSelectionOutline
                    isRejected={phase === "rejected"}
                    axis={selectionAxis}
                    dragPoint={dragPoint}
                    puzzleSize={puzzle.size}
                    selection={selection}
                    start={selectionStart}
                  />
                )}
            </div>
            {successOutlines.map((outlineId) => (
              <span
                className="word-search-solve-outline"
                key={outlineId}
                aria-hidden="true"
                onAnimationEnd={() =>
                  setSuccessOutlines((current) =>
                    current.filter((currentOutlineId) => currentOutlineId !== outlineId),
                  )
                }
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!isFinale && !isFinaleTransition && (
          <motion.div
            key={`${puzzle.id}-clues`}
            className="word-search-clues"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === "solved" && areAllTargetsFound ? 0 : 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {puzzle.targets.map((target) => (
              <span
                className={`word-search-clue${
                  foundTargetIdSet.has(target.id) ? " is-found" : ""
                }`}
                key={target.id}
              >
                {target.clue}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWordSearchNext && (
          <motion.div
            className="word-search-next-complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
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

function DanflixIntro() {
  return (
    <motion.div
      className="danflix-intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <div className="danflix-intro-curtain danflix-intro-curtain-left" />
      <div className="danflix-intro-curtain danflix-intro-curtain-right" />
      <div className="danflix-intro-slit" />
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
            <span>The Dancumentary</span>
          </h1>
          <p className="danflix-description">{danflixDescription}</p>
          <div className="danflix-actions">
            <button className="danflix-play-button" type="button" onClick={onPlay}>
              Play
            </button>
            <button className="danflix-info-button" type="button" disabled>
              <span>More Info</span>
              <span className="danflix-info-icon" aria-hidden="true">i</span>
            </button>
          </div>
        </div>
        <div className="danflix-feature-art">
          <img
            className="danflix-feature-image"
            src="/disco-1280.jpg"
            srcSet="/disco-800.jpg 800w, /disco-1280.jpg 1280w, /disco.jpg 3988w"
            sizes="(max-width: 740px) 100vw, 56vw"
            alt="Disco ball glowing in orange light"
            loading="eager"
            decoding="async"
            draggable={false}
          />
          <p>Disco Dan: The Dancumentary</p>
        </div>
      </section>

      <section className="danflix-row" aria-label="Popular on Danflix">
        <div className="danflix-row-header">
          <h2>Popular on Danflix</h2>
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
            {danflixPosters.map((poster, index) => {
              const title = poster.words.map((word) => word.text).join(" ");

              return (
                <article
                  aria-label={`${title} poster`}
                  className={`danflix-poster ${poster.className}`}
                  key={poster.id}
                  style={
                    {
                      "--poster-delay": `${index * 0.035}s`,
                    } as CSSProperties
                  }
                >
                  <img
                    className="danflix-poster-image"
                    src={poster.image}
                    alt=""
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                  <span className="danflix-poster-title" aria-label={title}>
                    {poster.words.map((word, wordIndex) => (
                      <span
                        aria-hidden="true"
                        className={`danflix-poster-word${word.vertical ? " is-vertical" : ""}`}
                        key={`${poster.id}-${word.text}-${wordIndex}`}
                      >
                        {word.text}
                      </span>
                    ))}
                  </span>
                </article>
              );
            })}
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

type DanflixPlayerPhase =
  | "nowPlaying"
  | "initialLoading"
  | "firstDate"
  | "firstCaption"
  | "firstPaused"
  | "resuming"
  | "secondDate"
  | "secondCaption"
  | "secondPaused"
  | "suspended";

const danflixPlayerTimers: Partial<
  Record<DanflixPlayerPhase, { delay: number; next: DanflixPlayerPhase }>
> = {
  nowPlaying: { delay: 4000, next: "initialLoading" },
  initialLoading: { delay: 2000, next: "firstDate" },
  firstDate: { delay: 2300, next: "firstCaption" },
  firstCaption: { delay: 3800, next: "firstPaused" },
  resuming: { delay: 3000, next: "secondDate" },
  secondDate: { delay: 2300, next: "secondCaption" },
  secondCaption: { delay: 3800, next: "secondPaused" },
};

const getRandomSuspensionDays = () =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");

function DanflixPlayer({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<DanflixPlayerPhase>("nowPlaying");
  const [suspensionDays, setSuspensionDays] = useState(getRandomSuspensionDays);

  useEffect(() => {
    const timerConfig = danflixPlayerTimers[phase];

    if (!timerConfig) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPhase(timerConfig.next), timerConfig.delay);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "suspended") {
      return undefined;
    }

    setSuspensionDays(getRandomSuspensionDays());
    const interval = window.setInterval(() => {
      setSuspensionDays(getRandomSuspensionDays());
    }, 180);

    return () => window.clearInterval(interval);
  }, [phase]);

  return (
    <motion.div
      className="danflix-player"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {phase === "nowPlaying" && <DanflixNowPlaying />}

      {phase === "initialLoading" && (
        <DanflixLoadingStage ariaLabel="Documentary loading" />
      )}

      {(phase === "firstDate" || phase === "firstCaption") && (
        <DanflixDocumentaryStage
          caption="Dan was born."
          showCaption={phase === "firstCaption"}
        />
      )}

      {phase === "firstPaused" && (
        <DanflixPausedStage
          caption="Dan was born."
          question="Are you still watching?"
          primaryLabel="Yes"
          secondaryLabel="Not anymore"
          onPrimary={() => setPhase("resuming")}
        />
      )}

      {phase === "resuming" && (
        <DanflixLoadingStage
          ariaLabel="Resuming documentary"
          label="Resuming from beginning"
        />
      )}

      {(phase === "secondDate" || phase === "secondCaption") && (
        <DanflixDocumentaryStage
          caption="Dan was died."
          showCaption={phase === "secondCaption"}
        />
      )}

      {phase === "secondPaused" && (
        <DanflixPausedStage
          caption="Dan was died."
          question="Are you still watching?"
          primaryLabel="Disco"
          secondaryLabel="No Disco"
          onPrimary={() => setPhase("suspended")}
        />
      )}

      {phase === "suspended" && (
        <DanflixSuspendedStage suspensionDays={suspensionDays} onNext={onNext} />
      )}
    </motion.div>
  );
}

function DanflixNowPlaying() {
  return (
    <div className="danflix-player-stage danflix-now-playing">
      <div className="danflix-player-glow" aria-hidden="true" />
      <p className="danflix-player-kicker">Now Playing</p>
      <h1>Disco Dan: The Dancumentary</h1>
      <div className="danflix-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function DanflixLoadingStage({
  ariaLabel,
  label,
}: {
  ariaLabel: string;
  label?: string;
}) {
  return (
    <div className="danflix-player-stage danflix-loading-stage" aria-label={ariaLabel}>
      {label && <p>{label}</p>}
      <div className="danflix-loading-wheel" aria-hidden="true" />
    </div>
  );
}

function DanflixDocumentaryStage({
  caption,
  animateIn = true,
  isPaused = false,
  showCaption = true,
}: {
  caption: string;
  animateIn?: boolean;
  isPaused?: boolean;
  showCaption?: boolean;
}) {
  return (
    <div
      className={`danflix-player-stage danflix-documentary-stage ${
        isPaused ? "is-paused" : ""
      }`}
    >
      <div className="danflix-documentary-copy">
        <motion.h1
          className="danflix-documentary-date"
          initial={animateIn ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          JAN 12, 1965
        </motion.h1>
        <motion.p
          className="danflix-documentary-caption"
          initial={animateIn ? { opacity: 0 } : false}
          animate={{ opacity: showCaption ? 1 : 0 }}
          transition={{ duration: 1.65, ease: "easeOut" }}
        >
          {caption}
        </motion.p>
      </div>
    </div>
  );
}

function DanflixPausedStage({
  caption,
  question,
  primaryLabel,
  secondaryLabel,
  onPrimary,
}: {
  caption: string;
  question: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <>
      <DanflixDocumentaryStage caption={caption} animateIn={false} isPaused />
      <div className="danflix-pause-overlay">
        <div className="danflix-pause-symbol" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="danflix-pause-question">
          <p>{question}</p>
          <div className="danflix-choice-row">
            <button className="danflix-choice-button" type="button" onClick={onPrimary}>
              {primaryLabel}
            </button>
            <button
              className="danflix-choice-button danflix-choice-button-secondary"
              type="button"
              onClick={() => {}}
            >
              {secondaryLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DanflixSuspendedStage({
  onNext,
  suspensionDays,
}: {
  onNext: () => void;
  suspensionDays: string;
}) {
  return (
    <div className="danflix-player-stage danflix-suspension-stage">
      <div className="danflix-suspension-content">
        <p className="danflix-suspension-copy">
          Your subscription to Danflix was shared with a man in a business suit.
          Account <span className="danflix-suspension-word">suspended</span> for{" "}
          <span className="danflix-suspension-days">{suspensionDays}</span> days.
        </p>
        <button
          className="danflix-forgiveness-button"
          type="button"
          onClick={onNext}
        >
          Request Disco Dan&apos;s Forgiveness
        </button>
      </div>
    </div>
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
    if (getDevSceneShortcut(question.id, nextValue) || isBlogShortcut(question.id, nextValue)) {
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

function DiscoDanRevealScene({
  performanceMode,
  onStart,
}: {
  performanceMode: PerformanceMode;
  onStart: () => void;
}) {
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <PaintBurstCanvas performanceMode={performanceMode} />
      <RainbowFireCanvas performanceMode={performanceMode} targetRef={titleRef} />
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

type FinalePhase = "intro" | "destruction" | "ending";
type FinaleStageKey =
  | "animals"
  | "dandle"
  | "wordSearch"
  | "xp"
  | "wiki"
  | "danflix"
  | "jeopardy"
  | "charity";
type FinaleLength = number | string;
type FinaleBurnStyle = CSSProperties & Record<`--${string}`, string | number>;

type FinaleCoinPhysics = {
  seed: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
};

type FinaleCoinPhysicsState = FinaleCoinPhysics & {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
};

type FinaleBurnItem = {
  id: string;
  left: string;
  top: string;
  width: string;
  height: string;
  content: ReactNode;
  burnRadius?: number;
  className?: string;
  driftDelay?: number;
  driftDuration?: number;
  driftRotate?: number;
  driftX?: number;
  driftY?: number;
  isAnchored?: boolean;
  physics?: FinaleCoinPhysics;
  style?: CSSProperties;
};

type FinaleFlamethrowerState = CharityCleanupFlamethrowerState & {
  dragging: boolean;
  lastPointerX: number;
  lastPointerY: number;
  pointerId: number | null;
};

type FinaleBurnBurst = {
  id: number;
  x: number;
  y: number;
  intensity: number;
};

type FinaleItemMeasurement = {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  burnRadius: number;
};

type FinaleHitGrid = {
  cellSize: number;
  cells: Map<string, FinaleItemMeasurement[]>;
};

const FINALE_BURN_REMOVAL_DELAY_MS = 360;
const FINALE_HIT_GRID_CELL_SIZE = 128;
const FINALE_HIT_GRID_PADDING = 48;

function finaleHitGridKey(column: number, row: number) {
  return `${column}:${row}`;
}

function createFinaleItemMeasurement(
  item: FinaleBurnItem,
  element: HTMLElement,
): FinaleItemMeasurement {
  const rect = element.getBoundingClientRect();

  return {
    id: item.id,
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    burnRadius: item.burnRadius ?? 48,
  };
}

function createFinaleHitGrid(measurements: Iterable<FinaleItemMeasurement>): FinaleHitGrid {
  const cells = new Map<string, FinaleItemMeasurement[]>();

  for (const measurement of measurements) {
    const padding = measurement.burnRadius + FINALE_HIT_GRID_PADDING;
    const minColumn = Math.floor((measurement.left - padding) / FINALE_HIT_GRID_CELL_SIZE);
    const maxColumn = Math.floor((measurement.right + padding) / FINALE_HIT_GRID_CELL_SIZE);
    const minRow = Math.floor((measurement.top - padding) / FINALE_HIT_GRID_CELL_SIZE);
    const maxRow = Math.floor((measurement.bottom + padding) / FINALE_HIT_GRID_CELL_SIZE);

    for (let column = minColumn; column <= maxColumn; column += 1) {
      for (let row = minRow; row <= maxRow; row += 1) {
        const key = finaleHitGridKey(column, row);
        const cell = cells.get(key);

        if (cell) {
          cell.push(measurement);
        } else {
          cells.set(key, [measurement]);
        }
      }
    }
  }

  return {
    cellSize: FINALE_HIT_GRID_CELL_SIZE,
    cells,
  };
}

function getFinaleHitCandidates(
  grid: FinaleHitGrid,
  x: number,
  y: number,
  radius: number,
) {
  const candidates: FinaleItemMeasurement[] = [];
  const seenIds = new Set<string>();
  const centerColumn = Math.floor(x / grid.cellSize);
  const centerRow = Math.floor(y / grid.cellSize);
  const range = Math.max(1, Math.ceil((radius + FINALE_HIT_GRID_PADDING) / grid.cellSize));

  for (let column = centerColumn - range; column <= centerColumn + range; column += 1) {
    for (let row = centerRow - range; row <= centerRow + range; row += 1) {
      const cell = grid.cells.get(finaleHitGridKey(column, row));

      if (!cell) {
        continue;
      }

      cell.forEach((measurement) => {
        if (seenIds.has(measurement.id)) {
          return;
        }

        seenIds.add(measurement.id);
        candidates.push(measurement);
      });
    }
  }

  return candidates;
}

function areFinaleIdSetsEqual(first: Set<string>, second: Set<string>) {
  if (first.size !== second.size) {
    return false;
  }

  for (const id of first) {
    if (!second.has(id)) {
      return false;
    }
  }

  return true;
}

function isFinaleWikiTextItem(item: FinaleBurnItem) {
  return item.className?.includes("finale-letter-wiki") ?? false;
}

function isFinaleWikiBackdropItem(item: FinaleBurnItem) {
  if (item.className?.includes("finale-wiki-page-piece")) {
    return true;
  }

  if (item.className?.includes("finale-wiki-browser-piece")) {
    return true;
  }

  return [
    "wiki-tab",
    "wiki-title-bar",
    "wiki-toolbar",
    "wiki-sidebar",
    "wiki-heading",
    "wiki-notice",
    "wiki-infobox",
  ].includes(item.id);
}

function finaleMeasurementContainsPoint(
  measurement: FinaleItemMeasurement,
  x: number,
  y: number,
) {
  return (
    x >= measurement.left &&
    x <= measurement.right &&
    y >= measurement.top &&
    y <= measurement.bottom
  );
}

const finaleIntroLines = [
  "50 years ago, Disco Dan won a competition...",
  "Now, you must do the same...",
  "Achieve. Disco. Glory.",
];

const finaleStageKeys: FinaleStageKey[] = [
  "animals",
  "dandle",
  "wordSearch",
  "xp",
  "wiki",
  "danflix",
  "jeopardy",
  "charity",
];

const finaleStageClassNames: Record<FinaleStageKey, string> = {
  animals: "finale-stage-animals",
  dandle: "finale-stage-dandle",
  wordSearch: "finale-stage-word-search",
  xp: "finale-stage-xp",
  wiki: "finale-stage-wiki",
  danflix: "finale-stage-danflix",
  jeopardy: "finale-stage-jeopardy",
  charity: "finale-stage-charity",
};

const finaleStageLabels: Record<FinaleStageKey, string> = {
  animals: "Name animals until failure",
  dandle: "Disco Dandle",
  wordSearch: "Word Search",
  xp: "Windows XP desktop",
  wiki: "Wikipedia",
  danflix: "Danflix",
  jeopardy: "Jeopardy board",
  charity: "Charity Simulator",
};

function FinaleScene({ performanceMode }: { performanceMode: PerformanceMode }) {
  const [phase, setPhase] = useState<FinalePhase>("intro");

  return (
    <motion.section
      className="finale-scene finale-long-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <FinaleIntro key="finale-intro" onNext={() => setPhase("destruction")} />
        )}

        {phase === "destruction" && (
          <FinaleDestructionSequence
            key="finale-destruction"
            performanceMode={performanceMode}
            onComplete={() => setPhase("ending")}
          />
        )}

        {phase === "ending" && (
          <FinaleEnding key="finale-ending" performanceMode={performanceMode} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function FinaleIntro({ onNext }: { onNext: () => void }) {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setVisibleLineCount(1), 850),
      window.setTimeout(() => setVisibleLineCount(2), 2900),
      window.setTimeout(() => setVisibleLineCount(3), 5000),
      window.setTimeout(() => setShowNext(true), 7400),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <motion.div
      className="finale-intro-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="finale-intro-lines" aria-live="polite">
        {finaleIntroLines.map((line, index) => (
          <div className="finale-intro-line-slot" key={line}>
            <AnimatePresence>
              {visibleLineCount > index && (
                <motion.p
                  className={index === finaleIntroLines.length - 1 ? "is-glory" : ""}
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div className="finale-intro-button-slot">
          <AnimatePresence>
            {showNext && visibleLineCount === finaleIntroLines.length && (
              <motion.button
                className="finale-intro-next"
                type="button"
                onClick={onNext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                Next
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FinaleDestructionSequence({
  onComplete,
  performanceMode,
}: {
  onComplete: () => void;
  performanceMode: PerformanceMode;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const initialFlamethrowerPosition = useMemo(getCleanupFlamethrowerLandingPosition, []);
  const [isFlamethrowerDragging, setIsFlamethrowerDragging] = useState(false);
  const flamethrowerStateRef = useRef<FinaleFlamethrowerState>({
    ...initialFlamethrowerPosition,
    active: false,
    dragging: false,
    dx: 0,
    dy: -1,
    lastPointerX: initialFlamethrowerPosition.x,
    lastPointerY: initialFlamethrowerPosition.y,
    pointerId: null,
  });
  const stageKey = finaleStageKeys[stageIndex] ?? "charity";

  const stopPersistedFlamethrower = useCallback((pointerId?: number) => {
    const flamethrower = flamethrowerStateRef.current;

    if (
      typeof pointerId === "number" &&
      flamethrower.pointerId !== null &&
      flamethrower.pointerId !== pointerId
    ) {
      return;
    }

    flamethrower.active = false;
    flamethrower.dragging = false;
    flamethrower.pointerId = null;
    setIsFlamethrowerDragging(false);
  }, []);

  useEffect(() => {
    if (!isFlamethrowerDragging) {
      return undefined;
    }

    const handlePointerEnd = (event: globalThis.PointerEvent) => {
      stopPersistedFlamethrower(event.pointerId);
    };

    window.addEventListener("pointerup", handlePointerEnd, true);
    window.addEventListener("pointercancel", handlePointerEnd, true);

    return () => {
      window.removeEventListener("pointerup", handlePointerEnd, true);
      window.removeEventListener("pointercancel", handlePointerEnd, true);
    };
  }, [isFlamethrowerDragging, stopPersistedFlamethrower]);

  const completeStage = () => {
    if (stageIndex >= finaleStageKeys.length - 1) {
      onComplete();
      return;
    }

    setStageIndex((current) => current + 1);
  };

  return (
    <FinaleBurnStage
      key={stageKey}
      flamethrowerStateRef={flamethrowerStateRef}
      isFlamethrowerDragging={isFlamethrowerDragging}
      performanceMode={performanceMode}
      setIsFlamethrowerDragging={setIsFlamethrowerDragging}
      stageKey={stageKey}
      onComplete={completeStage}
    />
  );
}

function FinaleEnding({ performanceMode }: { performanceMode: PerformanceMode }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showBlogButton, setShowBlogButton] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBlogButton(true), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="finale-ending-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <PaintBurstCanvas performanceMode={performanceMode} />
      <RainbowFireCanvas performanceMode={performanceMode} targetRef={titleRef} />
      <div className="finale-content">
        <div className="title-anchor">
          <motion.h1
            ref={titleRef}
            className="finale-ending-title"
            aria-label="You are Disco Dan"
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
            {["YOU.", "ARE.", "DISCO.", "DAN."].map((word) => (
              <span key={word}>{word}</span>
            ))}
          </motion.h1>
        </div>
        <AnimatePresence>
          {showBlogButton && (
            <div className="finale-blog-button-anchor">
              <motion.a
                className="finale-blog-button"
                href={blogUrl}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              >
                visit sam&apos;s blog
              </motion.a>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FinaleBurnStage({
  flamethrowerStateRef,
  isFlamethrowerDragging,
  onComplete,
  performanceMode,
  setIsFlamethrowerDragging,
  stageKey,
}: {
  flamethrowerStateRef: MutableRefObject<FinaleFlamethrowerState>;
  isFlamethrowerDragging: boolean;
  onComplete: () => void;
  performanceMode: PerformanceMode;
  setIsFlamethrowerDragging: (isDragging: boolean) => void;
  stageKey: FinaleStageKey;
}) {
  const items = useMemo(
    () => createFinaleBurnItems(stageKey, performanceMode),
    [performanceMode, stageKey],
  );
  const physicsItems = useMemo(
    () =>
      items.filter(
        (item): item is FinaleBurnItem & { physics: FinaleCoinPhysics } =>
          item.physics !== undefined,
      ),
    [items],
  );
  const [destroyedIds, setDestroyedIds] = useState<Set<string>>(() => new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [contrastingTextIds, setContrastingTextIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [burnBursts, setBurnBursts] = useState<FinaleBurnBurst[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const itemMeasurementsRef = useRef<Map<string, FinaleItemMeasurement>>(new Map());
  const itemHitGridRef = useRef<FinaleHitGrid>({
    cellSize: FINALE_HIT_GRID_CELL_SIZE,
    cells: new Map(),
  });
  const hasMovingItemsRef = useRef(false);
  const lastMovingMeasureRef = useRef(0);
  const destroyedIdsRef = useRef(destroyedIds);
  const burnBurstIdRef = useRef(0);
  const removalTimerIdsRef = useRef<number[]>([]);
  const flamethrowerButtonRef = useRef<HTMLButtonElement | null>(null);
  const burnAtRef = useRef<(x: number, y: number, radius?: number) => void>(() => {});

  useEffect(() => {
    destroyedIdsRef.current = destroyedIds;
  }, [destroyedIds]);

  useEffect(() => {
    hasMovingItemsRef.current = physicsItems.length > 0;
    lastMovingMeasureRef.current = 0;
  }, [physicsItems.length]);

  useEffect(
    () => () => {
      removalTimerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    },
    [],
  );

  const visibleItems = useMemo(
    () => items.filter((item) => !removedIds.has(item.id)),
    [items, removedIds],
  );

  const registerItem = useCallback((id: string, element: HTMLDivElement | null) => {
    itemRefs.current[id] = element;
  }, []);

  const measureItems = useCallback(() => {
    const nextMeasurements = new Map<string, FinaleItemMeasurement>();

    items.forEach((item) => {
      const element = itemRefs.current[item.id];

      if (!element) {
        return;
      }

      nextMeasurements.set(item.id, createFinaleItemMeasurement(item, element));
    });

    itemMeasurementsRef.current = nextMeasurements;
    itemHitGridRef.current = createFinaleHitGrid(nextMeasurements.values());
  }, [items]);

  useLayoutEffect(() => {
    measureItems();
    const frame = window.requestAnimationFrame(measureItems);

    window.addEventListener("resize", measureItems);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureItems);
    };
  }, [measureItems]);

  useLayoutEffect(() => {
    if (stageKey !== "wiki" || removedIds.size === 0) {
      setContrastingTextIds((current) =>
        current.size === 0 ? current : new Set(),
      );
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      measureItems();

      const measurements = itemMeasurementsRef.current;
      const backdropMeasurements = items
        .filter((item) => isFinaleWikiBackdropItem(item) && !removedIds.has(item.id))
        .map((item) => measurements.get(item.id))
        .filter((measurement): measurement is FinaleItemMeasurement => Boolean(measurement));
      const nextContrastingIds = new Set<string>();

      items.forEach((item) => {
        if (!isFinaleWikiTextItem(item) || removedIds.has(item.id)) {
          return;
        }

        const measurement = measurements.get(item.id);

        if (!measurement) {
          return;
        }

        const centerX = measurement.left + measurement.width / 2;
        const centerY = measurement.top + measurement.height / 2;
        const hasBackdrop = backdropMeasurements.some((backdropMeasurement) =>
          finaleMeasurementContainsPoint(backdropMeasurement, centerX, centerY),
        );

        if (!hasBackdrop) {
          nextContrastingIds.add(item.id);
        }
      });

      setContrastingTextIds((current) =>
        areFinaleIdSetsEqual(current, nextContrastingIds)
          ? current
          : nextContrastingIds,
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [items, measureItems, removedIds, stageKey]);

  useEffect(() => {
    if (physicsItems.length === 0) {
      return undefined;
    }

    const physicsStates = new Map<string, FinaleCoinPhysicsState>();
    const frameIntervalMs = performanceMode === "reduced" ? 33 : 16;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastPaint = 0;

    const getStageBounds = () => {
      const rect = stageRef.current?.getBoundingClientRect();

      return {
        bottom: rect?.bottom ?? window.innerHeight,
        left: rect?.left ?? 0,
        right: rect?.right ?? window.innerWidth,
        top: rect?.top ?? 0,
      };
    };

    const getPhysicsState = (item: FinaleBurnItem & { physics: FinaleCoinPhysics }) => {
      const currentState = physicsStates.get(item.id);

      if (currentState) {
        return currentState;
      }

      const element = itemRefs.current[item.id];

      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const nextState: FinaleCoinPhysicsState = {
        ...item.physics,
        baseX: x,
        baseY: y,
        radius: Math.max(rect.width, rect.height) / 2,
        x,
        y,
      };

      physicsStates.set(item.id, nextState);
      return nextState;
    };

    const applyPhysicsState = (
      item: FinaleBurnItem & { physics: FinaleCoinPhysics },
      state: FinaleCoinPhysicsState,
    ) => {
      const element = itemRefs.current[item.id];

      if (!element) {
        return;
      }

      element.style.setProperty("--physics-x", `${state.x - state.baseX}px`);
      element.style.setProperty("--physics-y", `${state.y - state.baseY}px`);
      element.style.setProperty("--coin-angle", `${state.angle}rad`);
    };

    const clampToBounds = (
      state: FinaleCoinPhysicsState,
      bounds: ReturnType<typeof getStageBounds>,
    ) => {
      if (state.x - state.radius < bounds.left) {
        state.x = bounds.left + state.radius;
        state.vx *= -0.72;
      } else if (state.x + state.radius > bounds.right) {
        state.x = bounds.right - state.radius;
        state.vx *= -0.72;
      }

      if (state.y - state.radius < bounds.top) {
        state.y = bounds.top + state.radius;
        state.vy *= -0.72;
      } else if (state.y + state.radius > bounds.bottom) {
        state.y = bounds.bottom - state.radius;
        state.vy *= -0.72;
      }
    };

    const resolveCoinCollisions = (bounds: ReturnType<typeof getStageBounds>) => {
      for (let outer = 0; outer < physicsItems.length; outer += 1) {
        const firstItem = physicsItems[outer];

        if (destroyedIdsRef.current.has(firstItem.id) || !itemRefs.current[firstItem.id]) {
          continue;
        }

        const first = getPhysicsState(firstItem);

        if (!first) {
          continue;
        }

        for (let inner = outer + 1; inner < physicsItems.length; inner += 1) {
          const secondItem = physicsItems[inner];

          if (
            destroyedIdsRef.current.has(secondItem.id) ||
            !itemRefs.current[secondItem.id]
          ) {
            continue;
          }

          const second = getPhysicsState(secondItem);

          if (!second) {
            continue;
          }

          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
          const minDistance = first.radius + second.radius;

          if (distance >= minDistance) {
            continue;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          first.x -= nx * overlap * 0.5;
          first.y -= ny * overlap * 0.5;
          second.x += nx * overlap * 0.5;
          second.y += ny * overlap * 0.5;

          const relativeVelocity = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
          if (relativeVelocity > 0) {
            continue;
          }

          const impulse = -relativeVelocity * 0.45;
          first.vx -= impulse * nx;
          first.vy -= impulse * ny;
          second.vx += impulse * nx;
          second.vy += impulse * ny;
        }

        clampToBounds(first, bounds);
      }

      physicsItems.forEach((item) => {
        const state = physicsStates.get(item.id);

        if (state && !destroyedIdsRef.current.has(item.id)) {
          clampToBounds(state, bounds);
        }
      });
    };

    const animateCoins = (now: number) => {
      if (document.hidden || now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animateCoins);
        return;
      }

      const delta = Math.min(2.3, (now - lastFrame) / 16.67);
      const bounds = getStageBounds();
      lastFrame = now;
      lastPaint = now;

      physicsItems.forEach((item) => {
        if (destroyedIdsRef.current.has(item.id)) {
          return;
        }

        if (!itemRefs.current[item.id]) {
          physicsStates.delete(item.id);
          return;
        }

        const state = getPhysicsState(item);

        if (!state) {
          return;
        }

        state.vx += Math.sin(now * 0.0017 + state.seed) * 0.014 * delta;
        state.vy += Math.cos(now * 0.0013 + state.seed * 1.7) * 0.014 * delta;
        state.vx *= 0.998;
        state.vy *= 0.998;
        state.x += state.vx * delta;
        state.y += state.vy * delta;
        state.angle += state.va * delta;
        state.va *= 0.992;

        clampToBounds(state, bounds);
      });

      resolveCoinCollisions(bounds);

      physicsItems.forEach((item) => {
        const state = physicsStates.get(item.id);

        if (state && !destroyedIdsRef.current.has(item.id)) {
          applyPhysicsState(item, state);
        }
      });

      animationFrame = window.requestAnimationFrame(animateCoins);
    };

    animationFrame = window.requestAnimationFrame(animateCoins);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [performanceMode, physicsItems]);

  const updateFlamethrowerVisual = useCallback((x: number, y: number) => {
    const button = flamethrowerButtonRef.current;

    if (!button) {
      return;
    }

    button.style.setProperty("--flamethrower-x", `${x}px`);
    button.style.setProperty("--flamethrower-y", `${y}px`);
  }, []);

  const updateFlamethrowerParticleState = useCallback(
    (active: boolean, dx: number, dy: number, x: number, y: number) => {
      const particleState = flamethrowerStateRef.current;
      particleState.active = active;
      particleState.dx = dx;
      particleState.dy = dy;
      particleState.x = x;
      particleState.y = y;
    },
    [flamethrowerStateRef],
  );

  useLayoutEffect(() => {
    const flamethrower = flamethrowerStateRef.current;
    flamethrower.active = flamethrower.dragging;
    updateFlamethrowerVisual(flamethrower.x, flamethrower.y);
  }, [flamethrowerStateRef, stageKey, updateFlamethrowerVisual]);

  const handleParticleBurn = useCallback(
    (x: number, y: number, radius: number) => burnAtRef.current(x, y, radius),
    [],
  );

  burnAtRef.current = (x: number, y: number, radius = 0) => {
    const nextDestroyedIds: string[] = [];
    const nextDestroyedIdSet = new Set<string>();
    const nextBurnBursts: FinaleBurnBurst[] = [];

    if (hasMovingItemsRef.current) {
      const now = performance.now();
      const measureIntervalMs = performanceMode === "reduced" ? 64 : 32;

      if (
        itemMeasurementsRef.current.size === 0 ||
        now - lastMovingMeasureRef.current >= measureIntervalMs
      ) {
        measureItems();
        lastMovingMeasureRef.current = now;
      }
    } else if (itemMeasurementsRef.current.size === 0) {
      measureItems();
    }

    const measurements = itemMeasurementsRef.current;
    const hitGrid = itemHitGridRef.current;
    const candidates =
      hitGrid.cells.size > 0
        ? getFinaleHitCandidates(hitGrid, x, y, radius)
        : Array.from(measurements.values());

    candidates.forEach((measurement) => {
      if (
        destroyedIdsRef.current.has(measurement.id) ||
        nextDestroyedIdSet.has(measurement.id)
      ) {
        return;
      }

      const closestX = Math.min(measurement.right, Math.max(measurement.left, x));
      const closestY = Math.min(measurement.bottom, Math.max(measurement.top, y));
      const dx = x - closestX;
      const dy = y - closestY;
      const burnRadius = measurement.burnRadius + radius;

      if (dx * dx + dy * dy <= burnRadius * burnRadius) {
        nextDestroyedIdSet.add(measurement.id);
        nextDestroyedIds.push(measurement.id);
        nextBurnBursts.push({
          id: burnBurstIdRef.current,
          intensity: Math.max(
            0.7,
            Math.min(3.4, Math.sqrt(measurement.width * measurement.height) / 42),
          ),
          x: closestX,
          y: closestY,
        });
        burnBurstIdRef.current += 1;
      }
    });

    if (nextDestroyedIds.length === 0) {
      return;
    }

    const nextDestroyedSet = new Set(destroyedIdsRef.current);
    nextDestroyedIds.forEach((id) => nextDestroyedSet.add(id));
    destroyedIdsRef.current = nextDestroyedSet;

    setDestroyedIds(nextDestroyedSet);
    setBurnBursts((current) => [...current, ...nextBurnBursts].slice(-160));

    const removalTimerId = window.setTimeout(() => {
      setRemovedIds((current) => {
        let didChange = false;
        const nextRemovedSet = new Set(current);

        nextDestroyedIds.forEach((id) => {
          if (nextRemovedSet.has(id)) {
            return;
          }

          nextRemovedSet.add(id);
          didChange = true;
        });

        return didChange ? nextRemovedSet : current;
      });
    }, FINALE_BURN_REMOVAL_DELAY_MS);

    removalTimerIdsRef.current.push(removalTimerId);
  };

  useEffect(() => {
    if (!isFlamethrowerDragging) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const flamethrower = flamethrowerStateRef.current;
      burnAtRef.current(flamethrower.x, flamethrower.y, 12);
    }, performanceMode === "reduced" ? 140 : 80);

    return () => window.clearInterval(interval);
  }, [flamethrowerStateRef, isFlamethrowerDragging, performanceMode]);

  useEffect(() => {
    if (items.length === 0 || destroyedIds.size < items.length) {
      return undefined;
    }

    const timer = window.setTimeout(onComplete, 720);
    return () => window.clearTimeout(timer);
  }, [destroyedIds.size, items.length, onComplete]);

  const updateFlamethrowerFromPoint = useCallback(
    (clientX: number, clientY: number, shouldBurn: boolean) => {
      const nextPosition = clampFlamethrowerPosition(clientX, clientY);
      const flamethrower = flamethrowerStateRef.current;
      const direction = getContinuousFlamethrowerDirection(
        clientX - flamethrower.lastPointerX,
        clientY - flamethrower.lastPointerY,
        flamethrower.dx,
        flamethrower.dy,
      );
      const isActive = shouldBurn && flamethrower.dragging;

      flamethrower.dx = direction.dx;
      flamethrower.dy = direction.dy;
      flamethrower.lastPointerX = clientX;
      flamethrower.lastPointerY = clientY;
      flamethrower.x = nextPosition.x;
      flamethrower.y = nextPosition.y;
      flamethrower.active = isActive;

      updateFlamethrowerVisual(nextPosition.x, nextPosition.y);
      updateFlamethrowerParticleState(
        isActive,
        direction.dx,
        direction.dy,
        nextPosition.x,
        nextPosition.y,
      );

      if (shouldBurn) {
        burnAtRef.current(nextPosition.x, nextPosition.y, 12);
      }
    },
    [flamethrowerStateRef, updateFlamethrowerParticleState, updateFlamethrowerVisual],
  );

  const handleFlamethrowerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const flamethrower = flamethrowerStateRef.current;
    flamethrower.dragging = true;
    flamethrower.active = true;
    flamethrower.pointerId = event.pointerId;
    flamethrower.lastPointerX = event.clientX;
    flamethrower.lastPointerY = event.clientY;
    setIsFlamethrowerDragging(true);
    updateFlamethrowerFromPoint(event.clientX, event.clientY, true);
  }, [flamethrowerStateRef, setIsFlamethrowerDragging, updateFlamethrowerFromPoint]);

  const handleFlamethrowerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const flamethrower = flamethrowerStateRef.current;

    if (!flamethrower.dragging || flamethrower.pointerId !== event.pointerId) {
      return;
    }

    updateFlamethrowerFromPoint(event.clientX, event.clientY, true);
  }, [flamethrowerStateRef, updateFlamethrowerFromPoint]);

  const stopFlamethrower = useCallback((pointerId?: number) => {
    const flamethrower = flamethrowerStateRef.current;

    if (
      typeof pointerId === "number" &&
      flamethrower.pointerId !== null &&
      flamethrower.pointerId !== pointerId
    ) {
      return;
    }

    flamethrower.dragging = false;
    flamethrower.active = false;
    flamethrower.pointerId = null;
    setIsFlamethrowerDragging(false);
    updateFlamethrowerParticleState(
      false,
      flamethrower.dx,
      flamethrower.dy,
      flamethrower.x,
      flamethrower.y,
    );
  }, [flamethrowerStateRef, setIsFlamethrowerDragging, updateFlamethrowerParticleState]);

  useEffect(() => {
    if (!isFlamethrowerDragging) {
      return undefined;
    }

    const handleDocumentPointerMove = (event: globalThis.PointerEvent) => {
      const flamethrower = flamethrowerStateRef.current;

      if (
        event.target === flamethrowerButtonRef.current ||
        !flamethrower.dragging ||
        flamethrower.pointerId !== event.pointerId
      ) {
        return;
      }

      updateFlamethrowerFromPoint(event.clientX, event.clientY, true);
    };
    const handleDocumentPointerEnd = (event: globalThis.PointerEvent) => {
      stopFlamethrower(event.pointerId);
    };

    window.addEventListener("pointermove", handleDocumentPointerMove, { passive: true });
    window.addEventListener("pointerup", handleDocumentPointerEnd);
    window.addEventListener("pointercancel", handleDocumentPointerEnd);

    return () => {
      window.removeEventListener("pointermove", handleDocumentPointerMove);
      window.removeEventListener("pointerup", handleDocumentPointerEnd);
      window.removeEventListener("pointercancel", handleDocumentPointerEnd);
    };
  }, [
    flamethrowerStateRef,
    isFlamethrowerDragging,
    stopFlamethrower,
    updateFlamethrowerFromPoint,
  ]);

  return (
    <motion.div
      className={`finale-destruction-scene ${finaleStageClassNames[stageKey]}`}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      aria-label={finaleStageLabels[stageKey]}
    >
      <div className="finale-destruction-stage" ref={stageRef}>
        {visibleItems.map((item) => (
          <FinaleBurnItemView
            key={item.id}
            item={item}
            isContrasting={contrastingTextIds.has(item.id)}
            isDestroyed={destroyedIds.has(item.id)}
            registerItem={registerItem}
          />
        ))}
      </div>
      <FinaleFlamethrowerParticles
        burnBursts={burnBursts}
        flamethrowerRef={flamethrowerStateRef}
        onBurn={handleParticleBurn}
        performanceMode={performanceMode}
      />
      <button
        aria-label="Move the flamethrower"
        className={`charity-cleanup-flamethrower-button finale-flamethrower-button${
          isFlamethrowerDragging ? " is-dragging" : ""
        }`}
        ref={flamethrowerButtonRef}
        style={
          {
            "--flamethrower-x": `${flamethrowerStateRef.current.x}px`,
            "--flamethrower-y": `${flamethrowerStateRef.current.y}px`,
          } as CSSProperties
        }
        type="button"
        onPointerCancel={(event) => stopFlamethrower(event.pointerId)}
        onPointerDown={handleFlamethrowerDown}
        onPointerMove={handleFlamethrowerMove}
        onPointerUp={(event) => stopFlamethrower(event.pointerId)}
      />
    </motion.div>
  );
}

type FinaleBurnItemViewProps = {
  item: FinaleBurnItem;
  isContrasting: boolean;
  isDestroyed: boolean;
  registerItem: (id: string, element: HTMLDivElement | null) => void;
};

const FinaleBurnItemView = memo(function FinaleBurnItemView({
  item,
  isContrasting,
  isDestroyed,
  registerItem,
}: FinaleBurnItemViewProps) {
  const itemStyle = useMemo(
    () =>
      ({
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
        ...item.style,
        "--drift-delay": `${item.driftDelay ?? 0.5}s`,
        "--drift-duration": `${item.driftDuration ?? 6}s`,
        "--drift-rotate": `${item.driftRotate ?? 0}deg`,
        "--drift-x": `${item.driftX ?? 0}px`,
        "--drift-y": `${item.driftY ?? 0}px`,
      }) as FinaleBurnStyle,
    [item],
  );
  const setItemRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerItem(item.id, element);
    },
    [item.id, registerItem],
  );
  const className = [
    "finale-burn-item",
    item.isAnchored ? "finale-anchored-piece" : "",
    item.className ?? "",
    isContrasting ? "finale-wiki-text-is-contrasting" : "",
    isDestroyed ? "is-destroyed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} ref={setItemRef} style={itemStyle}>
      <div className="finale-burn-item-inner">{item.content}</div>
    </div>
  );
});

const FinaleFlamethrowerParticles = memo(function FinaleFlamethrowerParticles({
  burnBursts,
  flamethrowerRef,
  onBurn,
  performanceMode,
}: {
  burnBursts: FinaleBurnBurst[];
  flamethrowerRef: MutableRefObject<CharityCleanupFlamethrowerState>;
  onBurn: (x: number, y: number, radius: number) => void;
  performanceMode: PerformanceMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onBurnRef = useRef(onBurn);
  const pendingBurnBurstsRef = useRef<FinaleBurnBurst[]>([]);
  const seenBurnBurstIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    onBurnRef.current = onBurn;
  }, [onBurn]);

  useEffect(() => {
    const seenBurnBurstIds = seenBurnBurstIdsRef.current;
    const activeBurnBurstIds = new Set(burnBursts.map((burnBurst) => burnBurst.id));

    burnBursts.forEach((burnBurst) => {
      if (seenBurnBurstIds.has(burnBurst.id)) {
        return;
      }

      seenBurnBurstIds.add(burnBurst.id);
      pendingBurnBurstsRef.current.push(burnBurst);
    });

    seenBurnBurstIds.forEach((id) => {
      if (!activeBurnBurstIds.has(id)) {
        seenBurnBurstIds.delete(id);
      }
    });
  }, [burnBursts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduceEffects = performanceMode === "reduced" || reducedMotion;
    const particles: CharityParticle[] = [];
    const maxParticles = reduceEffects ? 120 : 260;
    const frameIntervalMs = reduceEffects ? 33 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastPaint = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, reduceEffects ? 1 : 1.4);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const addParticle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      color: string,
      radius: number,
      life: number,
      canBurnItem = true,
    ) => {
      if (particles.length >= maxParticles) {
        particles.shift();
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        color,
        radius,
        life,
        maxLife: life,
        canBurnItem,
      });
    };

    const emitFlame = () => {
      const current = flamethrowerRef.current;

      if (!current.active) {
        return;
      }

      const flameCount = reduceEffects ? 4 : 12;
      const perpendicularX = -current.dy;
      const perpendicularY = current.dx;

      for (let index = 0; index < flameCount; index += 1) {
        const spread = (Math.random() - 0.5) * 3.8;
        const speed = Math.random() * 4.8 + 7.2;

        addParticle(
          current.x + perpendicularX * spread + (Math.random() - 0.5) * 5,
          current.y + perpendicularY * spread + (Math.random() - 0.5) * 5,
          current.dx * speed + perpendicularX * spread * 0.28,
          current.dy * speed + perpendicularY * spread * 0.28,
          index % 5 === 0 ? "#fff4cf" : index % 2 === 0 ? "#ff3b1f" : "#ff9f1f",
          Math.random() * 5 + 3,
          28 + Math.random() * 16,
        );
      }
    };

    const emitBurnBurst = (burnBurst: FinaleBurnBurst) => {
      const burstCount = Math.round((reduceEffects ? 10 : 24) * burnBurst.intensity);

      for (let index = 0; index < burstCount; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (reduceEffects ? 3.8 : 6.6) + 1.6;
        const lift = Math.random() * (reduceEffects ? 1.6 : 2.5);
        const color =
          index % 7 === 0 ? "#fff4cf" : index % 2 === 0 ? "#ff3b1f" : "#ff9f1f";

        addParticle(
          burnBurst.x + (Math.random() - 0.5) * 10,
          burnBurst.y + (Math.random() - 0.5) * 10,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - lift,
          color,
          Math.random() * 5 + 2.5,
          26 + Math.random() * 24,
          false,
        );
      }
    };

    const animate = (now: number) => {
      if (document.hidden || now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      const delta = Math.min(2.3, (now - lastFrame) / 16.67);
      lastFrame = now;
      lastPaint = now;

      context.clearRect(0, 0, width, height);
      emitFlame();
      const pendingBurnBursts = pendingBurnBurstsRef.current;
      pendingBurnBurstsRef.current = [];
      pendingBurnBursts.forEach(emitBurnBurst);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta;
        particle.vy += 0.05 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        if (particle.canBurnItem !== false) {
          onBurnRef.current(particle.x, particle.y, particle.radius * 1.35);
        }

        const alpha = Math.max(0, particle.life / particle.maxLife);
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * (0.65 + alpha * 0.5), 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;

        if (particle.life <= 0) {
          particles.splice(index, 1);
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [performanceMode]);

  return <canvas ref={canvasRef} className="finale-flamethrower-particles" aria-hidden="true" />;
});

function finaleLength(value: FinaleLength) {
  return typeof value === "number" ? `${value}%` : value;
}

function roundFinaleCssNumber(value: number) {
  return Number(value.toFixed(4)).toString();
}

function splitFinaleCssArgs(value: string) {
  const args: string[] = [];
  let depth = 0;
  let current = "";

  Array.from(value).forEach((char) => {
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    }

    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      return;
    }

    current += char;
  });

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}

function scalePositiveFinaleLengthExpression(expression: string, multiplier: number): string {
  const trimmedExpression = expression.trim();
  const numericLengthMatch = /^(-?\d*\.?\d+)([a-z%]+)$/i.exec(trimmedExpression);

  if (Math.abs(multiplier) < 0.0001) {
    return "0px";
  }

  if (numericLengthMatch) {
    return `${roundFinaleCssNumber(Number(numericLengthMatch[1]) * multiplier)}${numericLengthMatch[2]}`;
  }

  const functionMatch = /^(clamp|min|max)\((.*)\)$/i.exec(trimmedExpression);

  if (functionMatch) {
    const [, functionName, rawArgs] = functionMatch;
    const scaledArgs = splitFinaleCssArgs(rawArgs).map((arg) =>
      scalePositiveFinaleLengthExpression(arg, multiplier),
    );

    return `${functionName}(${scaledArgs.join(", ")})`;
  }

  const whole = Math.floor(multiplier);
  const fraction = multiplier - whole;
  const terms = Array.from({ length: whole }, () => trimmedExpression);

  if (fraction > 0.001) {
    terms.push(`calc(${trimmedExpression} / ${roundFinaleCssNumber(1 / fraction)})`);
  }

  if (terms.length === 0) {
    return "0px";
  }

  return terms.length === 1 ? terms[0] : `calc(${terms.join(" + ")})`;
}

function scaleFinaleLengthExpression(expression: string, multiplier: number): string {
  if (Math.abs(multiplier) < 0.0001) {
    return "0px";
  }

  const scaledExpression = scalePositiveFinaleLengthExpression(expression, Math.abs(multiplier));

  return multiplier < 0 ? `calc(0px - ${scaledExpression})` : scaledExpression;
}

function finalePositionWithOffset(base: FinaleLength, offset: string) {
  if (offset === "0px") {
    return finaleLength(base);
  }

  return `calc(${finaleLength(base)} + ${offset})`;
}

function finaleEm(value: number) {
  return `${roundFinaleCssNumber(value)}em`;
}

function getFinaleCharacterAdvance(character: string) {
  if (character === " ") {
    return 0.36;
  }

  if (/['.,:;!|]/.test(character)) {
    return 0.22;
  }

  if (/[`"\[\](){}]/.test(character)) {
    return 0.34;
  }

  if (/[-/\\]/.test(character)) {
    return 0.38;
  }

  if (/[ijlI1]/.test(character)) {
    return 0.3;
  }

  if (/[ftJr]/.test(character)) {
    return 0.42;
  }

  if (/[mwMW@%&]/.test(character)) {
    return 0.88;
  }

  if (/[A-Z0-9$]/.test(character)) {
    return 0.66;
  }

  return 0.56;
}

function getFinaleTextAdvance(text: string) {
  return Array.from(text).reduce(
    (total, character) => total + getFinaleCharacterAdvance(character),
    0,
  );
}

function createFinaleLetterLayout(text: string, advanceScale = 1) {
  const characters = Array.from(text);
  const advances = characters.map((character) => getFinaleCharacterAdvance(character) * advanceScale);
  const totalAdvance = advances.reduce((total, advance) => total + advance, 0);
  let cursor = 0;

  return characters.flatMap((letter, index) => {
    const advance = advances[index];
    const center = cursor + advance / 2 - totalAdvance / 2;
    cursor += advance;

    if (letter === " ") {
      return [];
    }

    return [
      {
        advance,
        center,
        index,
        letter,
      },
    ];
  });
}

function createFinaleWordLayout(text: string, blockAdvance = getFinaleTextAdvance(text)) {
  return Array.from(text.matchAll(/\S+/g)).map((match, index) => {
    const word = match[0];
    const start = match.index ?? 0;
    const wordAdvance = getFinaleTextAdvance(word);
    const advanceBeforeWord = getFinaleTextAdvance(text.slice(0, start));

    return {
      advance: wordAdvance,
      center: advanceBeforeWord + wordAdvance / 2 - blockAdvance / 2,
      index,
      start,
      word,
    };
  });
}

function finaleItem(
  id: string,
  left: FinaleLength,
  top: FinaleLength,
  width: string,
  height: string,
  content: ReactNode,
  options: Partial<Omit<FinaleBurnItem, "content" | "height" | "id" | "left" | "top" | "width">> = {},
): FinaleBurnItem {
  return {
    id,
    left: finaleLength(left),
    top: finaleLength(top),
    width,
    height,
    content,
    ...options,
  };
}

function createFinaleTextItems(
  id: string,
  text: string,
  left: FinaleLength,
  top: FinaleLength,
  {
    burnRadius = 26,
    advanceScale = 1,
    height = "1.6rem",
    letterClassName = "",
  }: {
    advanceScale?: number;
    burnRadius?: number;
    height?: string;
    letterClassName?: string;
    step?: string;
    width?: string;
  } = {},
) {
  return createFinaleLetterLayout(text, advanceScale).map(({ advance, center, index, letter }) =>
    finaleItem(
      `${id}-letter-${index}`,
      finalePositionWithOffset(left, finaleEm(center)),
      top,
      `calc(${finaleEm(advance)} + 0.14em)`,
      height,
      <span className="finale-text-letter">{letter}</span>,
      {
        burnRadius,
        className: `finale-letter-item ${letterClassName}`.trim(),
      },
    ),
  );
}

function createFinaleWrappedTextItems(
  id: string,
  text: string,
  left: FinaleLength,
  top: FinaleLength,
  {
    burnRadius = 20,
    advanceScale = 1,
    columns,
    height = "1.05rem",
    letterClassName = "",
    maxChars,
    stepY = "0.95rem",
  }: {
    advanceScale?: number;
    burnRadius?: number;
    columns: number;
    height?: string;
    letterClassName?: string;
    maxChars: number;
    stepX?: string;
    stepY?: string;
    width?: string;
  },
) {
  const characters = Array.from(text.slice(0, maxChars));
  const lines = Array.from({ length: Math.ceil(characters.length / columns) }, (_, row) => ({
    row,
    startIndex: row * columns,
    text: characters.slice(row * columns, row * columns + columns).join(""),
  }));

  return lines.flatMap(({ row, startIndex, text: line }) =>
    createFinaleLetterLayout(line, advanceScale).map(({ advance, center, index, letter }) =>
      finaleItem(
        `${id}-letter-${startIndex + index}`,
        finalePositionWithOffset(left, finaleEm(center)),
        finalePositionWithOffset(top, scaleFinaleLengthExpression(stepY, row)),
        `calc(${finaleEm(advance)} + 0.14em)`,
        height,
        <span className="finale-text-letter">{letter}</span>,
        {
          burnRadius,
          className: `finale-letter-item ${letterClassName}`.trim(),
        },
      ),
    ),
  );
}

function createFinaleTextLineSet(
  id: string,
  lines: string[],
  left: FinaleLength,
  top: FinaleLength,
  options: Parameters<typeof createFinaleTextItems>[4] & {
    lineGap?: string;
  } = {},
) {
  const { lineGap = "1.35rem", ...textOptions } = options;

  return lines.flatMap((line, index) =>
    createFinaleTextItems(
      `${id}-line-${index}`,
      line,
      left,
      finalePositionWithOffset(top, scaleFinaleLengthExpression(lineGap, index)),
      textOptions,
    ),
  );
}

function createFinaleWordItems(
  id: string,
  text: string,
  left: FinaleLength,
  top: FinaleLength,
  {
    burnRadius = 22,
    height = "1rem",
    wordClassName = "",
  }: {
    burnRadius?: number;
    height?: string;
    step?: string;
    wordClassName?: string;
  } = {},
) {
  return createFinaleWordLayout(text).map(({ advance, center, index, start, word }) =>
    finaleItem(
      `${id}-word-${index}-${start}`,
      finalePositionWithOffset(
        left,
        finaleEm(center),
      ),
      top,
      `calc(${finaleEm(advance)} + 0.16em)`,
      height,
      <span className="finale-text-word">{word}</span>,
      {
        burnRadius: burnRadius + Math.min(18, word.length * 1.1),
        className: `finale-word-item ${wordClassName}`.trim(),
      },
    ),
  );
}

function createFinaleWrappedWordItems(
  id: string,
  text: string,
  left: FinaleLength,
  top: FinaleLength,
  {
    burnRadius = 18,
    columns,
    height = "0.95rem",
    maxChars,
    stepY = "0.9rem",
    wordClassName = "",
  }: {
    burnRadius?: number;
    columns: number;
    height?: string;
    maxChars: number;
    stepX?: string;
    stepY?: string;
    wordClassName?: string;
  },
) {
  const words = text.slice(0, maxChars).trim().split(/\s+/).filter(Boolean);
  let row = 0;
  let col = 0;
  const rows: string[] = [];

  words.forEach((word) => {
    if (col > 0 && col + word.length > columns) {
      row += 1;
      col = 0;
    }

    rows[row] = rows[row] ? `${rows[row]} ${word}` : word;
    col += word.length + 1;
  });

  const blockAdvance = columns * 0.5;

  return rows.flatMap((line, rowIndex) =>
    createFinaleWordLayout(line, Math.max(blockAdvance, getFinaleTextAdvance(line))).map(
      ({ advance, center, index, start, word }) =>
        finaleItem(
          `${id}-word-${rowIndex}-${index}-${start}`,
          finalePositionWithOffset(left, finaleEm(center)),
          finalePositionWithOffset(top, scaleFinaleLengthExpression(stepY, rowIndex)),
          `calc(${finaleEm(advance)} + 0.16em)`,
          height,
          <span className="finale-text-word">{word}</span>,
          {
            burnRadius: burnRadius + Math.min(16, word.length),
            className: `finale-word-item ${wordClassName}`.trim(),
          },
        ),
    ),
  );
}

function createFinaleWordLineSet(
  id: string,
  lines: string[],
  left: FinaleLength,
  top: FinaleLength,
  options: Parameters<typeof createFinaleWordItems>[4] & {
    lineGap?: string;
  } = {},
) {
  const { lineGap = "1.35rem", ...wordOptions } = options;

  return lines.flatMap((line, index) =>
    createFinaleWordItems(
      `${id}-line-${index}`,
      line,
      left,
      finalePositionWithOffset(top, scaleFinaleLengthExpression(lineGap, index)),
      wordOptions,
    ),
  );
}

function createSeamlessAnchoredPieceOptions(
  burnRadius: number,
  className = "",
  style: CSSProperties = {},
) {
  return {
    burnRadius,
    className: `finale-seamless-piece ${className}`.trim(),
    isAnchored: true,
    style,
  };
}

function addFinaleDrift(items: FinaleBurnItem[], stageKey: FinaleStageKey): FinaleBurnItem[] {
  const stageSeed = finaleStageKeys.indexOf(stageKey) + 1;

  return items.map((item, index) => {
    if (item.isAnchored) {
      return {
        ...item,
        driftDelay: item.driftDelay ?? 999,
        driftDuration: item.driftDuration ?? 999,
        driftRotate: item.driftRotate ?? 0,
        driftX: item.driftX ?? 0,
        driftY: item.driftY ?? 0,
      };
    }

    const seed = (index + 1) * (stageSeed * 19 + 31);
    const driftX = (((seed * 37) % 101) - 50) * 0.22;
    const driftY = (((seed * 53) % 101) - 50) * 0.18;
    const driftRotate = (((seed * 29) % 101) - 50) * 0.035;

    return {
      ...item,
      driftDelay: item.driftDelay ?? 2.8 + (seed % 23) * 0.08,
      driftDuration: item.driftDuration ?? 7.6 + (seed % 47) * 0.08,
      driftRotate: item.driftRotate ?? driftRotate,
      driftX: item.driftX ?? driftX,
      driftY: item.driftY ?? driftY,
    };
  });
}

function createFinaleBurnItems(
  stageKey: FinaleStageKey,
  performanceMode: PerformanceMode,
): FinaleBurnItem[] {
  const items =
    stageKey === "animals"
      ? createAnimalFinaleItems()
      : stageKey === "dandle"
        ? createDandleFinaleItems()
        : stageKey === "wordSearch"
          ? createWordSearchFinaleItems()
          : stageKey === "xp"
            ? createXpFinaleItems(performanceMode)
            : stageKey === "wiki"
              ? createWikiFinaleItems(performanceMode)
              : stageKey === "danflix"
                ? createDanflixFinaleItems(performanceMode)
                : stageKey === "jeopardy"
                  ? createJeopardyFinaleItems()
                  : createCharityFinaleItems(performanceMode);

  return addFinaleDrift(items, stageKey);
}

function createAnimalFinaleItems() {
  return [
    ...createFinaleTextItems(
      "animal-title",
      animalGameTitle,
      50,
      "calc(50% - 5.65rem)",
      {
        burnRadius: 32,
        height: "3.4rem",
        letterClassName: "finale-letter-animal-title",
        step: "clamp(0.72rem, 2.1vw, 1.14rem)",
        width: "clamp(0.68rem, 2vw, 1.08rem)",
      },
    ),
    ...createFinaleTextItems(
      "animal-score",
      "score 0",
      50,
      "calc(50% - 2.8rem)",
      {
        burnRadius: 24,
        height: "1.4rem",
        letterClassName: "finale-letter-game-score",
        step: "0.48rem",
        width: "0.45rem",
      },
    ),
    finaleItem(
      "animal-input-line",
      50,
      50,
      "min(calc(100vw - 2.5rem), 30rem)",
      "3.35rem",
      <div className="game-input-shell finale-static-input">
        <input aria-label="Name animals until failure" disabled />
      </div>,
      { burnRadius: 64 },
    ),
    ...createFinaleTextItems(
      "animal-input-placeholder",
      "type here",
      50,
      50,
      {
        burnRadius: 24,
        height: "1.5rem",
        letterClassName: "finale-letter-input-placeholder",
        step: "0.72rem",
        width: "0.62rem",
      },
    ),
  ];
}

function createDandleFinaleItems() {
  const cellSize = "clamp(2.12rem, 6.2vmin, 3.25rem)";
  const cells = Array.from({ length: 6 * 5 }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;

    return finaleItem(
      `dandle-cell-${row}-${col}`,
      finalePositionWithOffset(
        50,
        scaleFinaleLengthExpression("clamp(2.55rem, 7.25vmin, 3.95rem)", col - 2),
      ),
      finalePositionWithOffset(
        "calc(50% - clamp(7.8rem, 22vmin, 12.8rem))",
        scaleFinaleLengthExpression("clamp(2.55rem, 7.25vmin, 3.95rem)", row),
      ),
      cellSize,
      cellSize,
      <span className="wordle-cell" />,
      { burnRadius: 58 },
    );
  });

  return [
    ...createFinaleTextItems(
      "dandle-title",
      "disco dandle",
      50,
      "calc(50% - clamp(11.9rem, 32vmin, 18rem))",
      {
        burnRadius: 32,
        height: "2.8rem",
        letterClassName: "finale-letter-dandle-title",
        step: "clamp(0.82rem, 2.6vw, 1.28rem)",
        width: "clamp(0.76rem, 2.2vw, 1.18rem)",
      },
    ),
    ...cells,
    finaleItem(
      "dandle-input-line",
      50,
      "calc(50% + clamp(9.2rem, 26vmin, 14.6rem))",
      "min(calc(100vw - 2.5rem), 19rem)",
      "3rem",
      <form className="wordle-form finale-static-wordle-form">
        <input aria-label="Wordle guess" disabled />
      </form>,
      { burnRadius: 66 },
    ),
    ...createFinaleTextItems(
      "dandle-input-placeholder",
      "guess",
      50,
      "calc(50% + clamp(9.2rem, 26vmin, 14.6rem))",
      {
        burnRadius: 24,
        height: "1.5rem",
        letterClassName: "finale-letter-input-placeholder",
        step: "0.72rem",
        width: "0.62rem",
      },
    ),
  ];
}

function createWordSearchFinaleItems() {
  const levelIndex = wordSearchLevels.length - 1;
  const puzzle = createWordSearchPuzzle(wordSearchLevels[levelIndex], levelIndex);
  const cells = puzzle.grid.flatMap((row, rowIndex) =>
    row.map((letter, colIndex) =>
      finaleItem(
        `word-search-cell-${rowIndex}-${colIndex}`,
        finalePositionWithOffset(
          "calc(50% - var(--finale-word-search-board-size) / 2)",
          scaleFinaleLengthExpression("var(--finale-word-search-cell)", colIndex + 0.5),
        ),
        finalePositionWithOffset(
          "calc(50% - var(--finale-word-search-board-size) / 2)",
          scaleFinaleLengthExpression("var(--finale-word-search-cell)", rowIndex + 0.5),
        ),
        "var(--finale-word-search-cell)",
        "var(--finale-word-search-cell)",
        <span className="word-search-cell" role="gridcell" aria-label={letter}>
          <span className="word-search-letter-glyph" data-letter={letter}>{letter}</span>
        </span>,
        { burnRadius: 58 },
      ),
    ),
  );
  const clues = puzzle.targets.map((target, index) =>
    createFinaleTextItems(
      `word-search-clue-${target.id}`,
      target.clue,
      finalePositionWithOffset(
        "calc(50% - min(17rem, 39vw))",
        scaleFinaleLengthExpression("min(8.5rem, 19vw)", index),
      ),
      `calc(50% + var(--finale-word-search-board-size) / 2 + 2.1rem)`,
      {
        burnRadius: 20,
        height: "1.5rem",
        letterClassName: "finale-letter-word-search-clue",
        step: "0.42rem",
        width: "0.38rem",
      },
    ),
  ).flat();

  return [
    ...createFinaleTextItems(
      "word-search-title",
      "Word Search",
      50,
      `calc(50% - var(--finale-word-search-board-size) / 2 - 3.5rem)`,
      {
        burnRadius: 30,
        height: "3rem",
        letterClassName: "finale-letter-word-search-title",
        step: "clamp(0.82rem, 2.6vw, 1.22rem)",
        width: "clamp(0.74rem, 2.1vw, 1.12rem)",
      },
    ),
    ...cells,
    ...clues,
  ];
}

function createXpFinaleItems(performanceMode: PerformanceMode) {
  const columns = performanceMode === "reduced" ? 13 : 20;
  const rows = performanceMode === "reduced" ? 8 : 12;
  const wallpaperHeight = 94;
  const wallpaperTiles = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const backgroundPositionX = (column / Math.max(1, columns - 1)) * 100;
    const backgroundPositionY = (row / Math.max(1, rows - 1)) * 100;

    return finaleItem(
      `xp-wallpaper-${row}-${column}`,
      `${(column + 0.5) * (100 / columns)}%`,
      `${(row + 0.5) * (wallpaperHeight / rows)}%`,
      `calc(${100 / columns}% + 1px)`,
      `calc(${wallpaperHeight / rows}% + 1px)`,
      <span
        className="finale-xp-wallpaper-tile"
        style={
          {
            "--xp-bg-position": `${backgroundPositionX}% ${backgroundPositionY}%`,
            "--xp-bg-size": `${columns * 100}% ${rows * 100}%`,
          } as FinaleBurnStyle
        }
      />,
      createSeamlessAnchoredPieceOptions(44, "finale-xp-wallpaper-piece"),
    );
  });

  return [
    ...wallpaperTiles,
    finaleItem(
      "xp-excel-icon",
      50,
      50,
      "6.5rem",
      "5.8rem",
      <div className="desktop-app-icon desktop-excel-icon finale-xp-icon">
        <span className="excel-icon finale-empty-excel-icon" aria-hidden="true" />
        <span className="finale-label-spacer">Excel</span>
      </div>,
      { burnRadius: 68 },
    ),
    ...createFinaleTextItems(
      "xp-excel-x",
      "X",
      50,
      "calc(50% - 0.72rem)",
      {
        burnRadius: 24,
        height: "3.2rem",
        letterClassName: "finale-letter-excel-icon",
        step: "1rem",
        width: "2.2rem",
      },
    ),
    ...createFinaleTextItems(
      "xp-excel-label",
      "Excel",
      50,
      "calc(50% + 2.45rem)",
      {
        burnRadius: 24,
        height: "1.1rem",
        letterClassName: "finale-letter-xp-label",
        step: "0.42rem",
        width: "0.42rem",
      },
    ),
    finaleItem(
      "xp-start-button",
      "4.8rem",
      "calc(100% - 1.08rem)",
      "9.6rem",
      "2.15rem",
      <div className="xp-start-button finale-xp-taskbar-piece" />,
      { burnRadius: 64 },
    ),
    ...createFinaleTextItems(
      "xp-start-text",
      "start",
      "4.8rem",
      "calc(100% - 1.08rem)",
      {
        burnRadius: 22,
        height: "1.2rem",
        letterClassName: "finale-letter-xp-start",
        step: "0.46rem",
        width: "0.42rem",
      },
    ),
    finaleItem(
      "xp-task-button",
      "17rem",
      "calc(100% - 1.08rem)",
      "13rem",
      "2.15rem",
      <div className="xp-task-button is-active finale-xp-taskbar-piece" />,
      { burnRadius: 68 },
    ),
    ...createFinaleTextItems(
      "xp-task-text",
      "Excel",
      "14.3rem",
      "calc(100% - 1.08rem)",
      {
        burnRadius: 22,
        height: "1.2rem",
        letterClassName: "finale-letter-xp-task",
        step: "0.46rem",
        width: "0.42rem",
      },
    ),
    finaleItem(
      "xp-clock",
      "calc(100% - 3rem)",
      "calc(100% - 1.08rem)",
      "6rem",
      "2.15rem",
      <div className="xp-clock finale-xp-taskbar-piece" />,
      { burnRadius: 62 },
    ),
    ...createFinaleTextItems(
      "xp-clock-text",
      "4:59 PM",
      "calc(100% - 3rem)",
      "calc(100% - 1.08rem)",
      {
        burnRadius: 22,
        height: "1rem",
        letterClassName: "finale-letter-xp-clock",
        step: "0.38rem",
        width: "0.34rem",
      },
    ),
  ];
}

function createWikiFinaleItems(performanceMode: PerformanceMode) {
  const columns = performanceMode === "reduced" ? 9 : 14;
  const rows = performanceMode === "reduced" ? 6 : 9;
  const browserLeft = 7;
  const browserWidth = 86;
  const browserCenter = browserLeft + browserWidth / 2;
  const tabsCenterY = 7;
  const toolbarCenterY = 13;
  const pageTop = 17;
  const pageHeight = 81;
  const wikiSidebarCenterX = `calc(${browserLeft}% + 5.7rem)`;
  const wikiArticleCenterX = 44.5;
  const wikiInfoboxCenterX = 78;
  const wikiArticleParagraphs = discoWikiSections
    .flatMap((section, sectionIndex) =>
      section.paragraphs.slice(0, 2).map((paragraph, paragraphIndex) => ({
        id: `${sectionIndex}-${paragraphIndex}`,
        paragraph,
      })),
    )
    .slice(0, 4);
  const wikiParagraphTops = [49.5, 61.5, 75.5, 89];
  const pageTiles = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return finaleItem(
      `wiki-page-tile-${row}-${column}`,
      `${browserLeft + (column + 0.5) * (browserWidth / columns)}%`,
      `${pageTop + (row + 0.5) * (pageHeight / rows)}%`,
      `calc(${browserWidth / columns}% + 1px)`,
      `calc(${pageHeight / rows}% + 1px)`,
      <span className="finale-wiki-page-tile" />,
      createSeamlessAnchoredPieceOptions(44, "finale-wiki-page-piece"),
    );
  });

  return [
    finaleItem(
      "wiki-browser-tabs-bg",
      browserCenter,
      tabsCenterY,
      `${browserWidth}%`,
      "2.65rem",
      <span className="finale-wiki-browser-tabs-bg" />,
      createSeamlessAnchoredPieceOptions(72, "finale-wiki-browser-piece"),
    ),
    finaleItem(
      "wiki-tab",
      `calc(${browserLeft}% + 8rem)`,
      tabsCenterY,
      "16rem",
      "2.15rem",
      <div className="disco-browser-tab is-active finale-wiki-tab">
        <span className="disco-tab-dot" aria-hidden="true" />
      </div>,
      { burnRadius: 68 },
    ),
    ...createFinaleWordItems(
      "wiki-tab-text",
      "Disco - Wikipedia",
      `calc(${browserLeft}% + 8rem)`,
      tabsCenterY,
      {
        burnRadius: 20,
        height: "1rem",
        wordClassName: "finale-letter-wiki-tab",
        step: "0.42rem",
      },
    ),
    finaleItem(
      "wiki-title-bar",
      `calc(${browserLeft + browserWidth}% - 6rem)`,
      tabsCenterY,
      "12rem",
      "2.15rem",
      <div className="disco-browser-title finale-wiki-title" />,
      { burnRadius: 68 },
    ),
    ...createFinaleWordItems(
      "wiki-title-bar-text",
      "Disco Chrome",
      `calc(${browserLeft + browserWidth}% - 6rem)`,
      tabsCenterY,
      {
        burnRadius: 20,
        height: "1rem",
        wordClassName: "finale-letter-wiki-title",
        step: "0.46rem",
      },
    ),
    finaleItem(
      "wiki-toolbar",
      browserCenter,
      toolbarCenterY,
      `${browserWidth}%`,
      "2.55rem",
      <div className="finale-wiki-toolbar">
        <span>&lt;</span>
        <span>&gt;</span>
        <span>r</span>
        <div className="disco-address-bar" />
      </div>,
      { burnRadius: 72 },
    ),
    ...createFinaleWordItems(
      "wiki-address-text",
      "https://en.wikipedia.org/wiki/Disco",
      56,
      toolbarCenterY,
      {
        burnRadius: 18,
        height: "0.95rem",
        wordClassName: "finale-letter-wiki-address",
        step: "0.34rem",
      },
    ),
    ...pageTiles,
    finaleItem(
      "wiki-sidebar",
      wikiSidebarCenterX,
      57.5,
      "11rem",
      "68%",
      <aside className="fake-wiki-sidebar finale-wiki-sidebar" />,
      { burnRadius: 76 },
    ),
    ...createFinaleWordLineSet(
      "wiki-sidebar-text",
      ["Contents", "Etymology", "Musical characteristics", "Club culture", "History", "Legacy"],
      wikiSidebarCenterX,
      37,
      {
        burnRadius: 18,
        height: "0.95rem",
        lineGap: "2.2rem",
        step: "0.32rem",
        wordClassName: "finale-letter-wiki-sidebar",
      },
    ),
    finaleItem(
      "wiki-heading",
      39,
      24.8,
      "24rem",
      "4.6rem",
      <div className="fake-wiki-main finale-wiki-heading" />,
      { burnRadius: 74 },
    ),
    ...createFinaleWordItems(
      "wiki-source-text",
      "From Wikipedia, the free encyclopedia",
      43.4,
      22.1,
      {
        burnRadius: 18,
        height: "0.9rem",
        wordClassName: "finale-letter-wiki-source",
        step: "0.28rem",
      },
    ),
    ...createFinaleWordItems(
      "wiki-heading-text",
      "Disco",
      32,
      24.6,
      {
        burnRadius: 24,
        height: "2.8rem",
        wordClassName: "finale-letter-wiki-heading",
        step: "0.82rem",
      },
    ),
    ...createFinaleWordItems(
      "wiki-description-text",
      "Music genre and subculture",
      42.6,
      27.4,
      {
        burnRadius: 18,
        height: "0.95rem",
        wordClassName: "finale-letter-wiki-description",
        step: "0.34rem",
      },
    ),
    finaleItem(
      "wiki-notice",
      wikiArticleCenterX,
      36,
      "27rem",
      "4.2rem",
      <div className="fake-wiki-notice finale-wiki-notice" />,
      { burnRadius: 70 },
    ),
    ...createFinaleWrappedWordItems(
      "wiki-notice-text",
      "For more information on disco, see the page on Dance Pants Revolution.",
      wikiArticleCenterX,
      35.2,
      {
        burnRadius: 16,
        columns: 52,
        height: "0.9rem",
        maxChars: 116,
        stepX: "0.28rem",
        stepY: "0.9rem",
        wordClassName: "finale-letter-wiki-body",
      },
    ),
    finaleItem(
      "wiki-infobox",
      wikiInfoboxCenterX,
      48,
      "14.5rem",
      "24rem",
      <div className="fake-wiki-infobox finale-wiki-infobox" />,
      { burnRadius: 78 },
    ),
    ...createFinaleWordLineSet(
      "wiki-infobox-text",
      [
        "Disco",
        "Stylistic origins",
        ...discoInfoLinks.slice(0, 5),
        "Derivative forms",
        ...discoInfoLinks.slice(7, 11),
      ],
      wikiInfoboxCenterX,
      29,
      {
        burnRadius: 16,
        height: "0.9rem",
        lineGap: "1.55rem",
        step: "0.26rem",
        wordClassName: "finale-letter-wiki-infobox",
      },
    ),
    ...wikiArticleParagraphs.flatMap(({ id, paragraph }, paragraphIndex) =>
      createFinaleWrappedWordItems(
        `wiki-paragraph-${id}`,
        paragraph,
        wikiArticleCenterX,
        wikiParagraphTops[paragraphIndex] ?? 89,
        {
          burnRadius: 15,
          columns: 66,
          height: "0.86rem",
          maxChars: 296,
          stepX: "0.28rem",
          stepY: "0.9rem",
          wordClassName: "finale-letter-wiki-body",
        },
      ),
    ),
  ];
}

function createDanflixFinaleItems(performanceMode: PerformanceMode) {
  const heroLeft = 3;
  const heroTop = 12;
  const heroWidth = 94;
  const heroHeight = 47;
  const heroColumns = performanceMode === "reduced" ? 10 : 16;
  const heroRows = performanceMode === "reduced" ? 5 : 8;
  const featureCopyCenterX = 23.5;
  const featureCopyCenterY = 36.5;
  const posterCenterY = 80;
  const posterHeight = "23%";
  const heroTiles = Array.from({ length: heroColumns * heroRows }, (_, index) => {
    const column = index % heroColumns;
    const row = Math.floor(index / heroColumns);
    const backgroundPositionX = (column / Math.max(1, heroColumns - 1)) * 100;
    const backgroundPositionY = (row / Math.max(1, heroRows - 1)) * 100;

    return finaleItem(
      `danflix-hero-backdrop-${row}-${column}`,
      `${heroLeft + (column + 0.5) * (heroWidth / heroColumns)}%`,
      `${heroTop + (row + 0.5) * (heroHeight / heroRows)}%`,
      `calc(${heroWidth / heroColumns}% + 1px)`,
      `calc(${heroHeight / heroRows}% + 1px)`,
      <span
        className="finale-danflix-hero-tile"
        style={
          {
            "--danflix-hero-position": `${backgroundPositionX}% ${backgroundPositionY}%`,
            "--danflix-hero-size": `${heroColumns * 100}% ${heroRows * 100}%`,
          } as FinaleBurnStyle
        }
      />,
      createSeamlessAnchoredPieceOptions(48, "finale-danflix-hero-piece"),
    );
  });
  const posters = danflixPosters.slice(0, 10).map((poster, index) => {
    const title = poster.words.map((word) => word.text).join(" ");
    const posterCenterX = `${7.5 + index * 9.25}%`;

    return finaleItem(
      `danflix-poster-${poster.id}`,
      posterCenterX,
      posterCenterY,
      "8.6%",
      posterHeight,
      <article
        aria-label={`${title} poster`}
        className={`danflix-poster ${poster.className} finale-danflix-poster`}
      >
        <img className="danflix-poster-image" src={poster.image} alt="" draggable={false} />
      </article>,
      { burnRadius: 64 },
    );
  });
  const posterLetters = danflixPosters.slice(0, 10).flatMap((poster, index) =>
    createFinaleTextItems(
      `danflix-poster-title-${poster.id}`,
      poster.words.map((word) => word.text).join(" "),
      `${7.5 + index * 9.25}%`,
      86.2,
      {
        burnRadius: 18,
        height: "1.2rem",
        letterClassName: "finale-letter-poster",
        step: "0.26rem",
        width: "0.24rem",
      },
    ),
  );

  return [
    finaleItem(
      "danflix-logo",
      "5.3rem",
      "2.35rem",
      "8rem",
      "2.4rem",
      <div className="danflix-logo finale-logo-spacer" />,
      { burnRadius: 64 },
    ),
    ...createFinaleTextItems(
      "danflix-logo-text",
      "Danflix",
      "5.3rem",
      "2.35rem",
      {
        burnRadius: 24,
        advanceScale: 1.38,
        height: "2rem",
        letterClassName: "finale-letter-danflix-logo",
        step: "0.58rem",
        width: "0.52rem",
      },
    ),
    finaleItem(
      "danflix-nav-links",
      26,
      "2.35rem",
      "22rem",
      "2.4rem",
      <nav className="danflix-nav-links finale-danflix-links">
        <button type="button" disabled />
        <button type="button" disabled />
        <button type="button" disabled />
      </nav>,
      { burnRadius: 68 },
    ),
    ...createFinaleTextItems("danflix-nav-tv", "TV Shows", 20, "2.35rem", {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-nav",
      step: "0.36rem",
      width: "0.32rem",
    }),
    ...createFinaleTextItems("danflix-nav-movies", "Movies", 27, "2.35rem", {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-nav",
      step: "0.36rem",
      width: "0.32rem",
    }),
    ...createFinaleTextItems("danflix-nav-lists", "My Lists", 34, "2.35rem", {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-nav",
      step: "0.36rem",
      width: "0.32rem",
    }),
    ...heroTiles,
    finaleItem(
      "danflix-feature-copy",
      featureCopyCenterX,
      featureCopyCenterY,
      "43%",
      "42%",
      <div className="finale-danflix-feature-copy" />,
      { burnRadius: 80 },
    ),
    ...createFinaleTextItems("danflix-original-text", "A Danflix Original", featureCopyCenterX, 22.8, {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-original",
      step: "0.34rem",
      width: "0.3rem",
    }),
    ...createFinaleTextItems("danflix-title-main-text", "Disco Dan", featureCopyCenterX, 29.2, {
      burnRadius: 28,
      height: "3.8rem",
      letterClassName: "finale-letter-danflix-title",
      step: "1.04rem",
      width: "0.94rem",
    }),
    ...createFinaleTextItems("danflix-title-sub-text", "THE DANCUMENTARY", featureCopyCenterX, 34.8, {
      burnRadius: 18,
      advanceScale: 1.32,
      height: "1.2rem",
      letterClassName: "finale-letter-danflix-subtitle",
      step: "0.38rem",
      width: "0.34rem",
    }),
    ...createFinaleWrappedTextItems("danflix-description-text", danflixDescription, featureCopyCenterX, 41, {
      burnRadius: 15,
      columns: 50,
      height: "0.9rem",
      letterClassName: "finale-letter-danflix-description",
      maxChars: 158,
      stepX: "0.28rem",
      stepY: "0.88rem",
      width: "0.24rem",
    }),
    ...createFinaleTextItems("danflix-play-text", "Play", 17.8, 53.8, {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-play",
      step: "0.38rem",
      width: "0.34rem",
    }),
    ...createFinaleTextItems("danflix-info-text", "More Info", 30.2, 53.8, {
      burnRadius: 18,
      height: "1rem",
      letterClassName: "finale-letter-danflix-info",
      step: "0.34rem",
      width: "0.3rem",
    }),
    ...createFinaleTextItems(
      "danflix-feature-caption",
      "DISCO DAN: THE DANCUMENTARY",
      75,
      55.5,
      {
        burnRadius: 18,
        advanceScale: 1.28,
        height: "1.2rem",
        letterClassName: "finale-letter-danflix-caption",
        step: "0.42rem",
        width: "0.38rem",
      },
    ),
    ...createFinaleTextItems(
      "danflix-row-title",
      "POPULAR ON DANFLIX",
      10.2,
      64,
      {
        burnRadius: 20,
        advanceScale: 1.28,
        height: "1.4rem",
        letterClassName: "finale-letter-danflix-row-title",
        step: "0.42rem",
        width: "0.38rem",
      },
    ),
    ...posters,
    ...posterLetters,
  ];
}

function createJeopardyFinaleItems() {
  const columnCount = jeopardyCategories.length;
  const rowCount = jeopardyValues.length + 1;
  const boardLeft = 5;
  const boardTop = 8;
  const boardWidth = 90;
  const boardHeight = 84;
  const columnWidth = boardWidth / columnCount;
  const rowHeight = boardHeight / rowCount;
  const categoryItems = jeopardyCategories.flatMap((category, columnIndex) =>
    [
      finaleItem(
        `jeopardy-category-${columnIndex}`,
        `${boardLeft + columnWidth * (columnIndex + 0.5)}%`,
        `${boardTop + rowHeight * 0.5}%`,
        `${columnWidth}%`,
        `${rowHeight}%`,
        <div className="jeopardy-category" />,
        { burnRadius: 66 },
      ),
      ...createFinaleWordItems(
        `jeopardy-category-${columnIndex}-text`,
        category,
        `${boardLeft + columnWidth * (columnIndex + 0.5)}%`,
        `${boardTop + rowHeight * 0.5}%`,
        {
          burnRadius: 22,
          height: "1.3rem",
          wordClassName: "finale-letter-jeopardy-category",
        },
      ),
    ],
  );
  const tileItems = jeopardyValues.flatMap((value, valueIndex) =>
    jeopardyCategories.flatMap((_, columnIndex) =>
      [
        finaleItem(
          `jeopardy-tile-${value}-${columnIndex}`,
          `${boardLeft + columnWidth * (columnIndex + 0.5)}%`,
          `${boardTop + rowHeight * (valueIndex + 1.5)}%`,
          `${columnWidth}%`,
          `${rowHeight}%`,
          <div className="jeopardy-tile" />,
          { burnRadius: 70 },
        ),
        ...createFinaleWordItems(
          `jeopardy-tile-${value}-${columnIndex}-text`,
          `$${value}`,
          `${boardLeft + columnWidth * (columnIndex + 0.5)}%`,
          `${boardTop + rowHeight * (valueIndex + 1.5)}%`,
          {
            burnRadius: 26,
            height: "2.4rem",
            wordClassName: "finale-letter-jeopardy-value",
          },
        ),
      ],
    ),
  );

  return [...categoryItems, ...tileItems];
}

function finaleDeterministicUnit(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createCharityFinaleItems(performanceMode: PerformanceMode) {
  const coinCount = performanceMode === "reduced" ? 64 : 104;
  const coins = Array.from({ length: coinCount }, (_, index) => {
    const x = 7 + finaleDeterministicUnit(index, 1) * 86;
    const y = 11 + finaleDeterministicUnit(index, 2) * 78;
    const size = 1.18 + finaleDeterministicUnit(index, 3) * 0.58;
    const direction = finaleDeterministicUnit(index, 4) * Math.PI * 2;
    const speed = 0.72 + finaleDeterministicUnit(index, 5) * 1.65;
    const spinDirection = finaleDeterministicUnit(index, 6) > 0.5 ? 1 : -1;
    const angle = finaleDeterministicUnit(index, 7) * Math.PI;

    return finaleItem(
      `charity-coin-${index}`,
      `${x.toFixed(3)}%`,
      `${y.toFixed(3)}%`,
      `${size.toFixed(2)}rem`,
      `${size.toFixed(2)}rem`,
      <span className="finale-charity-coin" />,
      {
        burnRadius: 44,
        className: "finale-charity-coin-item",
        physics: {
          angle,
          seed: index,
          va: spinDirection * (0.035 + finaleDeterministicUnit(index, 8) * 0.095),
          vx: Math.cos(direction) * speed,
          vy: Math.sin(direction) * speed,
        },
        style: {
          "--coin-angle": `${angle}rad`,
        } as FinaleBurnStyle,
      },
    );
  });

  return [
    ...createFinaleTextItems(
      "charity-title",
      "Charity Simulator",
      50,
      "clamp(2.5rem, 8vh, 4.2rem)",
      {
        burnRadius: 30,
        height: "3.5rem",
        letterClassName: "finale-letter-charity-title",
        step: "clamp(0.72rem, 2.2vw, 1.18rem)",
        width: "clamp(0.66rem, 2vw, 1.1rem)",
      },
    ),
    ...coins,
    finaleItem(
      "charity-donate",
      50,
      50,
      "clamp(11rem, 30vw, 16rem)",
      "3.35rem",
      <button className="charity-donate-button" type="button" disabled />,
      { burnRadius: 70 },
    ),
    ...createFinaleTextItems(
      "charity-donate-text",
      "Give to charity",
      50,
      50,
      {
        burnRadius: 22,
        height: "1.3rem",
        letterClassName: "finale-letter-charity-button",
        step: "0.52rem",
        width: "0.46rem",
      },
    ),
    ...createFinaleTextItems(
      "charity-balance",
      "$0",
      50,
      "calc(50% + 4.5rem)",
      {
        burnRadius: 24,
        height: "2.4rem",
        letterClassName: "finale-letter-charity-balance",
        step: "0.8rem",
        width: "0.72rem",
      },
    ),
  ];
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

function DiscoReturnScene({
  performanceMode,
  onNext,
}: {
  performanceMode: PerformanceMode;
  onNext: () => void;
}) {
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
            <PaintBurstCanvas performanceMode={performanceMode} />
            <RainbowFireCanvas performanceMode={performanceMode} targetRef={titleRef} />
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

function DiscoChromeScene({
  showDanflixReveal = true,
  onExploded,
  onNext,
}: {
  showDanflixReveal?: boolean;
  onExploded?: () => void;
  onNext?: () => void;
}) {
  const [page, setPage] = useState<DiscoChromePage>("disco");
  const [animalizedDanPage, setAnimalizedDanPage] = useState<AnimalizedDanPage | null>(null);
  const [crabPhase, setCrabPhase] = useState<CrabPhase>("idle");
  const [crabWaveProgress, setCrabWaveProgress] = useState(0);
  const crabTimersRef = useRef<number[]>([]);
  const crabWaveIntervalRef = useRef<number | null>(null);
  const didNotifyExplodedRef = useRef(false);

  useEffect(() => {
    return () => {
      crabTimersRef.current.forEach(window.clearTimeout);
      if (crabWaveIntervalRef.current !== null) {
        window.clearInterval(crabWaveIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (crabPhase !== "exploded" || !onExploded || didNotifyExplodedRef.current) {
      return;
    }

    didNotifyExplodedRef.current = true;
    onExploded();
  }, [crabPhase, onExploded]);

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
      {showDanflixReveal && (
        <button
          className={`danflix-reveal-button ${crabPhase === "exploded" ? "is-visible" : ""}`}
          type="button"
          onClick={onNext}
          disabled={crabPhase !== "exploded"}
        >
          Danflix
        </button>
      )}
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

type WorkComputerStage =
  | "login"
  | "loading"
  | "desktop"
  | "excel"
  | "money"
  | "chrome"
  | "moneyBsod"
  | "sourceBsod";
type XpDesktopApp = "excel" | "discoChrome" | "danflix";

const seededComputerRows = [
  ["Dell Optiplex 3010", "13456A", "$130"],
  ["HP Pavilion 159x", "23145Z", "$213"],
  ["Lenovo ThinkPad T450", "21345F", "$80"],
];

const excelColumnLetters = Array.from({ length: 10 }, (_, index) =>
  String.fromCharCode(65 + index),
);

function WorkComputerScene({
  performanceMode,
  onComplete,
}: {
  performanceMode: PerformanceMode;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<WorkComputerStage>("login");
  const [desktopApp, setDesktopApp] = useState<XpDesktopApp>("excel");
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [showStickyNote, setShowStickyNote] = useState(true);
  const [moneyOrigin, setMoneyOrigin] = useState({ row: 4, col: 2 });
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const loadDesktop = (nextDesktopApp: XpDesktopApp) => {
    setDesktopApp(nextDesktopApp);
    setIsExcelOpen(false);
    setShowStickyNote(nextDesktopApp === "excel");
    setStage("loading");
    timersRef.current.push(window.setTimeout(() => setStage("desktop"), 2500));
  };

  const restartIntoDesktop = (nextDesktopApp: XpDesktopApp) => {
    clearTimers();
    loadDesktop(nextDesktopApp);
  };

  const startLogin = () => {
    clearTimers();
    timersRef.current.push(window.setTimeout(() => loadDesktop("excel"), 500));
  };

  const openExcel = () => {
    setIsExcelOpen(true);
    setShowStickyNote(true);
    setStage("excel");
  };

  const triggerMoneyColumn = (row: number, col: number) => {
    if (stage === "money" || stage === "moneyBsod" || stage === "sourceBsod") {
      return;
    }

    setMoneyOrigin({ row, col });
    setShowStickyNote(false);
    setStage("money");
    timersRef.current.push(window.setTimeout(() => setStage("moneyBsod"), 13500));
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
        {(stage === "desktop" || stage === "excel" || stage === "money") && (
          <XpDesktop
            desktopApp={desktopApp}
            isExcelOpen={isExcelOpen}
            performanceMode={performanceMode}
            showStickyNote={showStickyNote}
            stage={stage}
            moneyOrigin={moneyOrigin}
            onCloseSticky={() => setShowStickyNote(false)}
            onOpenDanflix={onComplete}
            onOpenDiscoChrome={() => setStage("chrome")}
            onOpenExcel={openExcel}
            onTriggerMoney={triggerMoneyColumn}
          />
        )}
        {stage === "chrome" && (
          <DiscoChromeScene
            showDanflixReveal={false}
            onExploded={() => setStage("sourceBsod")}
          />
        )}
        {stage === "moneyBsod" && (
          <BlueScreen onRestart={() => restartIntoDesktop("discoChrome")} />
        )}
        {stage === "sourceBsod" && (
          <BlueScreen
            error="ERROR: you may not use Wikipedia as a source."
            onRestart={() => restartIntoDesktop("danflix")}
          />
        )}
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
  desktopApp,
  isExcelOpen,
  performanceMode,
  showStickyNote,
  stage,
  moneyOrigin,
  onCloseSticky,
  onOpenDanflix,
  onOpenDiscoChrome,
  onOpenExcel,
  onTriggerMoney,
}: {
  desktopApp: XpDesktopApp;
  isExcelOpen: boolean;
  performanceMode: PerformanceMode;
  showStickyNote: boolean;
  stage: WorkComputerStage;
  moneyOrigin: { row: number; col: number };
  onCloseSticky: () => void;
  onOpenDanflix: () => void;
  onOpenDiscoChrome: () => void;
  onOpenExcel: () => void;
  onTriggerMoney: (row: number, col: number) => void;
}) {
  const taskLabel =
    isExcelOpen || desktopApp === "excel"
      ? "Excel"
      : desktopApp === "discoChrome"
        ? "Disco Chrome"
        : "Danflix";

  return (
    <motion.div
      className="xp-desktop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="xp-wallpaper" aria-hidden="true">
        <img
          src="/xp-1280.jpg"
          srcSet="/xp-800.jpg 800w, /xp-1280.jpg 1280w, /xp.jpeg 4059w"
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      {desktopApp === "excel" && !isExcelOpen && (
        <button
          className="desktop-app-icon desktop-excel-icon"
          type="button"
          onDoubleClick={onOpenExcel}
          onClick={onOpenExcel}
        >
          <span className="excel-icon" aria-hidden="true">X</span>
          <span>Excel</span>
        </button>
      )}
      {desktopApp === "discoChrome" && (
        <button
          className="desktop-app-icon desktop-chrome-icon"
          type="button"
          onDoubleClick={onOpenDiscoChrome}
          onClick={onOpenDiscoChrome}
        >
          <span className="disco-chrome-desktop-icon" aria-hidden="true">
            <span />
          </span>
          <span>Disco Chrome</span>
        </button>
      )}
      {desktopApp === "danflix" && (
        <button
          className="desktop-app-icon desktop-danflix-icon"
          type="button"
          onDoubleClick={onOpenDanflix}
          onClick={onOpenDanflix}
        >
          <span className="danflix-desktop-icon" aria-hidden="true">D</span>
          <span>Danflix</span>
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
      {stage === "money" && <MoneyPhysicsLayer performanceMode={performanceMode} />}
      <div className="xp-taskbar">
        <button className="xp-start-button" type="button">start</button>
        <button
          className={`xp-task-button ${isExcelOpen ? "is-active" : ""}`}
          type="button"
          onClick={desktopApp === "excel" && !isExcelOpen ? onOpenExcel : undefined}
        >
          {taskLabel}
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

function MoneyPhysicsLayer({ performanceMode }: { performanceMode: PerformanceMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduceEffects = performanceMode === "reduced" || reducedMotion;
    const bills: MoneyBill[] = [];
    const pileHeights: number[] = Array.from({ length: reduceEffects ? 10 : 16 }, () => 0);
    const maxBills = reduceEffects ? 120 : 320;
    const spawnEveryMs = reduceEffects ? 85 : 35;
    const frameIntervalMs = reduceEffects ? 33 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let startedAt = performance.now();
    let lastFrame = startedAt;
    let lastPaint = 0;
    let lastSpawn = 0;
    let firstBillSpawned = false;
    let rainStarted = false;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, reduceEffects ? 1 : 1.5);
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
      if (document.hidden) {
        lastFrame = now;
        lastPaint = now;
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      if (now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      lastPaint = now;
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

      if (rainStarted && now - lastSpawn > spawnEveryMs && bills.length < maxBills) {
        let spawnCount = 2;

        if (reduceEffects) {
          spawnCount = elapsed > 9000 ? 2 : 1;
        } else if (elapsed > 9000) {
          spawnCount = 6;
        } else if (elapsed > 6600) {
          spawnCount = 4;
        }

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
  }, [performanceMode]);

  return <canvas ref={canvasRef} className="money-physics-layer" aria-hidden="true" />;
}

function BlueScreen({
  error = "ERROR: mo money mo problems",
  onRestart,
}: {
  error?: string;
  onRestart: () => void;
}) {
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
            <h2>{error}</h2>
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
              <div className="game-status-line" aria-live="polite">
                <AnimatePresence mode="wait">
                  {showHint ? (
                    <motion.p
                      key="animal-game-hint"
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
                  ) : message ? (
                    <motion.p
                      key={message}
                      className="game-message"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      {message}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
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
  performanceMode,
  targetRef,
}: {
  performanceMode: PerformanceMode;
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
    const reduceEffects = performanceMode === "reduced" || reducedMotion;
    const particles: FireParticle[] = [];
    const maxParticles = reduceEffects ? 42 : 180;
    const emitEveryMs = reduceEffects ? 160 : 40;
    const frameIntervalMs = reduceEffects ? 66 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastPaint = 0;
    let lastEmit = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, reduceEffects ? 1 : 1.5);
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
        vx: (Math.random() - 0.5) * (reduceEffects ? 0.9 : 1.45),
        vy: -(Math.random() * (reduceEffects ? 0.9 : 1.45) + 0.65),
        radius: Math.random() * (reduceEffects ? 10 : 20) + (reduceEffects ? 8 : 16),
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
      if (document.hidden) {
        lastFrame = now;
        lastPaint = now;
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      if (now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      lastPaint = now;
      const delta = Math.min(2, (now - lastFrame) / 16.67);
      lastFrame = now;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      if (now - lastEmit > emitEveryMs) {
        const bounds = getEmissionBounds();
        const emitCount = reduceEffects ? 1 : 5;

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
  }, [performanceMode, targetRef]);

  return <canvas ref={canvasRef} className="rainbow-fire-canvas" aria-hidden="true" />;
}

function PaintBurstCanvas({ performanceMode }: { performanceMode: PerformanceMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduceEffects = performanceMode === "reduced" || reducedMotion;
    const particles: Particle[] = [];
    const frameIntervalMs = reduceEffects ? 33 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let startedAt = performance.now();
    let lastPaint = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, reduceEffects ? 1 : 1.5);
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
      const count = reduceEffects ? 70 : 260;

      for (let index = 0; index < count; index += 1) {
        addParticle(
          centerX + (Math.random() - 0.5) * 90,
          centerY + (Math.random() - 0.5) * 54,
          index < 120 ? 1.45 : 1,
        );
      }

      const secondaryCount = reduceEffects ? 18 : 72;

      for (let index = 0; index < secondaryCount; index += 1) {
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
      if (document.hidden) {
        lastPaint = now;
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      if (now - lastPaint < frameIntervalMs) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      lastPaint = now;
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

      if (!reduceEffects && elapsed > 700 && elapsed < 2600 && particles.length < 420) {
        for (let index = 0; index < 10; index += 1) {
          addParticle(width / 2, height / 2, 0.58);
        }
      }

      if (particles.length === 0 && elapsed > (reduceEffects ? 2600 : 5200)) {
        return;
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
  }, [performanceMode]);

  return <canvas ref={canvasRef} className="paint-canvas" aria-hidden="true" />;
}

export default App;
