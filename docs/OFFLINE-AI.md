# Offline AI model: research spike (AI-7, 13 Nov 2026)

**Status: research only. Nothing was built and nothing here was measured by us.** Every number below comes from a third-party page or paper found on 13 Nov 2026 (links at the end). We have no phone or GPU in the sandbox, so the first job of any build is to measure on the user's own devices.

## Verdict

- **Laptop (WebGPU): realistic.** A 4-bit model of 0.3 to 1 GB downloads once and runs at usable speed. The best quality-per-megabyte for maths is **Qwen2.5-1.5B-Instruct (about 1 GB at 4-bit)**, with Llama 3.2 1B (695 MB) as the weaker, smaller option.
- **Mid-range Android: possible but marginal.** One 1.5B model at 4-bit is about 940 MB and ran at 16.5 tokens/s on a 2020 Snapdragon 865 phone (GPU path) and 7.8 tokens/s on CPU only. Needs 4 GB+ RAM. No number exists for a true 2024-26 mid-range chip (Snapdragon 6/7 series, Dimensity 7000/8000); we must measure.
- **Accuracy is the real limit, not size.** A 1.5B model solves roughly 7 in 10 grade-school word problems and about half of harder competition-style problems. Expect wrong answers presented confidently. It is a "good enough to study with, check the result" fallback, not a replacement for Gemini.
- So the 1.5 GB limit is **met** (nothing needed is above about 1 GB), and the spike does not stop on size. It should stop at the next gate below unless the user wants it.

## What can run

| Model (4-bit) | Download | Memory while running | Where |
|---|---|---|---|
| Gemma 3 270M | about 300 MB (Q8) | about 500 MB GPU | WebGPU; too weak for maths |
| Qwen3 0.6B | 335 MB | about 1.4 GB VRAM (WebLLM figure) | WebGPU |
| Llama 3.2 1B Instruct | 695 MB | about 880 MB | WebGPU (WebLLM), llama.cpp |
| Gemma 3 1B (QAT int4) | 529 MB (LiteRT); about 1 GB (Q8 web build) | 4 GB device RAM recommended | Android (MediaPipe/LiteRT-LM), WebGPU |
| Qwen2.5-1.5B-Instruct | about 940 MB (GGUF 4-bit) | about 2 GB | llama.cpp on Android; WebLLM has a build |
| Qwen3.5 2B | 1.06 GB | about 2.2 GB VRAM | WebGPU; fits the limit but heavy for phones |

Browser notes: WebGPU needs HTTPS (the Android app serves from `https://localhost`, which counts as a secure context, but **WebGPU inside the Capacitor WebView is unverified**; Chrome itself has WebGPU on Android 12+ from v121). Weights are cached after the first download. The WebLLM runtime has no CPU fallback; transformers.js falls back to slow WASM.

## Speed (decode, tokens per second)

| Device | Model | Speed | Source |
|---|---|---|---|
| Mac mini M4 Pro, Chrome, WebGPU | Gemma 3 1B Q8 | 59.8 (first token 0.28 s) | webgpu-gemma README |
| Mac M3 Pro, WebLLM | Llama 3.2 1B | 66.8 | pinggy.io test |
| iPhone 17 Pro Max, Safari | Gemma 3 1B | 34.4 | webgpu-gemma README |
| Recent integrated-GPU laptop, WebLLM | Qwen2.5 0.5B | 20 to 60 (blog estimate, not a measurement table) | tinyweights.dev |
| RTX 4050 laptop | Qwen2.5 1.5B 4-bit | 131.7 | arXiv 2603.23640 |
| Galaxy S20 FE (Snapdragon 865, 2020) | Qwen2.5-Coder 1.5B 4-bit | 16.5 GPU / 7.8 CPU | Hugging Face model card |
| Galaxy S24 Ultra | Gemma 3 1B int4 | prefill up to 2585; decode not in the text we could read | Google AI Edge blog |

A worked answer for "solve 2x + 5 = 17" is about 150 to 300 tokens. At 16 tokens/s that is 10 to 20 seconds on an older phone; at 60 tokens/s on a laptop, 3 to 5 seconds. Models that "think" first (Qwen3) wrote about 550 thinking tokens for a one-line question, which would triple those times, so use non-thinking mode.

Phones also slow down when hot: one paper reports 10 to 20% loss over five consecutive runs on flagships.

## Accuracy for school maths

No benchmark is "Indian school maths". GSM8K (grade-school word problems) and MATH500 (harder, high-school competition) are the usual proxies. Full-precision, step-by-step prompting, from arXiv 2504.14350 unless noted:

| Model | GSM8K | MATH500 |
|---|---|---|
| Qwen2.5-Math-1.5B (maths-only model) | 85.0 | 74.0 |
| Qwen2.5-1.5B-Instruct | 73.9 | 53.0 |
| Llama 3.2 1B | 48.8 (Meta reports 44.4) | 26.6 (Meta 30.6) |
| Llama 3.2 3B | 76.2 | 48.6 |
| SmolLM2 1.7B-Instruct | 48.8 | 21.0 (SmolLM2 paper) |
| Gemma 3 1B | not found in a source we trust | not found |

Caveats that matter:
- 4-bit quantisation costs some accuracy; we found no per-model figure, so assume a few points lower.
- Results swing a lot with the prompt: one 8-shot study scored Qwen2.5-1.5B base at 36% on GSM8K and Llama 3.2 1B at 29%. Our own prompts and our own test set will decide.
- **Qwen2.5-Math-1.5B is the best maths number at this size, but it only knows maths, is a base size of 1.5B (about the same download), and answers in its own format.** Worth testing; chemistry, physics and language questions would still need a general model or the online AI.
- Benchmarks are English. Hindi/Telugu/Urdu questions will be worse; Qwen is the strongest small multilingual family, but nobody published maths accuracy in those languages for these sizes.

## Recommended next step (needs the user's go-ahead, so nothing built yet)

1. **Measure before building.** A throwaway page (WebLLM, Qwen2.5-1.5B-Instruct q4 and Llama 3.2 1B) that runs 30 fixed school questions (linear and quadratic equations, simultaneous equations, percentages, trigonometry, derivatives, basic physics numericals), prints tokens/s, first-token time and the number correct. The user opens it on their laptop and on their phone in Chrome and pastes the output. About half a day.
2. **Decide the gate:** build only if the phone result is at most about 20 s per worked answer and at least 60% correct on that set. Otherwise stop, and keep offline support as it is today (cached answers, saved queue, local summaries and flashcards).
3. If it passes: laptop/PWA first via WebLLM behind a "Download offline model (about 1 GB)" button, off by default, Wi-Fi-only warning, delete button, answers labelled "offline model, check this". Android native (llama.cpp or LiteRT-LM plugin) only after a phone test, because it adds a native dependency and APK complexity.
4. Cheaper alternative to weigh: the app already bundles `mathjs`; a local solver for plain equations and arithmetic would be exact and instant, with no model at all, and could handle the commonest offline maths questions.

## Sources (all read 13 Nov 2026)

- github.com/svenflow/webgpu-gemma (Gemma 3 1B and 270M WebGPU benchmarks, M4 Pro and iPhone)
- pinggy.io/blog/run_llm_in_browser_webgpu (model sizes and memory, 66.8 tokens/s on M3 Pro)
- tinyweights.dev/posts/run-llm-in-browser-webllm (sizes, laptop speed ranges)
- developers.googleblog.com, "Gemma 3 on mobile and web with Google AI Edge" (529 MB, 4 GB RAM advice, S24 Ultra)
- huggingface.co/dispatchAI/Qwen2.5-Coder-1.5B-mobile (940 MB, 16.5 / 7.8 tokens/s on Snapdragon 865)
- arxiv.org/abs/2603.23640 (Qwen2.5 1.5B on S24 Ultra, iPhone 16 Pro, RTX 4050; thermal loss)
- arxiv.org/abs/2504.14350 (GSM8K and MATH500 table), arxiv.org/abs/2308.09583 (Llama 3.2 1B reference scores), arxiv.org/abs/2511.09700 (8-shot spread)
- alphaxiv.org/overview/2502.02737v1 (SmolLM2 maths scores)
