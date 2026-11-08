import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { SUPERTONIC_MODEL_DIRECTORY, SUPERTONIC_MODEL_FILES } from "../packages/contracts/src/speech-models";

const BUILD_ROOT = resolve(".openbot-build/voice");
const MODEL_DIR = join(BUILD_ROOT, SUPERTONIC_MODEL_DIRECTORY);
const ADDON_PATH = join(BUILD_ROOT, "runtime", "sherpa-onnx.node");
const OUTPUT_DIR = resolve("out-voice-samples");

async function sha256(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function isExpectedFile(path: string, bytes: number, expectedSha256: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  const s = await stat(path);
  if (s.size !== bytes) return false;
  return (await sha256(path)) === expectedSha256;
}

async function ensureModel(): Promise<void> {
  await mkdir(MODEL_DIR, { recursive: true });
  for (const file of SUPERTONIC_MODEL_FILES) {
    const targetPath = join(MODEL_DIR, file.name);
    if (await isExpectedFile(targetPath, file.bytes, file.sha256)) {
      console.log(`[Supertonic] Cached: ${file.name}`);
      continue;
    }
    console.log(`[Supertonic] Downloading: ${file.name} (${(file.bytes / 1024 / 1024).toFixed(1)} MB)...`);
    const res = await fetch(file.url);
    if (!res.ok) throw new Error(`Failed to download ${file.name}: HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const partPath = `${targetPath}.part`;
    await writeFile(partPath, buffer);
    if (!(await isExpectedFile(partPath, file.bytes, file.sha256))) {
      await rm(partPath, { force: true });
      throw new Error(`Integrity check failed for ${file.name}`);
    }
    await rename(partPath, targetPath);
    console.log(`[Supertonic] Verified: ${file.name}`);
  }
}

function wavHeader(pcmByteLength: number, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmByteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcmByteLength, 40);
  return header;
}

async function main() {
  await ensureModel();
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Loading sherpa-onnx addon from ${ADDON_PATH}...`);
  const addonModule = { exports: {} as any };
  process.dlopen(addonModule, ADDON_PATH);
  const addon = addonModule.exports;

  const file = (name: string) => join(MODEL_DIR, name);
  const config = {
    model: {
      supertonic: {
        durationPredictor: file("duration_predictor.int8.onnx"),
        textEncoder: file("text_encoder.int8.onnx"),
        vectorEstimator: file("vector_estimator.int8.onnx"),
        vocoder: file("vocoder.int8.onnx"),
        ttsJson: file("tts.json"),
        unicodeIndexer: file("unicode_indexer.bin"),
        voiceStyle: file("voice.bin"),
      },
      numThreads: 4,
      provider: "cpu",
      debug: 0,
    },
    maxNumSentences: 1,
  };

  console.log("Creating offline TTS engine with Supertonic 3...");
  const tts = await addon.createOfflineTtsAsync(config);

  const samples = [
    {
      name: "supertonic-female-f1",
      sid: 0, // F1
      text: "Hello! I am Element Agents. Your autonomous multi-agent assistant is now ready on mobile and desktop.",
    },
    {
      name: "supertonic-male-m1",
      sid: 5, // M1
      text: "Hello! I am Element Agents. Your autonomous multi-agent assistant is now ready on mobile and desktop.",
    },
  ];

  for (const s of samples) {
    console.log(`Synthesizing ${s.name} (speaker ID ${s.sid})...`);
    const audio = await addon.offlineTtsGenerateAsyncWithConfig(tts, {
      text: s.text,
      generationConfig: {
        sid: s.sid,
        speed: 1.0,
        numSteps: 8,
        extra: { lang: "en" },
      },
      enableExternalBuffer: false,
    });

    const samplesFloat = audio.samples as Float32Array;
    const sampleRate = audio.sampleRate as number;
    const int16 = new Int16Array(samplesFloat.length);
    for (let i = 0; i < samplesFloat.length; i++) {
      const sample = Math.max(-1, Math.min(1, samplesFloat[i] ?? 0));
      int16[i] = Math.round(sample < 0 ? sample * 32768 : sample * 32767);
    }

    const pcmBuf = Buffer.from(int16.buffer);
    const wavBuf = Buffer.concat([wavHeader(pcmBuf.length, sampleRate), pcmBuf]);

    const wavPath = join(OUTPUT_DIR, `${s.name}.wav`);
    const mp3Path = join(OUTPUT_DIR, `${s.name}.mp3`);

    await writeFile(wavPath, wavBuf);
    console.log(`Saved WAV: ${wavPath}`);

    console.log(`Converting ${wavPath} to ${mp3Path} via ffmpeg...`);
    execSync(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`, { stdio: "inherit" });
    console.log(`Success: Generated ${mp3Path}`);
  }

  console.log("All samples generated successfully in:", OUTPUT_DIR);
}

main().catch((err) => {
  console.error("Error generating voice samples:", err);
  process.exit(1);
});
