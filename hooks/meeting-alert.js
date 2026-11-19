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
      ".meeting-alert{border:4px solid #ff6fb1;border-radius:28px;padding:28px 32px;max-width:440px;width:calc(100% - 32px);" +
      "background:#fff;color:#2b2250;font-family:'Fredoka','Nunito',system-ui,sans-serif;text-align:center;" +
      "box-shadow:0 24px 60px rgba(91,52,196,.4)}" +
      ".meeting-alert::backdrop{background:rgba(43,34,80,.55);backdrop-filter:blur(4px)}" +
      ".meeting-alert[open]{animation:meetingPop .35s cubic-bezier(.2,.9,.3,1.3)}" +
      "@keyframes meetingPop{from{opacity:0;transform:perspective(800px) rotateX(-30deg) scale(.9)}to{opacity:1;transform:none}}" +
      ".meeting-alert h2{margin:0 0 8px;font-size:1.7rem;color:#5b34c4}" +
      ".meeting-alert p{margin:6px 0;font-size:1.1rem;line-height:1.45}" +
      ".meeting-alert strong{color:#d6307f}" +
      ".meeting-alert button{margin-top:18px;min-height:44px;padding:8px 32px;border:0;border-radius:999px;cursor:pointer;" +
      "font:inherit;font-weight:600;color:#fff;background:linear-gradient(135deg,#ff6fb1,#8b5cf6);box-shadow:0 6px 0 #5b34c4}" +
      ".meeting-alert button:active{transform:translateY(4px);box-shadow:0 2px 0 #5b34c4}" +
      ".meeting-alert button:focus-visible{outline:3px solid #8b5cf6;outline-offset:3px}" +
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
    var ok = document.createElement("button"); ok.type = "button"; ok.textContent = "Got it!";

    ok.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("close", function () { dlg.remove(); });
    [h, p, date, ok].forEach(function (n) { dlg.appendChild(n); });
    document.body.appendChild(dlg);

    markShown();
    dlg.showModal();
    ok.focus();
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
