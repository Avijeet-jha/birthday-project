import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { birthdayData } from "./data/birthdayData";

import { supabase } from "./lib/supabase";

const sectionIds = ["memories", "funny", "gift", "neha-things", "final"];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Sparkles() {
  return (
    <div className="ambient" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 29 + 7) % 100}%`,
            animationDelay: `${(i % 7) * 0.7}s`,
            animationDuration: `${4 + (i % 4)}s`,
          }}
        >
          {i % 3 === 0 ? "✦" : i % 3 === 1 ? "🎀" : "·"}
        </span>
      ))}
    </div>
  );
}

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="welcome">
      <div className="welcome-card">
        <div className="tiny-label">A tiny digital surprise</div>

        <div className="welcome-line">Hey... wait 👀</div>

        <img
          className="birthday-gif joy-gif"
          src={birthdayData.joyGif}
          alt="Joyful animated birthday celebration"
        />

        <h1>Someone's birthday today...</h1>

        <p className="welcome-reveal">
          And apparently, it's <strong>NEHA'S DAY</strong> 🎀
        </p>

        <button className="primary-btn" onClick={onEnter}>
          🎁 Open Your Surprise
        </button>

        <div className="mini-note">
          Warning: contains cake, chaos & questionable decisions.
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-copy">
        <div className="eyebrow">today's main character ✨</div>

        <h2>
          Happy Birthday,
          <br />
          <span>Neha</span> 🎀
        </h2>

        <p>Another year older... but thankfully, not wiser. 😂</p>

        <button className="ghost-btn" onClick={() => scrollTo("memories")}>
          ✨ Come on, there's more
        </button>
      </div>

      <div className="hero-visual">
        <div className="polaroid hero-polaroid">
          <img
            src={birthdayData.heroImage}
            alt="A colorful birthday celebration"
          />
        </div>

        <div className="floating-sticker sticker-one">🎂</div>
        <div className="floating-sticker sticker-two">🎈</div>
        <div className="floating-sticker sticker-three">🎀</div>
      </div>
    </section>
  );
}

function Memories({ onComplete }: { onComplete: () => void }) {
  const questions = [
    "What can instantly make Neha's mood better?",
    "If Neha had a free day with someone she really likes, what would she choose?",
    'If Neha suddenly says, "I have something to tell you..." what happens next?',
    "What would probably remind you of me?",
    "What's one thing about me that you think you'd always remember? 🎀",
  ];
  const [answers, setAnswers] = useState(() => questions.map(() => ""));
  const [submittedAnswers, setSubmittedAnswers] = useState<string[] | null>(null);

  useEffect(() => {
    if (submittedAnswers) return;

    const section = document.getElementById("memories");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          document.body.classList.add("memory-locked");
        }
      },
      { threshold: [0.55] },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      document.body.classList.remove("memory-locked");
    };
  }, [submittedAnswers]);

  function updateAnswer(index: number, value: string) {
    setAnswers((current) =>
      current.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    );
  }

  async function submitAnswers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedAnswers = answers.map((answer) => answer.trim());
    if (cleanedAnswers.some((answer) => !answer)) return;

    const { error } = await supabase.from("birthday_responses").insert({
      answer_1: cleanedAnswers[0],
      answer_2: cleanedAnswers[1],
      answer_3: cleanedAnswers[2],
      answer_4: cleanedAnswers[3],
      answer_5: cleanedAnswers[4],
    });

    if (error) {
  console.error("SUPABASE INSERT ERROR:", error);
  alert(`Supabase error: ${error.message}`);
  return;
}

    setSubmittedAnswers(cleanedAnswers);
    onComplete();
    document.body.classList.remove("memory-locked");
    celebrate();
  }

  return (
    <section className="section-shell" id="memories">
      <div className="section-heading">
        <h3>A Few Questionable Memories 📸</h3>

        <p>Answer these first, so we can make this part properly yours.</p>
      </div>

      {!submittedAnswers ? (
        <form className="memory-questions" onSubmit={submitAnswers}>
          {questions.map((question, index) => (
            <label className="memory-question" key={question}>
              <span>
                {index + 1}. {question}
              </span>
              <textarea
                value={answers[index]}
                onChange={(event) => updateAnswer(index, event.target.value)}
                placeholder="Write your answer..."
                rows={2}
                required
              />
            </label>
          ))}

          <button className="primary-btn" type="submit">
            ✨ Answer Questions to See More
          </button>
        </form>
      ) : (
        <>
          <div className="memory-grid memory-calendar">
            {submittedAnswers.map((answer, index) => {
              const memory =
                birthdayData.memories[index % birthdayData.memories.length];

              return (
                <article
                  className="memory-card calendar-memory"
                  key={questions[index]}
                >
                  <div className="calendar-tab">
                    <span>MEMORY</span>
                    <strong>0{index + 1}</strong>
                  </div>

                  <img
                    src={memory.image}
                    alt="Birthday memory"
                    loading="lazy"
                  />

                  <div className="memory-copy">
                    <h4>{questions[index]}</h4>
                    <p>{answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function FunnyMoments() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  return (
    <section className="section-shell" id="funny">
      <div className="section-heading">
        <h3>Hidden Notes 🤫</h3>

        <p>
          Pick a card, then flip it to reveal what is hiding behind the picture.
        </p>
      </div>

      <div className="hidden-grid">
        {birthdayData.hiddenImages.map((_, i) => {
          const [title, text] =
            birthdayData.funnyMoments[i % birthdayData.funnyMoments.length];

          return (
            <article
              className={`hidden-card ${openCard === i ? "is-flipped" : ""}`}
              key={`${title}-${i}`}
            >
              <div className="hidden-card-inner">
                <div className="hidden-card-face hidden-card-front">
                  <img
                    src={
                      birthdayData.hiddenImages[
                        i % birthdayData.hiddenImages.length
                      ]
                    }
                    alt={title}
                    loading="lazy"
                  />

                  <div className="hidden-card-caption">
                    <span className="funny-number">0{i + 1}</span>
                    <h4>{title}</h4>
                    <button
                      className="card-reveal-btn"
                      type="button"
                      onClick={() => setOpenCard(i)}
                    >
                      🔍 Reveal Note
                    </button>
                  </div>
                </div>

                <div className="hidden-card-face hidden-card-back">
                  <span className="hidden-note-icon">💌</span>
                  <p className="hidden-note-text">{text}</p>
                  <button
                    className="card-reveal-btn"
                    type="button"
                    onClick={() => setOpenCard(null)}
                  >
                    ↩ Flip Back
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* =========================
   GIFT REVEAL
========================= */

function GiftReveal() {
  const [revealed, setRevealed] = useState(false);

  function revealGift() {
    setRevealed(true);
    celebrate();
  }

  return (
    <section className="section-shell" id="gift">
      <div className="section-heading">
        <div className="eyebrow">okay... one little thing 🎀</div>

        <h3>Just a Quick Message 💌</h3>

        <p className="birthday-message-intro">
          A little note is waiting for you. Click read when you're ready 💌
        </p>
      </div>

      <div className={`gift-card ${revealed ? "gift-revealed" : ""}`}>
        {!revealed ? (
          <>
            <button className="primary-btn big-btn" onClick={revealGift}>
              💌 Read Message
            </button>
          </>
        ) : (
          <div className="gift-message">
            <div className="birthday-letter">
              {birthdayData.birthdayMessage}
            </div>

            <div className="gift-birthday">happy birthday 🎀</div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   NEHA THINGS
========================= */

function NehaThings() {
  return (
    <section className="section-shell" id="neha-things">
      <div className="section-heading">
        <div className="eyebrow">the neha starter pack</div>

        <h3>Things That Make Neha... Neha 🎀</h3>
      </div>

      <div className="badge-cloud">
        {birthdayData.nehaThings.map((thing) => (
          <div className="thing-badge" key={thing}>
            {thing}
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   FINAL SURPRISE
========================= */

function FinalSurprise() {
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    celebrate();
  }

  return (
    <section className="section-shell final-section" id="final">
      <div className={`final-card ${revealed ? "revealed" : ""}`}>
        {!revealed ? (
          <>
            <h3>
              You survived the chaos...
              <br />
              but the real madness starts now 💥
            </h3>

            <p>
              One final click stands between you and the most unnecessary
              birthday finale ever created.
            </p>

            <button className="primary-btn big-btn" onClick={reveal}>
              💣 UNLEASH THE FINAL CHAOS
            </button>
          </>
        ) : (
          <>
            <div className="final-sparkle">✦ 🎀 ✦</div>

            <h3>Okay Neha, seriously...</h3>

            <p className="final-message">{birthdayData.finalMessage}</p>

            <div className="cake-reveal">
              <div className="cake-pennant-banner" aria-label="Happy Birthday">
                {"HAPPY BIRTHDAY".split("").map((letter, index) => (
                  <span
                    className={
                      letter === " "
                        ? "pennant-space"
                        : `pennant pennant-${index % 5}`
                    }
                    key={`${letter}-${index}`}
                  >
                    {letter === " " ? "" : letter}
                  </span>
                ))}
              </div>

              <img
                className="cake-image"
                src={birthdayData.cakeImage}
                alt={`Birthday cake for ${birthdayData.name}`}
              />

              <div className="cake-poster">
                <span className="cake-poster-name">{birthdayData.name}</span>
                <span className="cake-poster-age">
                  {birthdayData.birthdayAge}
                </span>
                <span className="cake-poster-label">birthday star</span>
              </div>

              <div className="cake-candles" aria-hidden="true">
                <span className="cake-candle candle-one">
                  <i />
                </span>
                <span className="cake-candle candle-two">
                  <i />
                </span>
                <span className="cake-candle candle-three">
                  <i />
                </span>
              </div>

              <div className="cake-burst" aria-hidden="true">
                ✦ 🎉 ✦ 🎀 ✦ 🎉 ✦
              </div>
            </div>

            <div className="footer-line">
              Made with 🎀, memories & questionable decisions.
            </div>

            <div className="footer-name">By Avijeeet 🎀</div>
          </>
        )}
      </div>
    </section>
  );
}

/* =========================
   MUSIC
========================= */

function FloatingNextArrow() {
  const [target, setTarget] = useState("memories");
  const navigationIds = [
    "top",
    "memories",
    "funny",
    "gift",
    "neha-things",
    "final",
  ];

  useEffect(() => {
    function updateTarget() {
      const currentIndex = navigationIds.reduce((activeIndex, id, index) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= 180
          ? index
          : activeIndex;
      }, 0);
      const nextId = navigationIds[currentIndex + 1] ?? "top";
      setTarget(nextId);
    }

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });

    return () => window.removeEventListener("scroll", updateTarget);
  }, []);

  return (
    <button
      className="page-arrow floating-arrow"
      onClick={() => scrollTo(target)}
      aria-label={target === "top" ? "Go to top" : "Go to next section"}
    >
      <span>{target === "top" ? "↑" : "↓"}</span>
    </button>
  );
}

/* =========================
   CONFETTI
========================= */

function celebrate() {
  confetti({
    particleCount: 180,
    spread: 110,
    startVelocity: 42,
    colors: ["#ef6687", "#ffc857", "#48c7c0", "#5a8dee", "#ffffff"],
    origin: { y: 0.65 },
  });

  setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 120,
      colors: ["#ef6687", "#ffc857", "#48c7c0", "#8b3fd0"],
      origin: {
        x: 0.15,
        y: 0.75,
      },
    });

    confetti({
      particleCount: 110,
      spread: 120,
      colors: ["#ef6687", "#ffc857", "#48c7c0", "#8b3fd0"],
      origin: {
        x: 0.85,
        y: 0.75,
      },
    });
  }, 250);
}

function popHeart() {
  confetti({
    particleCount: 18,
    spread: 50,
    scalar: 0.7,
    origin: { y: 0.65 },
  });
}

/* =========================
   APP
========================= */

export default function App() {
  useEffect(() => {
    console.log("Supabase client:", supabase);
  }, []);
  const [entered, setEntered] = useState(false);
  const [memoriesCompleted, setMemoriesCompleted] = useState(false);

  useEffect(() => {
    if (entered) {
      document.body.classList.add("entered");

      setTimeout(() => {
        scrollTo("top");
      }, 50);
    }
  }, [entered]);

  if (!entered) {
    return (
      <main className="app">
        <Sparkles />

        <WelcomeScreen
          onEnter={() => {
            setEntered(true);
            celebrate();
          }}
        />
      </main>
    );
  }

  return (
    <main className="app">
      <FloatingNextArrow />

      <nav className="nav-pill">
        <button onClick={() => scrollTo("top")}>Neha 🎀</button>

        <div className="nav-links">
          {sectionIds.slice(0, memoriesCompleted ? 6 : 1).map((id) => (
            <button key={id} onClick={() => scrollTo(id)}>
              {id === "neha-things"
                ? "Neha things"
                : id === "gift"
                  ? "Gift 🎁"
                  : id}
            </button>
          ))}
        </div>
      </nav>

      <Hero />

      <div className="section-divider">✦ · 🎀 · ✦</div>

      <Memories onComplete={() => setMemoriesCompleted(true)} />

      {memoriesCompleted && (
        <>
          <div className="section-divider">🎀 · ✦ · 🎀</div>
          <FunnyMoments />
          <GiftReveal />
          <NehaThings />
          <FinalSurprise />
        </>
      )}
    </main>
  );
}
