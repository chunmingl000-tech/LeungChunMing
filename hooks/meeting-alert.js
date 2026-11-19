/* Meeting alert hook
 * After the visitor has spent more than 10 seconds on the page, show a popup dialog:
 *   "IT meeting next Wednesday 10:01am, room 999"
 * Self-contained: injects its own styles and dialog. Shown once per browser session.
 * Change the values below to update the message.
 */
(function () {
  "use strict";

  var CONFIG = {
    delayMs: 10000,           // visit time before the popup appears (10 seconds)
    weekday: 3,               // 0 = Sunday ... 3 = Wednesday
    time: "10:01am",
    room: "room 999",
    title: "IT meeting",
    speech: "Reminder. I T meeting next Wednesday at ten oh one A M, in room nine nine nine.",
    storageKey: "itMeetingAlertShown"
  };

  function nextWeekday(from, weekday) {
    var d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var add = (weekday - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + (add === 0 ? 7 : add)); // always the upcoming one, never today
    return d;
  }

  function alreadyShown() {
    try { return sessionStorage.getItem(CONFIG.storageKey) === "1"; } catch (e) { return false; }
  }
  function markShown() {
    try { sessionStorage.setItem(CONFIG.storageKey, "1"); } catch (e) { /* storage may be blocked */ }
  }

  function injectStyles() {
    var s = document.createElement("style");
    s.textContent =
      ".meeting-alert{border:1px solid #c3ccd9;border-top:4px solid #2563eb;border-radius:12px;padding:24px 28px;max-width:440px;width:calc(100% - 32px);" +
      "background:#fff;color:#111c2d;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-align:left;" +
      "box-shadow:0 20px 50px rgba(15,39,66,.35)}" +
      ".meeting-alert::backdrop{background:rgba(15,39,66,.55)}" +
      ".meeting-alert[open]{animation:meetingPop .2s ease-out}" +
      "@keyframes meetingPop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
      ".meeting-alert h2{margin:0 0 8px;font-size:1.25rem;color:#0f2742}" +
      ".meeting-alert p{margin:6px 0;font-size:1rem;line-height:1.5}" +
      ".meeting-alert strong{color:#1d4ed8}" +
      ".meeting-alert button{margin-top:16px;min-height:44px;padding:8px 20px;border:1px solid #2563eb;border-radius:8px;cursor:pointer;" +
      "font:inherit;font-weight:600;color:#fff;background:#2563eb}" +
      ".meeting-alert button:hover{background:#1d4ed8}" +
      ".meeting-row{display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap}" +
      ".meeting-alert .meeting-listen{color:#1d4ed8;background:#fff;border-color:#c3ccd9}" +
      ".meeting-alert .meeting-listen:hover{background:#eef1f5}" +
      ".meeting-alert button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}" +
      "@media (prefers-reduced-motion:reduce){.meeting-alert[open]{animation:none}}";
    document.head.appendChild(s);
  }

  function showAlert() {
    if (alreadyShown()) return;
    var when = nextWeekday(new Date(), CONFIG.weekday).toLocaleDateString(undefined, {
      weekday: "long", day: "numeric", month: "long"
    });
    var message = CONFIG.title + " next Wednesday " + CONFIG.time + ", " + CONFIG.room;

    if (typeof HTMLDialogElement === "undefined") { markShown(); window.alert(message); return; }

    injectStyles();
    var dlg = document.createElement("dialog");
    dlg.className = "meeting-alert";
    dlg.setAttribute("role", "alertdialog");
    dlg.setAttribute("aria-labelledby", "meetingAlertTitle");
    dlg.setAttribute("aria-describedby", "meetingAlertText");

    var h = document.createElement("h2"); h.id = "meetingAlertTitle"; h.textContent = "Reminder: " + CONFIG.title;
    var p = document.createElement("p"); p.id = "meetingAlertText";
    var strong = document.createElement("strong"); strong.textContent = "next Wednesday " + CONFIG.time;
    p.appendChild(document.createTextNode(CONFIG.title + " "));
    p.appendChild(strong);
    p.appendChild(document.createTextNode(", " + CONFIG.room + "."));
    var date = document.createElement("p"); date.textContent = when;
    var ok = document.createElement("button"); ok.type = "button"; ok.textContent = "OK";

    var listen = document.createElement("button"); listen.type = "button"; listen.className = "meeting-listen";
    listen.textContent = "Read it aloud";
    listen.addEventListener("click", function () { speak(); });

    ok.addEventListener("click", function () { stopSpeaking(); dlg.close(); });
    dlg.addEventListener("close", function () { stopSpeaking(); dlg.remove(); });
    var row = document.createElement("div"); row.className = "meeting-row";
    row.appendChild(listen); row.appendChild(ok);
    [h, p, date, row].forEach(function (n) { dlg.appendChild(n); });
    if (!("speechSynthesis" in window)) listen.hidden = true;
    document.body.appendChild(dlg);

    markShown();
    dlg.showModal();
    ok.focus();

    // Browsers only allow speech after the visitor has clicked/tapped/typed on the page.
    // If they already have, speak right away; otherwise they can press "Read it aloud".
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) speak();
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(CONFIG.speech);
      u.rate = 0.95; u.pitch = 1.1; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is a nice-to-have */ }
  }
  function stopSpeaking() {
    try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  // Count only time the tab is actually visible.
  var visibleMs = 0, last = null, timer = null;
  function tick() {
    var now = Date.now();
    if (last !== null && !document.hidden) visibleMs += now - last;
    last = now;
    if (visibleMs > CONFIG.delayMs) { clearInterval(timer); showAlert(); }
  }
  function start() { last = Date.now(); timer = setInterval(tick, 500); }
  document.addEventListener("visibilitychange", function () { last = Date.now(); });

  if (alreadyShown()) return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
