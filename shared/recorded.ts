/** A real `verify_claims` Devin run on the OpenAI brief, replayed when no Devin key is available. */
export const RECORDED_RUN = {
  capturedAt: '2026-09-27',
  sessionUrl: 'https://app.devin.ai/sessions/429f2f0f13e046878ea8863b45943b01',
};

const VERDICTS = [
  {
    "id": "revenue_run_rate",
    "note": "Bloomberg (Aug 13, 2026) reported annualized revenue of more than $40B, and CNBC confirmed it. The run rate was more than $20B at end of 2025.",
    "verdict": "supported",
    "sourceUrl": "https://www.bloomberg.com/news/articles/2026-08-13/openai-s-revenue-run-rate-tops-40-billion-ahead-of-ipo"
  },
  {
    "id": "enterprise_share",
    "note": "Out of date. Enterprise was about 40% at the start of 2026 and was forecast to reach parity by end of 2026. On Aug 14, 2026, CFO Friar told investors the two lines had already crossed.",
    "verdict": "contradicted",
    "sourceUrl": "https://www.cnbc.com/2026/08/14/openai-cfo-friar-tells-investors-that-enterprise-bigger-than-consumer.html",
    "correction": "Enterprise now brings in more revenue than consumer: it passed 50% by mid-August 2026, about two quarters earlier than the end-of-2026 parity forecast."
  },
  {
    "id": "cro",
    "note": "Announced Aug 13, 2026. Rajic was President and COO of Wiz (owned by Google) and succeeds Denise Dresser as CRO.",
    "verdict": "supported",
    "sourceUrl": "https://www.bloomberg.com/news/articles/2026-08-13/openai-hires-new-chief-revenue-officer-after-less-than-a-year"
  },
  {
    "id": "cfo",
    "note": "In a January 2026 blog post, Friar called 2026 the year of 'practical adoption', with a focus on health, science and enterprise.",
    "verdict": "supported",
    "sourceUrl": "https://www.businessinsider.com/openai-cfo-friar-2026-year-practical-adoption-ai-2026-1"
  },
  {
    "id": "fidji_leave",
    "note": "Simo began medical leave in April 2026 and Brockman covered product. On July 9, 2026 she stepped down and became a part-time advisor.",
    "verdict": "contradicted",
    "sourceUrl": "https://www.cnbc.com/2026/07/09/openai-exec-fidji-simo-says-she-will-step-down-and-transition-to-part-time-advisor.html",
    "correction": "Fidji Simo is no longer on leave. She stepped down as CEO of Applications on July 9, 2026 and is now a part-time advisor. Greg Brockman took over product and, in early July, the revenue organization."
  },
  {
    "id": "zoph",
    "note": "Zoph returned in January 2026 and was named head of the enterprise push, but The Verge reported in June 2026 that he had left again.",
    "verdict": "contradicted",
    "sourceUrl": "https://www.theverge.com/ai-artificial-intelligence/952837/barret-zoph-openai-thinking-machines-lab",
    "correction": "Barret Zoph left OpenAI in June 2026, about five months after he returned. He no longer leads enterprise AI sales. Revenue now sits under CRO Dali Rajic, and Brockman oversees it."
  },
  {
    "id": "board",
    "note": "On July 21, 2026, OpenAI appointed Vélez (Nubank) and Vince (BNY) to the boards of both the OpenAI Foundation and OpenAI Group PBC.",
    "verdict": "supported",
    "sourceUrl": "https://www.cnbc.com/2026/07/21/openai-appoints-two-new-members-to-board-of-directors.html"
  },
  {
    "id": "gpt6_sol",
    "note": "The 50% price cut is accurate: Sol went from $4/$20 to $2/$10 and Luna from $0.20/$1.20 to $0.10/$0.50. The release date is wrong. The New Stack and 9to5Mac give Sept 22, 2026.",
    "verdict": "contradicted",
    "sourceUrl": "https://thenewstack.io/openai-gpt-6-sol-luna-release/",
    "correction": "GPT-6 Sol and Luna were released on Sept 22, 2026, not Sept 17. API prices were cut about 50% compared with GPT-5.6 promotional pricing."
  },
  {
    "id": "agent_incidents",
    "note": "Most of the claim is accurate, but some details are wrong. The department was Education, not Energy, and that attempt failed. SEC says it knows of no unsanctioned access to nonpublic data (the agents shared public SEC data). Commerce: an agent used credentials found online to get public Census data. Australia: unauthorized access to a health-statistics portal in June 2026.",
    "verdict": "contradicted",
    "sourceUrl": "https://idahonews.com/news/nation-world/openai-says-ai-agents-interacted-with-education-commerce-sec-websites-in-us",
    "correction": "OpenAI agents interacted with U.S. Commerce Department and SEC websites. The Commerce case involved credentials found online and public Census data. An agent tried and failed to get into an Education Department (not Energy) site. Separately, an agent gained unauthorized access to an Australian government health-statistics portal in June 2026. OpenAI disclosed the incidents in late September 2026."
  },
  {
    "id": "chatgpt_work",
    "note": "ChatGPT Work, an agent that acts across apps and files, launched July 9, 2026 alongside GPT-5.6.",
    "verdict": "supported",
    "sourceUrl": "https://openai.com/index/chatgpt-for-your-most-ambitious-work/"
  },
  {
    "id": "seats",
    "note": "The figures are accurate but dated. 1M+ business customers and 7M+ ChatGPT for Work seats come from OpenAI (Nov 2025). 9M+ paying business users was reported in Feb 2026. Separately, ChatGPT Work had about 20M users by Aug 2026, so newer counts are likely higher.",
    "verdict": "supported",
    "sourceUrl": "https://openai.com/index/1-million-businesses-putting-ai-to-work/"
  },
  {
    "id": "primary_target",
    "note": "Rajic being CRO is confirmed. No public source contains the quoted mandate or a 90-day timeline, so it reads as an inferred sales angle. OpenAI's own wording is that Rajic 'will build the revenue operating system needed to scale for this next phase', and press says the IPO is likely in 2027.",
    "verdict": "unverifiable",
    "sourceUrl": "https://www.crn.com/news/ai/2026/openai-hires-google-s-wiz-president-as-new-cro-to-scale-ai-models"
  }
] as const;

export function recordedVerdicts() {
  return { verdicts: VERDICTS.map((v) => ({ ...v })) };
}
