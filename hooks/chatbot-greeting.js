/* Chatbot greeting hook
 * When the visitor clicks the chatbot avatar to open it, speak a voice message:
 *   "I am your IT assistant, how can i help you?"
 * Uses the browser's built-in speech synthesis (no audio files, no network).
 * Works with the launcher button that has the attribute  data-chatbot-launcher
 * and reports its open state through  aria-expanded.
 */
(function () {
  "use strict";

  var CONFIG = {
    message: "I am your IT assistant, how can I help you?",
    rate: 0.95,
    pitch: 1.2,       // a slightly higher voice suits the cute avatar
    volume: 1,
    selector: "[data-chatbot-launcher]"
  };

  var supported = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";

  function pickVoice() {
    // Prefer a friendly English voice if the browser has one; otherwise use the default.
    try {
      var voices = window.speechSynthesis.getVoices() || [];
      var english = voices.filter(function (v) { return /^en/i.test(v.lang); });
      var friendly = english.filter(function (v) { return /(female|zira|samantha|aria|jenny|google uk english female|natural)/i.test(v.name); });
      return friendly[0] || english[0] || null;
    } catch (e) { return null; }
  }

  function speak() {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(CONFIG.message);
      u.rate = CONFIG.rate; u.pitch = CONFIG.pitch; u.volume = CONFIG.volume;
      var voice = pickVoice();
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-US"; }
      window.speechSynthesis.speak(u);
    } catch (e) { /* voice is a nice-to-have; the chat works without it */ }
  }

  function stop() {
    try { if (supported) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  // Delegated listener: runs after the chatbot's own click handler has toggled aria-expanded.
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest(CONFIG.selector);
    if (!btn) return;
    if (btn.getAttribute("aria-expanded") === "true") speak(); else stop();
  });

  // Some browsers load voices asynchronously; ask for them early so the first click can use one.
  if (supported && typeof window.speechSynthesis.getVoices === "function") window.speechSynthesis.getVoices();

  window.ChatbotGreetingHook = { speak: speak, stop: stop, message: CONFIG.message };
})();
