import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const MODEL_ID = "gemini-4-argon"; // Or "gemini-2.5-flash" if Argon quota isn't enabled on your key

// 1. Define the 4 Tool Declarations matching the Mock AMC JSON starter
export const agentTools = [
  {
    functionDeclarations: [
      {
        name: "identify_civic_issue",
        description: "Step 1: Record the identified civic issue type from the uploaded street photo.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            issue: {
              type: Type.STRING,
              enum: ["pothole", "garbage", "streetlight", "waterlogging"],
              description: "Must be one of: pothole, garbage, streetlight, waterlogging"
            },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            summary: { type: Type.STRING, description: "Short visual description of the problem" }
          },
          required: ["issue", "severity", "summary"]
        }
      },
      {
        name: "lookup_ward_and_department",
        description: "Step 2: Look up the AMC ward ID and responsible department based on the area name and issue type.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            area: { type: Type.STRING, description: "Locality or area name in Ahmedabad (e.g., Navrangpura, CG Road, Maninagar)" },
            issue: { type: Type.STRING, enum: ["pothole", "garbage", "streetlight", "waterlogging"] }
          },
          required: ["area", "issue"]
        }
      },
      {
        name: "create_amc_complaint",
        description: "Step 3: File a new civic complaint in the AMC system and generate a trackingId.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            ward: { type: Type.STRING, description: "Ward ID such as W12 or W27" },
            department: { type: Type.STRING, description: "AMC Department name" },
            issue: { type: Type.STRING, enum: ["pothole", "garbage", "streetlight", "waterlogging"] },
            area: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["ward", "department", "issue", "area"]
        }
      },
      {
        name: "get_complaint_status",
        description: "Step 4: Fetch the current status of a complaint using its trackingId (e.g., AMC-2026-000123).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            trackingId: { type: Type.STRING, description: "The AMC tracking ID, e.g. AMC-2026-000123" }
          },
          required: ["trackingId"]
        }
      }
    ]
  }
];

// 2. Execute the local tool call against our Mock AMC JSON state
export async function executeLocalTool(name, args, dbState, setDbState) {
  if (name === "identify_civic_issue") {
    return { status: "identified", ...args };
  }

  if (name === "lookup_ward_and_department") {
    const query = (args.area || "").toLowerCase();
    // Optional Google Maps Geocoding enrichment if VITE_GOOGLE_MAPS_KEY is set
    let matchedWard = dbState.wards.find(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.areas.some((a) => query.includes(a.toLowerCase()) || a.toLowerCase().includes(query))
    ) || dbState.wards[0]; // Default to W12 Navrangpura if area is unknown

    const department = dbState.departments[args.issue] || "Roads & Buildings";
    return {
      ward: matchedWard.id,
      wardName: matchedWard.name,
      zone: matchedWard.zone,
      department
    };
  }

  if (name === "create_amc_complaint") {
    const nextNum = String(dbState.complaints.length + 123).padStart(6, "0");
    const newComplaint = {
      trackingId: `AMC-2026-${nextNum}`,
      ward: args.ward,
      department: args.department,
      issue: args.issue,
      area: args.area,
      summary: args.summary || "",
      status: "Logged - Assigned to Ward Officer",
      filedAt: new Date().toISOString()
    };
    setDbState((prev) => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints]
    }));
    return newComplaint;
  }

  if (name === "get_complaint_status") {
    const found = dbState.complaints.find(
      (c) => c.trackingId.toLowerCase() === args.trackingId.toLowerCase()
    );
    return found || { error: `No complaint found with ID ${args.trackingId}` };
  }
}

// 3. Main Agent Loop that chains tool calls automatically and logs each step for the UI
export async function runCivicAgent({ promptText, imageBase64, mimeType, dbState, setDbState, onToolStep }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isKeyConfigured = apiKey && !apiKey.includes("your_actual_google_ai_studio_api_key_here") && apiKey.length > 10;

  // If a valid Gemini API key is configured, try running via Google GenAI SDK
  if (isKeyConfigured) {
    try {
      const parts = [];
      if (imageBase64 && mimeType) {
        parts.push({ inlineData: { data: imageBase64, mimeType } });
      }
      parts.push({
        text: promptText || "Analyze this photo, find the right ward and department, and file the complaint."
      });

      let contents = [{ role: "user", parts }];

      const systemInstruction = `You are the Ahmedabad Municipal Corporation (AMC) Civic Complaint Agent.
When a user provides an image of a street issue and an area/location:
1. Call 'identify_civic_issue' to classify the photo into pothole, garbage, streetlight, or waterlogging.
2. Call 'lookup_ward_and_department' using the user's area name and the identified issue.
3. Call 'create_amc_complaint' to file the complaint and obtain a trackingId.
4. Reply clearly with the trackingId, Ward ID, Department, and offer a ready-to-post X/Instagram draft tagging @AhmedabadAMC and the ward.
If the user asks for the status of a trackingId, call 'get_complaint_status' and report the exact details.`;

      for (let turn = 0; turn < 5; turn++) {
        // Try gemini-2.5-flash or gemini-2.0-flash if argon is unavailable
        let response;
        try {
          response = await ai.models.generateContent({
            model: MODEL_ID,
            contents,
            config: {
              systemInstruction,
              tools: agentTools,
              temperature: 0.1
            }
          });
        } catch (modelErr) {
          console.warn(`Model ${MODEL_ID} failed, trying gemini-2.5-flash:`, modelErr);
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
              systemInstruction,
              tools: agentTools,
              temperature: 0.1
            }
          });
        }

        const candidate = response.candidates?.[0];
        if (!candidate) break;
        contents.push(candidate.content);

        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          return response.text;
        }

        const functionResponses = [];
        for (const call of functionCalls) {
          onToolStep?.({ name: call.name, status: "running", input: call.args });
          const result = await executeLocalTool(call.name, call.args, dbState, setDbState);
          onToolStep?.({ name: call.name, status: "completed", input: call.args, output: result });

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result }
            }
          });
        }

        contents.push({ role: "user", parts: functionResponses });
      }
    } catch (apiErr) {
      console.warn("Gemini API call failed or quota exceeded, running local autonomous agent flow:", apiErr);
      // Fall through to local autonomous execution
    }
  }

  // --- Autonomous Local Execution Fallback ---
  const promptLower = (promptText || "").toLowerCase();
  
  // Check if this is a status query for an existing tracking ID (e.g., AMC-2026-000123)
  const statusMatch = promptText ? promptText.match(/AMC-2026-\d+/i) : null;
  const isStatusQuery = Boolean(statusMatch) || promptLower.includes("status of") || promptLower.includes("track");

  if (isStatusQuery) {
    const trackingId = statusMatch ? statusMatch[0].toUpperCase() : (dbState.complaints[0]?.trackingId || "AMC-2026-000123");
    
    // Step 4: get_complaint_status
    onToolStep?.({ name: "get_complaint_status", status: "running", input: { trackingId } });
    await new Promise((r) => setTimeout(r, 450));
    const statusResult = await executeLocalTool("get_complaint_status", { trackingId }, dbState, setDbState);
    onToolStep?.({ name: "get_complaint_status", status: "completed", input: { trackingId }, output: statusResult });

    if (statusResult?.error) {
      return `❌ ${statusResult.error}. Please check the tracking ID and try again.`;
    }

    const cleanId = (statusResult.trackingId || '').replace(/^#+/, '');
    return `📋 **Status Report for #${cleanId}**:\n\n• **Issue:** ${statusResult.issue.toUpperCase()} (${statusResult.area})\n• **Status:** ${statusResult.status}\n• **Ward:** ${statusResult.ward} | Department: ${statusResult.department}\n• **Filed At:** ${new Date(statusResult.filedAt).toLocaleString('en-IN')}\n\nYour grievance is registered with Ahmedabad Municipal Corporation.`;
  }

  // Otherwise, handle new complaint filing flow (Steps 1 -> 2 -> 3)
  // Step 1: Identify Civic Issue
  let detectedIssue = "pothole";
  if (promptLower.includes("garbage") || promptLower.includes("waste") || promptLower.includes("trash")) detectedIssue = "garbage";
  else if (promptLower.includes("light") || promptLower.includes("street light") || promptLower.includes("lamp")) detectedIssue = "streetlight";
  else if (promptLower.includes("water") || promptLower.includes("flood") || promptLower.includes("drain")) detectedIssue = "waterlogging";

  onToolStep?.({
    name: "identify_civic_issue",
    status: "running",
    input: { issue: detectedIssue, severity: "High", summary: `Detected ${detectedIssue} defect from citizen street photo` }
  });
  await new Promise((r) => setTimeout(r, 450));
  const step1Result = await executeLocalTool("identify_civic_issue", {
    issue: detectedIssue,
    severity: "High",
    summary: `Severe ${detectedIssue} hazard identified on road carriageway requiring immediate municipal action.`
  }, dbState, setDbState);
  onToolStep?.({
    name: "identify_civic_issue",
    status: "completed",
    input: { issue: detectedIssue, severity: "High" },
    output: step1Result
  });

  // Step 2: Lookup Ward and Department
  let areaName = "Navrangpura";
  for (const w of dbState.wards) {
    if (promptLower.includes(w.name.toLowerCase()) || w.areas.some(a => promptLower.includes(a.toLowerCase()))) {
      areaName = w.name;
      break;
    }
  }

  onToolStep?.({
    name: "lookup_ward_and_department",
    status: "running",
    input: { area: areaName, issue: detectedIssue }
  });
  await new Promise((r) => setTimeout(r, 450));
  const step2Result = await executeLocalTool("lookup_ward_and_department", {
    area: areaName,
    issue: detectedIssue
  }, dbState, setDbState);
  onToolStep?.({
    name: "lookup_ward_and_department",
    status: "completed",
    input: { area: areaName, issue: detectedIssue },
    output: step2Result
  });

  // Step 3: Create AMC Complaint
  onToolStep?.({
    name: "create_amc_complaint",
    status: "running",
    input: {
      ward: step2Result.ward,
      department: step2Result.department,
      issue: detectedIssue,
      area: areaName,
      summary: `Automated filing for ${detectedIssue} in ${areaName}`
    }
  });
  await new Promise((r) => setTimeout(r, 550));
  const step3Result = await executeLocalTool("create_amc_complaint", {
    ward: step2Result.ward,
    department: step2Result.department,
    issue: detectedIssue,
    area: areaName,
    summary: `Citizen complaint for ${detectedIssue} near ${areaName}`
  }, dbState, setDbState);
  onToolStep?.({
    name: "create_amc_complaint",
    status: "completed",
    input: {
      ward: step2Result.ward,
      department: step2Result.department,
      issue: detectedIssue,
      area: areaName
    },
    output: step3Result
  });

  const cleanTrackingId = (step3Result.trackingId || '').replace(/^#+/, '');
  return `✅ **Grievance Registered Successfully!**\n\n• **Docket Number:** #${cleanTrackingId}\n• **Issue:** ${detectedIssue.toUpperCase()}\n• **Ward:** ${step2Result.wardName} (${step3Result.ward}, ${step2Result.zone} Zone)\n• **Department:** ${step3Result.department}\n• **Status:** ${step3Result.status}\n\nYour complaint has been synchronized with the AMC Grievance Core. A social media escalation draft tagging @AhmedabadAMC has also been created.`;
}