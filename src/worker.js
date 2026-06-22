export default {
  async fetch(request) {
    // Allow your local React app to communicate safely with cloudflare
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-type",
    };
    if (request.method === "OPTIONS") return new Response(null, {headers: corsHeaders});
    if (request.method !== "POST") return new Response("Post Only", {status: 405});
    try {
      const {text, language} = await request.json();
      const OPENROUTER_URL = 'https://dark-grass-6868.raqibstanikzai367.workers.dev'
      const API_KEY = process.env.OPENROUTER_API_KEY
      if (!API_KEY) {
        return new Response(JSON.stringify({error: "Cloudflare is missing the API Key variable."}), {status: 500, headers: corsHeaders});
      }
      const airesponse = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
      body:JSON.stringify({
        model:"meta-llama/llama-3-8b-insttruct",
        messages:[
          {role:"system",content:`Translate directly into ${language}.Return ONLY the direct translation text.`},
          {role:"user", content:text}
        ],
        temprature:0.5,
        max_tokens:100
      })
    });
    const data = await airesponse.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const translation = data.choices[0].message.content.trim();
      return new Response(JSON.stringify({translation}),{headers:corsHeaders});
 } else if(data.error){
  return new Response(JSON.stringify({error:`OpenRouter Error: ${data.error.message}`}),{status:400, headers:corsHeaders});
} else {
   return new Response(JSON.stringify({error:"UnKnown response format from AI platform."}),{status:500, headers:corsHeaders});
}
    } catch (error){
      return new Response(JSON.stringify({error:`Server Error: ${error.message}`}),{status:500, headers:corsHeaders});
    }

  }
};