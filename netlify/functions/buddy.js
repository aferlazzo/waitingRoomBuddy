exports.handler = async function(event) {
  const json = (statusCode, body) => ({
    statusCode,
    headers: {"Content-Type":"application/json","Cache-Control":"no-store"},
    body: JSON.stringify(body)
  });

  if (event.httpMethod === "GET") {
    return json(200, {ok:true, service:"Waiting Room Buddy", keyConfigured:Boolean(process.env.OPENAI_API_KEY)});
  }
  if (event.httpMethod !== "POST") return json(405,{error:"Method not allowed"});

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("WRB CONFIG ERROR: OPENAI_API_KEY is missing");
      return json(500,{error:"WRB server is missing its OpenAI API key."});
    }

    const body=JSON.parse(event.body||"{}");
    const mode=body.mode||"interesting";
    const time=body.time||"No idea";
    const prompts={
      interesting:"Give one genuinely interesting, surprising, accurate thing for an adult to enjoy while waiting. No quiz, no brain teaser, no homework. 70-130 words. Vary subjects widely. Do not repeat common trivia.",
      surprise:"Surprise the user with one fascinating short idea, story, observation, science fact, historical detail, or thought-provoking connection. No quiz or brain teaser. 70-130 words.",
      use:"Suggest one useful, concrete thing a person can accomplish from a phone while waiting for "+time+". It should feel worthwhile, not like busywork. 50-100 words.",
      talk:"Start a natural conversation like an interesting companion. Offer one specific observation or topic and invite a response without interrogating the user. 50-100 words."
    };

    const resp=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.OPENAI_API_KEY},
      body:JSON.stringify({
        model:"gpt-5.6-luna",
        reasoning:{effort:"none"},
        input:[
          {role:"system",content:"You are Waiting Room Buddy: quiet, warm, concise, interesting, and useful. Never act like a quizmaster."},
          {role:"user",content:prompts[mode]||prompts.interesting}
        ],
        max_output_tokens:220
      })
    });

    const raw=await resp.text();
    let data={};
    try { data=raw ? JSON.parse(raw) : {}; } catch (_) { data={}; }

    if(!resp.ok) {
      const message=(data.error&&data.error.message)||raw||"OpenAI request failed";
      const code=(data.error&&data.error.code)||"unknown";
      const type=(data.error&&data.error.type)||"unknown";
      console.error("WRB OPENAI ERROR", JSON.stringify({status:resp.status, code, type, message}));
      return json(resp.status,{error:message});
    }

    let text="";
    if(data.output_text) text=data.output_text;
    else if(data.output) for(const o of data.output) if(o.content) for(const p of o.content) if(p.text) text+=p.text;
    console.log("WRB OPENAI SUCCESS", JSON.stringify({mode,status:resp.status,hasText:Boolean(text)}));
    return json(200,{text:text||"I couldn't come up with something just now. Try again."});
  } catch(e) {
    const message=e && e.message ? e.message : "Unexpected WRB server error";
    console.error("WRB SERVER ERROR", message);
    return json(500,{error:message});
  }
};