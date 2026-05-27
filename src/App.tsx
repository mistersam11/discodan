import { type CSSProperties, type FormEvent, type MouseEvent, type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
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
  | "danflix"
  | "forgiveness"
  | "wordSearch";

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
  jeopardy: "forgiveness",
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

        {scene === "finale" && (
          <FinaleScene
            key="finale"
            performanceMode={performanceMode}
            onStart={() => setScene("animalGame")}
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
            performanceMode={performanceMode}
            playerName={answers.name}
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
};

type JeopardyResult = {
  contestantIndex: number;
  text: string;
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
  igniteGold: () => void;
  setFlaming: (isFlaming: boolean) => void;
  shardIce: () => void;
  spawnCoin: () => void;
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

const jeopardyQuestions: JeopardyQuestion[] = [
  {
    id: "disco-100",
    category: "DISCO",
    value: 100,
    clue: "This sparkling dance floor object makes Dan believe every room can become a party.",
    answer: "disco ball",
    options: ["disco ball", "spreadsheet", "blue screen", "potpourri"],
  },
  {
    id: "disco-200",
    category: "DISCO",
    value: 200,
    clue: "This four beat pulse keeps the club moving while Dan points dramatically at the ceiling.",
    answer: "four on the floor",
    options: ["four on the floor", "two in the chair", "one under the desk", "zero on purpose"],
  },
  {
    id: "disco-400",
    category: "DISCO",
    value: 400,
    clue: "This kind of venue gave disco its name and gave Dan somewhere to stand under lights.",
    answer: "discotheque",
    options: ["discotheque", "library card", "spreadsheet cell", "forgiveness office"],
  },
  {
    id: "disco-800",
    category: "DISCO",
    value: 800,
    clue: "This feverish Saturday movie helped make disco a pop culture phenomenon.",
    answer: "Saturday Night Fever",
    options: ["Saturday Night Fever", "Monday Morning Printer", "Thursday Lunch Email", "Sunday Tax Folder"],
  },
  {
    id: "disco-1000",
    category: "DISCO",
    value: 1000,
    clue: "This famous New York nightclub is where celebrities danced while Dan studied the mirror ball.",
    answer: "Studio 54",
    options: ["Studio 54", "Cubicle 12", "Room 404", "Spreadsheet 7"],
  },
  {
    id: "dan-100",
    category: "DAN",
    value: 100,
    clue: "This is the first name of the man whose disco forgiveness has become urgently important.",
    answer: "Dan",
    options: ["Dan", "Crab", "Excel", "Wikipedia"],
  },
  {
    id: "dan-200",
    category: "DAN",
    value: 200,
    clue: "Dan renamed this hit guessing game after buying it with overwhelming confidence.",
    answer: "Disco Dandle",
    options: ["Disco Dandle", "Danflix", "Taskbar Tennis", "Calendar Soup"],
  },
  {
    id: "dan-400",
    category: "DAN",
    value: 400,
    clue: "This streaming service suspended the account after it was shared with a man in a business suit.",
    answer: "Danflix",
    options: ["Danflix", "Crab Prime", "The New York Times", "Excel Plus"],
  },
  {
    id: "dan-800",
    category: "DAN",
    value: 800,
    clue: "This phrase is what someone should request after deeply upsetting Disco Dan.",
    answer: "Dan's forgiveness",
    options: ["Dan's forgiveness", "more potpourri", "a new spreadsheet", "a browser history"],
  },
  {
    id: "dan-1000",
    category: "DAN",
    value: 1000,
    clue: "This is what Dan does after the clock reaches eight in the evening.",
    answer: "watch TV",
    options: ["watch TV", "open Excel", "cite Wikipedia", "count animals"],
  },
];

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
  performanceMode,
  playerName,
}: {
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

  const showDanAnswer = (question: JeopardyQuestion) => {
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
          srcSet="/jeopardy/podiums-900.jpg 900w, /jeopardy/podiums-1200.jpg 1200w"
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

          {result?.text && activeIndex !== undefined && (
            <div className={`jeopardy-speech-bubble speech-${activeIndex}`}>
              {result.text}
            </div>
          )}

          {selectedQuestion && onChoose && (
            <div className="jeopardy-choice-panel">
              <div className="jeopardy-choice-timer">{choiceSeconds}s</div>
              <div className="jeopardy-choice-options">
                {selectedQuestion.options.map((option) => (
                  <button key={option} type="button" onClick={() => onChoose(option)}>
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
  30: "The impoverish begin to feel the burden of wealth...",
  40: "Seriously this stuff is heavy...",
  50: "STOP PLEASE WE CAN'T MOVE IT'S SO MUCH GOLD",
};

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
  performanceMode,
}: {
  initialBalance: number;
  performanceMode: PerformanceMode;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [donations, setDonations] = useState(0);
  const [message, setMessage] = useState("");
  const [iceHealth, setIceHealth] = useState(0);
  const [hasFrozenButton, setHasFrozenButton] = useState(false);
  const [hasIgnitedGold, setHasIgnitedGold] = useState(false);
  const [isFlaming, setIsFlaming] = useState(false);
  const physicsApiRef = useRef<CharityPhysicsApi | null>(null);
  const messageTimerRef = useRef<number>(0);

  const isButtonFrozen = hasFrozenButton && iceHealth > 0;
  const canIgniteGold = hasFrozenButton && iceHealth <= 0 && !hasIgnitedGold;

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
    if (iceHealth <= 0) {
      setIsFlaming(false);
      physicsApiRef.current?.setFlaming(false);
    }
  }, [iceHealth]);

  const showCharityMessage = (nextMessage: string) => {
    window.clearTimeout(messageTimerRef.current);
    setMessage(nextMessage);
    messageTimerRef.current = window.setTimeout(() => setMessage(""), 2600);
  };

  const handleDonate = () => {
    if (isButtonFrozen) {
      return;
    }

    if (canIgniteGold) {
      setHasIgnitedGold(true);
      physicsApiRef.current?.igniteGold();
      return;
    }

    const nextDonations = donations + 1;
    setDonations(nextDonations);
    setBalance((current) => current - 1);
    physicsApiRef.current?.spawnCoin();

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
      <CharityPhysicsCanvas apiRef={physicsApiRef} performanceMode={performanceMode} />
      <h2>Charity Simulator</h2>
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

      <div className="charity-action-stack">
        {hasFrozenButton && !hasIgnitedGold && (
          <div className="charity-flamethrower-wrap">
            <span>flamethrower</span>
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
            disabled={isButtonFrozen || hasIgnitedGold}
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
    </motion.div>
  );
}

function CharityPhysicsCanvas({
  apiRef,
  performanceMode,
}: {
  apiRef: MutableRefObject<CharityPhysicsApi | null>;
  performanceMode: PerformanceMode;
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
    const coins: CharityCoin[] = [];
    const particles: CharityParticle[] = [];
    const maxParticles = reduceEffects ? 90 : 170;
    const maxCoins = 64;
    const coinRadius = reduceEffects ? 10 : 13;
    const frameIntervalMs = reduceEffects ? 33 : 16;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let coinId = 0;
    let isFlaming = false;
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
      });
    };

    const spawnCoin = () => {
      if (coins.length >= maxCoins) {
        coins.shift();
      }

      coins.push({
        id: coinId,
        x: width * (0.38 + Math.random() * 0.24),
        y: -coinRadius * 2,
        vx: (Math.random() - 0.5) * 2.1,
        vy: Math.random() * 1.3,
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

    const igniteGold = () => {
      coins.forEach((coin) => {
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
      });
      coins.length = 0;
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
        const flameCount = reduceEffects ? 2 : 5;
        for (let index = 0; index < flameCount; index += 1) {
          addParticle(
            width / 2 + (Math.random() - 0.5) * 20,
            height * 0.42 + Math.random() * 8,
            (Math.random() - 0.5) * 1.8,
            Math.random() * 4.4 + 2.4,
            index % 2 === 0 ? "#ff3b1f" : "#ff9f1f",
            Math.random() * 5 + 2,
            24 + Math.random() * 16,
          );
        }
      }

      coins.forEach((coin) => {
        coin.vy += 0.34 * delta;
        coin.vx *= 0.994;
        coin.vy *= 0.998;
        coin.x += coin.vx * delta;
        coin.y += coin.vy * delta;
        coin.angle += coin.va * delta;
        coin.va *= 0.992;

        if (coin.x - coin.radius < 0) {
          coin.x = coin.radius;
          coin.vx *= -0.42;
        } else if (coin.x + coin.radius > width) {
          coin.x = width - coin.radius;
          coin.vx *= -0.42;
        }

        const floorY = height - coin.radius - 10;
        if (coin.y > floorY) {
          coin.y = floorY;
          coin.vy *= -0.22;
          coin.vx *= 0.82;
          coin.va *= 0.72;
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
    apiRef.current = {
      igniteGold,
      setFlaming: (nextIsFlaming: boolean) => {
        isFlaming = nextIsFlaming;
      },
      shardIce,
      spawnCoin,
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
  const isReducedPerformance = performanceMode === "reduced";
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
                    !isReducedPerformance &&
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

function FinaleScene({
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
