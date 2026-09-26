exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return {statusCode:405,body:"Method not allowed"};
  try {
    const body=JSON.parse(event.body||"{}");
    const mode=body.mode||"interesting";
    const time=body.time||"No idea";
    const prompts={
      interesting:"Give one genuinely interesting, surprising, accurate thing for an adult to enjoy while waiting. No quiz, no brain teaser, no homework. 70-130 words. Vary subjects widely. Do not repeat common trivia.",
      surprise:"Surprise the user with one fascinating short idea, story, observation, science fact, historical detail, or thought-provoking connection. No quiz or brain teaser. 70-130 words.",
      use:"Suggest one useful, concrete thing a person can accomplish from a phone while waiting for "+time+". It should feel worthwhile, not like busywork. 50-100 words.",
      talk:"Start a natural conversation like an interesting companion. Offer one specific observation or topic and invite a response without interrogating the user. 50-100 words."
    };
    const resp=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.OPENAI_API_KEY},body:JSON.stringify({model:"gpt-5.6-luna",input:[{role:"system",content:"You are Waiting Room Buddy: quiet, warm, concise, interesting, and useful. Never act like a quizmaster."},{role:"user",content:prompts[mode]||prompts.interesting}],max_output_tokens:220})});
    const data=await resp.json();
    if(!resp.ok) throw new Error((data.error&&data.error.message)||"OpenAI request failed");
    let text="";
    if(data.output_text) text=data.output_text;
    else if(data.output) for(const o of data.output) if(o.content) for(const p of o.content) if(p.text) text+=p.text;
    return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({text:text||"I couldn't come up with something just now. Try again."})};
  } catch(e) {
    return {statusCode:500,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:e.message})};
  }
};