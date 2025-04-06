import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const formData = await req.formData();
  const recordingUrl = formData.get("RecordingUrl")?.toString();
  const callSid = formData.get("CallSid")?.toString();

  if (!recordingUrl || !callSid) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  await supabaseAdmin.from("call_recordings").insert({
    call_sid: callSid,
    url: `${recordingUrl}.mp3`,
  });

  return NextResponse.json({ success: true });
}
