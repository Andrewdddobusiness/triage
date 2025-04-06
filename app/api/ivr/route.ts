import { NextResponse } from "next/server";
import { twiml as Twiml } from "twilio";
import { supabaseAdmin } from "@/lib/supabase/service";

const VoiceResponse = Twiml.VoiceResponse;
const sessions: Record<string, any> = {};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const CallSid = formData.get("CallSid")?.toString() || "";
    const SpeechResult = formData.get("SpeechResult")?.toString() || "";

    const session = sessions[CallSid] || { step: 0, data: {} };
    const twiml = new VoiceResponse();

    const ask = (prompt: string, field?: string) => {
      const gather = twiml.gather({
        input: ["speech"],
        timeout: 5,
        action: "/api/ivr",
        method: "POST",
      });

      gather.say(prompt);

      if (field && SpeechResult) {
        supabaseAdmin.from("ivr_logs").insert({
          call_sid: CallSid,
          field,
          raw_input: SpeechResult,
          interpreted: session.data[field] ?? null,
        });
      }
    };

    switch (session.step) {
      case 0:
        ask("Hi, I'm your tradie's assistant. What's your name?");
        session.step++;
        break;

      case 1:
        session.data.name = SpeechResult;
        ask("Thanks. What's the best number to reach you on?", "name");
        session.step++;
        break;

      case 2:
        session.data.phone = SpeechResult;
        ask("Awesome. Do you have a budget in mind?", "phone");
        session.step++;
        break;

      case 3:
        const rawBudget = SpeechResult.replace(/[^0-9.]/g, "");
        session.data.budget = parseFloat(rawBudget) || null;
        ask("Last question. Can you tell me about the job?", "budget");
        session.step++;
        break;

      case 4:
        session.data.job_description = SpeechResult;

        await supabaseAdmin.from("customer_inquiries").insert({
          name: session.data.name,
          phone: session.data.phone,
          budget: session.data.budget,
          job_description: session.data.job_description,
          call_sid: CallSid,
        });

        await supabaseAdmin.from("ivr_logs").insert({
          call_sid: CallSid,
          field: "job_description",
          raw_input: SpeechResult,
          interpreted: session.data.job_description,
        });

        twiml.say("Thanks! Your message has been sent. Goodbye.");
        twiml.hangup();
        delete sessions[CallSid];
        break;
    }

    sessions[CallSid] = session;

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    console.error("IVR error:", err);
    const errorTwiml = new VoiceResponse();
    errorTwiml.say("Sorry, there was a problem. Please try again later.");
    errorTwiml.hangup();

    return new NextResponse(errorTwiml.toString(), {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
