// Cloudflare Worker version of the WhatsApp FAQ bot
// Matches incoming message text against keyword rules and replies accordingly

// Rules are checked top to bottom — put more specific keywords first
const rules = [
  {
    keywords: ["hi", "hello", "hey", "হাই", "হ্যালো"],
    reply: "হ্যালো! 👋 Organik Chicken-এ স্বাগতম। আপনার কোন বিষয়ে জানতে চান? (যেমন: প্রোডাক্ট, দাম, ডেলিভারি, হালাল, রিফান্ড)"
  },
  {
    keywords: ["antibiotic", "এন্টিবায়োটিক", "অর্গানিক", "organic", "বৈশিষ্ট্য"],
    reply: "আমাদের মুরগি জিরো অ্যান্টিবায়োটিক (NAE) ও ফ্রি রেঞ্জ পদ্ধতিতে পালন করা হয়, USDA ও ইউরোপিয়ান অর্গানিক গাইডলাইন অনুসরণ করে। বিস্তারিত: https://organikchicken.com.bd/faq"
  },
  {
    keywords: ["হালাল", "halal"],
    reply: "জ্বি, আমরা ইসলামী শরিয়াহ মতে হালাল প্রক্রিয়ায় মুরগি জবেহ ও প্রসেসিং করি।"
  },
  {
    keywords: ["প্রোডাক্ট", "প্রডাক্ট", "product", "কি পাওয়া যায়", "প্রাইস লিস্ট", "দাম কত", "মূল্য তালিকা"],
    reply: "🌿 Organik Chicken প্রাইস লিস্ট 🌿\n\n🐔 ব্রয়লার — ৪৫০ টাকা/কেজি (মিনিমাম ৫ পিস)\nস্টক আউট, নতুন ব্যাচ ৪-৯ জুলাই\n\n🐓 প্রিমিয়াম কালার বার্ড — ৬২০ টাকা/কেজি (মিনিমাম ৬ পিস)\nনতুন ব্যাচ ডেলিভারি ৯/১০ জুলাই থেকে, স্টক লিমিটেড\n\n🍖 গিলা-কলিজা — ৪০০ টাকা/কেজি\n\n🥩 ব্রয়লার ব্রেস্ট (হাড়সহ) — ৮২৫ টাকা/কেজি (স্টক আউট, ৭-১৪ জুলাই আসবে)\n🍗 ব্রয়লার লেগ পিস — ৬৭৫ টাকা/কেজি (স্টক আউট, ৮-১৪ জুলাই আসবে)\n🐓 কালার বার্ড লেগ পিস — ৭২৫ টাকা/কেজি\n(লেগ/ব্রেস্ট মিনিমাম ২ কেজি অর্ডার)\n\n🍢 চিকেন মিটবল — ২৫০ টাকা/প্যাকেট (২৫০গ্রাম, মিনিমাম ৪ প্যাকেট)\n🥖 চিকেন সসেজ — ৩৩০ টাকা/প্যাকেট (৩০০গ্রাম, মিনিমাম ৪ প্যাকেট)\n\n🥚 Omega-3 ফ্রি-রেঞ্জ ডিম — ২৪০ টাকা/ডজন (মিনিমাম ৪ ডজন, শুধু ঢাকা সিটি)\n\n🏠 ঢাকা সিটিতে ১০০% ফ্রি হোম ডেলিভারি"
  },
  {
    keywords: ["ব্রয়লার দাম", "ব্রয়লারের দাম", "broiler price"],
    reply: "🐔 ব্রয়লার — ৪৫০ টাকা/কেজি (ড্রেসিং এর পরে)\nমিনিমাম অর্ডার ৫ পিস (≈৬ কেজি)\n\n⚠️ বর্তমানে স্টক আউট, নতুন ব্যাচ ৪-৯ জুলাইয়ের মধ্যে শুরু হবে। বুকিং নেয়া হচ্ছে।"
  },
  {
    keywords: ["কালার বার্ড দাম", "কালার বার্ডের দাম", "color bird price"],
    reply: "🐓 প্রিমিয়াম কালার বার্ড — ৬২০ টাকা/কেজি\nগড় ওজন ≈ ৭০০-৮০০ গ্রাম, মিনিমাম অর্ডার ৬ পিস\nড্রেসিং করা মুরগি ও সব অংশ আলাদা প্যাকেটে, দামের মধ্যেই অন্তর্ভুক্ত।\n\n⚠️ নতুন ব্যাচের ডেলিভারি ৯/১০ জুলাই থেকে শুরু, স্টক লিমিটেড।"
  },
  {
    keywords: ["ডিমের দাম", "egg price"],
    reply: "🥚 Omega-3 ফ্রি-রেঞ্জ ডিম — ২৪০ টাকা/ডজন\nমিনিমাম অর্ডার ৪ ডজন (শুধু ঢাকা সিটির জন্য)\n\n📍 নারায়ণগঞ্জ, সাভার ও গাজীপুরে শুধু ডিমের অর্ডার নেয়া হয় না।\n⏱️ ডেলিভারি: অর্ডারের পরদিন থেকে ৫-৬ দিনের মধ্যে।"
  },
  {
    keywords: ["মিটবল", "meatball"],
    reply: "🍢 চিকেন মিটবল (≈২৫০ গ্রাম/প্যাকেট) — ২৫০ টাকা\nমিনিমাম অর্ডার ৪ প্যাকেট।\nমূল চিকেন অর্ডারের সাথে ইচ্ছামতো যোগ করা যাবে।"
  },
  {
    keywords: ["সসেজ", "sausage"],
    reply: "🥖 চিকেন সসেজ (≈৩০০ গ্রাম/প্যাকেট) — ৩৩০ টাকা\nমিনিমাম অর্ডার ৪ প্যাকেট।\nমূল চিকেন অর্ডারের সাথে ইচ্ছামতো যোগ করা যাবে।"
  },
  {
    keywords: ["স্টক", "stock available"],
    reply: "বর্তমান স্টক অবস্থা:\n🐔 ব্রয়লার — স্টক আউট, নতুন ব্যাচ ৪-৯ জুলাই\n🐓 কালার বার্ড — নতুন ব্যাচ ৯/১০ জুলাই থেকে, লিমিটেড স্টক\n🥩 ব্রেস্ট — স্টক আউট, ৭-১৪ জুলাই আসবে\n🍗 ব্রয়লার লেগ পিস — স্টক আউট, ৮-১৪ জুলাই আসবে\n\nবাকি সব প্রোডাক্ট (গিলা-কলিজা, কালার বার্ড লেগ, মিটবল, সসেজ, ডিম) বর্তমানে পাওয়া যাচ্ছে।"
  },
  {
    keywords: ["জীবিত মুরগী", "জীবিত মুরগি", "live chicken"],
    reply: "জীবিত মুরগি ডেলিভারি দেয়া হয় না। প্রি-বুকিং করে জবেহ শিডিউলে সরাসরি ফার্মে (কালিয়াকৈর, গাজীপুর) এসে সংগ্রহ করতে হবে।"
  },
  {
    keywords: ["ডেলিভারি এলাকা", "কোথায় পাওয়া", "delivery area", "সাভার", "গাজীপুর", "নারায়ণগঞ্জ"],
    reply: "আমরা ফ্রোজেন মুরগি হোম ডেলিভারি দিই শুধু ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। কোনো শো-রুম নেই।"
  },
  {
    keywords: ["কালার বার্ড", "color bird"],
    reply: "আমাদের কালার বার্ড ফ্রান্সের হাবার্ট মাল্টি কালার বার্ড জাত, ৫৫-৬০ দিনে গড় জীবিত ওজন ১.১-১.৩ কেজি। ব্রয়লারের চেয়ে মাংস শক্ত।"
  },
  {
    keywords: ["প্রিমিয়াম রোস্টার", "premium roaster"],
    reply: "প্রিমিয়াম রোস্টার হলো ১২০ দিন পালিত হাবার্ট কালার বার্ডের বাছাইকৃত মোরগ, ড্রেসিং ওজন প্রায় ২.৩ কেজি। সর্বনিম্ন অর্ডার ৩ পিস।"
  },
  {
    keywords: ["রিফান্ড", "refund"],
    reply: "হ্যাঁ, ডেলিভারি করা মুরগি খাওয়ার অনুপযুক্ত মনে হলে আমরা শর্তহীনভাবে টাকা রিফান্ড দিই।"
  },
  {
    keywords: ["দাম বেশি", "দাম বেশী কেন", "price high"],
    reply: "দাম বেশি হওয়ার কারণ: বেশি মৃত্যুহার, দীর্ঘ পালন সময়, বেশি খাবার খরচ, ও উচ্চ লেবার/ডেলিভারি খরচ (যা এখন ফ্রি দেয়া হয়)।"
  },
  {
    keywords: ["ড্রেসিং", "dressing weight"],
    reply: "১ কেজি জীবিত মুরগি ড্রেসিং করলে প্রায় ৭০০ গ্রাম থাকে (চামড়া/নাড়িভুঁড়ি বাদে), তাই ড্রেসিং করা কেজির দাম বেশি মনে হয়।"
  },
  {
    keywords: ["ডেলিভারি কতদিন", "কতদিনে ডেলিভারি", "delivery time"],
    reply: "জবেহ শিডিউল অনুযায়ী সাধারণত অর্ডারের ৩-৪ দিনের মধ্যে ডেলিভারি হয়। স্টকে না থাকলে পরবর্তী শিডিউল পর্যন্ত অপেক্ষা করতে হয়।"
  },
  {
    keywords: ["ফ্রি রেঞ্জ ডিম", "free range egg"],
    reply: "ফ্রি রেঞ্জ ডিমের মুরগি দিনে উন্মুক্ত জায়গায় ঘোরে, খাঁচায় বন্দি থাকে না। এতে কম কোলেস্টেরল, বেশি ভিটামিন এ/ডি/ই ও ওমেগা-৩ থাকে।"
  },
  {
    keywords: ["ডিমের মেয়াদ", "egg expiry"],
    reply: "ফ্রিজে রাখলে ১ মাস, ২৫°C তাপমাত্রায় ২৫ দিন, আর রুম তাপমাত্রায় ২ সপ্তাহ ভালো থাকে।"
  },
  {
    keywords: ["কুসুম", "কুসুমের রঙ", "yolk color"],
    reply: "কুসুমের রঙ ফিডের উপাদান মিক্সের উপর নির্ভর করে, তাই মাঝে মাঝে স্বাভাবিক ডিমের মতো রঙ হতে পারে — এটা স্বাভাবিক।"
  },
  {
    keywords: ["প্যাকেটে কি থাকে", "package contents"],
    reply: "প্যাকেটে থাকে ড্রেসিং করা মুরগি, আলাদা প্যাকেটে গিলা-কলিজা ও মাথা, এবং আলাদা প্যাকেটে পরিষ্কার করা পা।"
  },
];

const defaultReply = "দুঃখিত, বুঝতে পারিনি। প্রোডাক্ট, দাম, ডেলিভারি, হালাল, রিফান্ড ইত্যাদি নিয়ে জিজ্ঞাসা করতে পারেন, অথবা একজন প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।";

function getReply(text) {
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.reply;
    }
  }
  return defaultReply;
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      console.error("Unhandled error:", err);
      return new Response(`Worker error: ${err.message}\n\n${err.stack}`, { status: 500 });
    }
  },
};

// ============================================
// GLOBAL PAUSE SWITCH — change to true to stop
// ALL auto-replies, then Save and deploy.
// Change back to false to resume.
// ============================================
const GLOBAL_AUTO_REPLY_ENABLED = true;

async function handleRequest(request, env) {
    const url = new URL(request.url);

    // --- Admin routes: pause/resume the bot for a specific customer ---
    if (url.pathname === "/admin/pause" || url.pathname === "/admin/resume") {
      const token = url.searchParams.get("token");
      const number = url.searchParams.get("number");

      if (token !== env.ADMIN_TOKEN) {
        return new Response("Forbidden", { status: 403 });
      }
      if (!number) {
        return new Response("Missing ?number=", { status: 400 });
      }

      if (url.pathname === "/admin/pause") {
        // Bot stays silent for this number for up to 24h, or until /admin/resume is called
        await env.SESSIONS.put(`agent:${number}`, "1", { expirationTtl: 60 * 60 * 24 });
        return new Response(`Bot paused for ${number}`, { status: 200 });
      } else {
        await env.SESSIONS.delete(`agent:${number}`);
        return new Response(`Bot resumed for ${number}`, { status: 200 });
      }
    }

    // --- Admin routes: pause/resume the bot GLOBALLY for everyone ---
    if (url.pathname === "/admin/pause-all" || url.pathname === "/admin/resume-all") {
      const token = url.searchParams.get("token");

      if (token !== env.ADMIN_TOKEN) {
        return new Response("Forbidden", { status: 403 });
      }

      if (url.pathname === "/admin/pause-all") {
        // No expirationTtl — stays off until you explicitly resume it
        await env.SESSIONS.put("global:paused", "1");
        return new Response("Auto-reply PAUSED for everyone", { status: 200 });
      } else {
        await env.SESSIONS.delete("global:paused");
        return new Response("Auto-reply RESUMED for everyone", { status: 200 });
      }
    }

    if (url.pathname !== "/webhook") {
      return new Response("Not found", { status: 404 });
    }

    // 1) Webhook verification (Meta calls this once, as a GET request)
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === env.VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }

    // 2) Incoming messages (POST requests)
    if (request.method === "POST") {
      const body = await request.json();

      // Handle the message asynchronously-ish, but still return 200 fast
      try {
        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];

        if (message) {
          const from = message.from;
          const text = message.text?.body?.toLowerCase() || "";
          await handleIncomingMessage(env, from, text);
        }
      } catch (err) {
        console.error("Error handling webhook:", err);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Method not allowed", { status: 405 });
}

const MAX_AUTO_REPLIES = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const handoffMessage =
  "আপনি আজকের জন্য সর্বোচ্চ ৩টি অটো-রিপ্লাই পেয়েছেন। এখন আমাদের একজন প্রতিনিধি শীঘ্রই সরাসরি আপনার সাথে যোগাযোগ করবেন। ধন্যবাদ ধৈর্য ধরার জন্য।";

async function handleIncomingMessage(env, from, text) {
  // Hardcoded kill switch — checked first, no KV involved
  if (!GLOBAL_AUTO_REPLY_ENABLED) {
    return;
  }

  // Global kill switch (KV-based) — if paused, the bot doesn't reply to anyone
  const globallyPaused = await env.SESSIONS.get("global:paused");
  if (globallyPaused) {
    return;
  }

  // If a human agent has picked up this specific conversation, stay silent
  const agentActive = await env.SESSIONS.get(`agent:${from}`);
  if (agentActive) {
    return;
  }

  const key = `session:${from}`;
  const now = Date.now();

  let session = null;
  try {
    const raw = await env.SESSIONS.get(key);
    if (raw) session = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read session:", err);
  }

  // Start a fresh 24h window if none exists or the old one expired
  if (!session || now - session.windowStart > WINDOW_MS) {
    session = { windowStart: now, count: 0, notified: false };
  }

  if (session.count < MAX_AUTO_REPLIES) {
    const reply = getReply(text);
    await sendMessage(env, from, reply);
    session.count += 1;
  } else if (!session.notified) {
    // Limit just reached — send the handoff notice once per window
    await sendMessage(env, from, handoffMessage);
    session.notified = true;
  }
  // If already notified and still within the same window, stay silent —
  // a human should take over from here (e.g. via Meta Business Suite inbox)

  try {
    await env.SESSIONS.put(key, JSON.stringify(session), {
      expirationTtl: 60 * 60 * 24, // auto-clean after 24h
    });
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

async function sendMessage(env, to, text) {
  const graphUrl = `https://graph.facebook.com/v21.0/${env.PHONE_NUMBER_ID}/messages`;

  const response = await fetch(graphUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to send message:", JSON.stringify(data));
  }
}
