/* =========================================================
   MAX Data Analysis — motion + synthetic scientific graphics
   No dependencies. Respects prefers-reduced-motion.

   IMPORTANT: every visual here is procedurally generated and
   ILLUSTRATIVE. None of it is real experimental data, and every
   component that renders one is labelled as such in the markup.
   ========================================================= */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var C = {
    dapi: "#3D7DFF", fitc: "#24C98A", tritc: "#F0499B",
    amber: "#FFB020", violet: "#8B5CF6", cyan: "#22D3EE"
  };

  /* ---------- seeded RNG so before/after always match ---------- */
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function gauss(r) {
    var u = 1 - r(), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function field(ctx, w, h, seed, tintA, tintB) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#050912"); g.addColorStop(1, "#0B1226");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var r = rng(seed + 991);
    ctx.globalAlpha = 0.5;
    for (var i = 0; i < Math.round(w * h / 900); i++) {
      ctx.fillStyle = r() > 0.5 ? (tintA || "rgba(61,125,255,0.16)") : (tintB || "rgba(36,201,138,0.11)");
      ctx.beginPath(); ctx.arc(r() * w, r() * h, r() * 1.5, 0, 6.284); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function badge(ctx, w, h, label, value, color) {
    var bw = 132, bh = 50;
    ctx.save();
    ctx.fillStyle = "rgba(5,9,18,0.74)";
    ctx.fillRect(w - bw - 12, h - bh - 12, bw, bh);
    ctx.strokeStyle = hexA(color, 0.5);
    ctx.strokeRect(w - bw - 12, h - bh - 12, bw, bh);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 8px Inter, sans-serif";
    ctx.fillText(label, w - bw - 4, h - bh + 4);
    ctx.fillStyle = color;
    ctx.font = "600 22px Fraunces, Georgia, serif";
    ctx.fillText(value, w - bw - 4, h - 22);
    ctx.restore();
  }

  /* =========================================================
     VISUAL GENERATORS — one per analysis domain
     Each: fn(ctx, w, h, seed, analysed)
     ========================================================= */
  var VIS = {};

  /* ---- 1. Microscopy / imaging ---- */
  VIS.microscopy = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed);
    var r = rng(seed), cells = [], tries = 0, n = Math.round(w * h / 4600);
    while (cells.length < n && tries < n * 60) {
      tries++;
      var rad = 10 + r() * 14, x = rad + r() * (w - rad * 2), y = rad + r() * (h - rad * 2), ok = true;
      for (var i = 0; i < cells.length; i++) {
        var dx = cells[i].x - x, dy = cells[i].y - y;
        if (Math.sqrt(dx * dx + dy * dy) < (cells[i].r + rad) * 0.86) { ok = false; break; }
      }
      if (ok) cells.push({ x: x, y: y, r: rad, sq: 0.78 + r() * 0.42, rot: r() * Math.PI, b: 0.55 + r() * 0.45 });
    }
    cells.forEach(function (c) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, c.sq);
      var a = c.b * (on ? 0.55 : 1);
      var g = ctx.createRadialGradient(0, 0, c.r * 0.1, 0, 0, c.r);
      g.addColorStop(0, "rgba(150,195,255," + 0.92 * a + ")");
      g.addColorStop(0.45, "rgba(61,125,255," + 0.62 * a + ")");
      g.addColorStop(1, "rgba(30,70,180,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, c.r, 0, 6.284); ctx.fill(); ctx.restore();
    });
    if (on) {
      cells.forEach(function (c, i) {
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, c.sq);
        ctx.strokeStyle = C.fitc; ctx.lineWidth = 2;
        ctx.shadowColor = hexA(C.fitc, 0.85); ctx.shadowBlur = 9;
        ctx.beginPath(); ctx.arc(0, 0, c.r * 1.14, 0, 6.284); ctx.stroke(); ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "600 9px Inter, sans-serif";
        ctx.fillText(i + 1, c.x + c.r * 1.1, c.y - c.r * 0.9);
      });
      badge(ctx, w, h, "OBJECTS DETECTED", String(cells.length), C.fitc);
    }
  };

  /* ---- 2. Flow cytometry ---- */
  VIS.cytometry = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed, "rgba(139,92,246,0.14)", "rgba(34,211,238,0.10)");
    var pad = 34, pw = w - pad * 2, ph = h - pad * 2;
    // axes
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + ph); ctx.lineTo(pad + pw, pad + ph); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "600 8px Inter, sans-serif";
    ctx.fillText("FSC-A", pad + pw - 34, pad + ph + 14);
    ctx.save(); ctx.translate(pad - 12, pad + 34); ctx.rotate(-Math.PI / 2); ctx.fillText("SSC-A", 0, 0); ctx.restore();

    var r = rng(seed);
    var pops = [
      { cx: 0.32, cy: 0.62, sx: 0.09, sy: 0.10, n: 520, col: C.cyan, name: "Lymphocytes", pct: "41.2%" },
      { cx: 0.62, cy: 0.36, sx: 0.11, sy: 0.09, n: 380, col: C.violet, name: "Monocytes", pct: "28.7%" },
      { cx: 0.78, cy: 0.72, sx: 0.07, sy: 0.07, n: 210, col: C.tritc, name: "Granulocytes", pct: "16.4%" }
    ];
    pops.forEach(function (p) {
      for (var i = 0; i < p.n; i++) {
        var x = pad + (p.cx + gauss(r) * p.sx) * pw;
        var y = pad + (p.cy + gauss(r) * p.sy) * ph;
        if (x < pad || x > pad + pw || y < pad || y > pad + ph) continue;
        ctx.fillStyle = on ? hexA(p.col, 0.75) : "rgba(180,200,235,0.42)";
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, 6.284); ctx.fill();
      }
    });
    // debris
    for (var j = 0; j < 260; j++) {
      ctx.fillStyle = "rgba(150,170,210,0.22)";
      ctx.beginPath(); ctx.arc(pad + r() * pw, pad + r() * ph, 1.2, 0, 6.284); ctx.fill();
    }
    if (on) {
      pops.forEach(function (p) {
        ctx.strokeStyle = p.col; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
        ctx.shadowColor = hexA(p.col, 0.7); ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(pad + p.cx * pw, pad + p.cy * ph, p.sx * pw * 2.1, p.sy * ph * 2.1, 0, 0, 6.284);
        ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff"; ctx.font = "600 9px Inter, sans-serif";
        ctx.fillText(p.name + "  " + p.pct, pad + p.cx * pw - 28, pad + p.cy * ph - p.sy * ph * 2.1 - 6);
      });
      badge(ctx, w, h, "GATES APPLIED", "3", C.violet);
    }
  };

  /* ---- 3. Plate-based assays ---- */
  VIS.plate = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed, "rgba(255,176,32,0.12)", "rgba(61,125,255,0.10)");
    var cols = 12, rows = 8, pad = 30;
    var cw = (w - pad * 2) / cols, ch = Math.min((h - pad * 2 - 40) / rows, cw);
    var r = rng(seed);
    var vals = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var base = Math.exp(-Math.pow((x - 5.5) / 4.2, 2)) * (0.35 + y / rows * 0.55);
      vals.push(Math.max(0, Math.min(1, base + (r() - 0.5) * 0.22)));
    }
    for (var i = 0; i < vals.length; i++) {
      var cx = pad + (i % cols) * cw + cw / 2, cy = pad + Math.floor(i / cols) * ch + ch / 2;
      var v = vals[i];
      if (on) {
        var col = v < 0.5
          ? "rgba(" + Math.round(61 + v * 2 * 0) + "," + Math.round(125 + v * 2 * 76) + "," + Math.round(255 - v * 2 * 117) + ",0.9)"
          : "rgba(" + Math.round(36 + (v - 0.5) * 2 * 219) + "," + Math.round(201 - (v - 0.5) * 2 * 25) + "," + Math.round(138 - (v - 0.5) * 2 * 106) + ",0.9)";
        ctx.fillStyle = col;
      } else {
        ctx.fillStyle = "rgba(170,190,225," + (0.20 + v * 0.30) + ")";
      }
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(cw, ch) * 0.36, 0, 6.284); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.stroke();
    }
    if (on) {
      // fitted dose-response curve inset
      var gx = pad, gy = h - 52, gw = w - pad * 2 - 150, gh = 34;
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
      ctx.shadowColor = hexA(C.amber, 0.7); ctx.shadowBlur = 8;
      ctx.beginPath();
      for (var p = 0; p <= gw; p++) {
        var t = p / gw, yv = 1 / (1 + Math.exp(-(t - 0.5) * 11));
        var py = gy + gh - yv * gh;
        p === 0 ? ctx.moveTo(gx + p, py) : ctx.lineTo(gx + p, py);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "600 8px Inter, sans-serif";
      ctx.fillText("FITTED DOSE–RESPONSE", gx, gy - 4);
      badge(ctx, w, h, "PLATES NORMALISED", "96", C.amber);
    }
  };

  /* ---- 4. Movement / behaviour tracking ---- */
  VIS.tracking = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed, "rgba(240,73,155,0.12)", "rgba(139,92,246,0.10)");
    var pad = 26;
    ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 1.4;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
    var r = rng(seed), pts = [], x = w / 2, y = h / 2, vx = 0, vy = 0;
    for (var i = 0; i < 460; i++) {
      vx = vx * 0.86 + (r() - 0.5) * 3.4; vy = vy * 0.86 + (r() - 0.5) * 3.4;
      x += vx; y += vy;
      if (x < pad + 8 || x > w - pad - 8) { vx *= -1; x = Math.max(pad + 8, Math.min(w - pad - 8, x)); }
      if (y < pad + 8 || y > h - pad - 8) { vy *= -1; y = Math.max(pad + 8, Math.min(h - pad - 8, y)); }
      pts.push({ x: x, y: y });
    }
    if (!on) {
      pts.forEach(function (p) {
        ctx.fillStyle = "rgba(180,200,235,0.35)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 6.284); ctx.fill();
      });
    } else {
      // zone
      ctx.strokeStyle = hexA(C.tritc, 0.55); ctx.setLineDash([5, 4]);
      ctx.strokeRect(w * 0.55, h * 0.18, w * 0.32, h * 0.34); ctx.setLineDash([]);
      ctx.fillStyle = hexA(C.tritc, 0.08); ctx.fillRect(w * 0.55, h * 0.18, w * 0.32, h * 0.34);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "600 8px Inter, sans-serif";
      ctx.fillText("ZONE A", w * 0.55 + 5, h * 0.18 + 13);
      // trail with velocity colour
      for (var k = 1; k < pts.length; k++) {
        var sp = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
        ctx.strokeStyle = sp > 3 ? hexA(C.tritc, 0.85) : hexA(C.violet, 0.6);
        ctx.lineWidth = 1.8; ctx.beginPath();
        ctx.moveTo(pts[k - 1].x, pts[k - 1].y); ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke();
      }
      ctx.fillStyle = C.fitc; ctx.beginPath();
      ctx.arc(pts[pts.length - 1].x, pts[pts.length - 1].y, 4, 0, 6.284); ctx.fill();
      badge(ctx, w, h, "PATH LENGTH", "12.4 m", C.tritc);
    }
  };

  /* ---- 5. Electrophysiology / time-series ---- */
  VIS.signal = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed, "rgba(34,211,238,0.12)", "rgba(36,201,138,0.10)");
    var r = rng(seed), lanes = 4, pad = 24;
    var lh = (h - pad * 2) / lanes;
    var spikes = 0;
    for (var L = 0; L < lanes; L++) {
      var base = pad + lh * L + lh / 2;
      var evts = [];
      for (var e = 0; e < 5 + Math.floor(r() * 5); e++) evts.push(pad + r() * (w - pad * 2));
      ctx.strokeStyle = on ? hexA(C.cyan, 0.9) : "rgba(180,200,235,0.5)";
      ctx.lineWidth = 1.3; ctx.beginPath();
      for (var px = pad; px < w - pad; px++) {
        var v = (r() - 0.5) * 3.2;
        evts.forEach(function (ex) {
          var d = px - ex;
          if (d > -3 && d < 12) v -= Math.exp(-Math.pow(d - 2, 2) / 5) * lh * 0.38;
        });
        var py = base + v;
        px === pad ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      if (on) {
        evts.forEach(function (ex) {
          spikes++;
          ctx.fillStyle = C.fitc;
          ctx.beginPath();
          ctx.moveTo(ex + 2, base - lh * 0.44);
          ctx.lineTo(ex - 3, base - lh * 0.32);
          ctx.lineTo(ex + 7, base - lh * 0.32);
          ctx.closePath(); ctx.fill();
        });
        ctx.fillStyle = "rgba(255,255,255,0.42)"; ctx.font = "600 8px Inter, sans-serif";
        ctx.fillText("CH " + (L + 1), pad + 2, base - lh * 0.36);
      }
    }
    if (on) badge(ctx, w, h, "EVENTS DETECTED", String(spikes), C.fitc);
  };

  /* ---- 6. Ecology / field data ---- */
  VIS.ecology = function (ctx, w, h, seed, on) {
    field(ctx, w, h, seed, "rgba(36,201,138,0.14)", "rgba(255,176,32,0.10)");
    var pad = 34, pw = w - pad * 2, ph = h - pad * 2;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + ph); ctx.lineTo(pad + pw, pad + ph); ctx.stroke();
    var r = rng(seed), pts = [];
    for (var i = 0; i < 130; i++) {
      var t = r();
      var val = 0.22 + t * 0.55 + gauss(r) * 0.12;
      pts.push({ x: pad + t * pw, y: pad + ph - Math.max(0.02, Math.min(0.98, val)) * ph });
    }
    pts.forEach(function (p) {
      ctx.fillStyle = on ? hexA(C.fitc, 0.7) : "rgba(180,200,235,0.4)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.284); ctx.fill();
    });
    if (on) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2.4;
      ctx.shadowColor = hexA(C.amber, 0.6); ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.moveTo(pad, pad + ph - 0.22 * ph);
      ctx.lineTo(pad + pw, pad + ph - 0.77 * ph);
      ctx.stroke(); ctx.shadowBlur = 0;
      // confidence band
      ctx.fillStyle = hexA(C.amber, 0.12);
      ctx.beginPath();
      ctx.moveTo(pad, pad + ph - 0.14 * ph);
      ctx.lineTo(pad + pw, pad + ph - 0.69 * ph);
      ctx.lineTo(pad + pw, pad + ph - 0.85 * ph);
      ctx.lineTo(pad, pad + ph - 0.30 * ph);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "600 8px Inter, sans-serif";
      ctx.fillText("FITTED TREND + 95% BAND", pad + 4, pad + 12);
      badge(ctx, w, h, "RECORDS CLEANED", "1,480", C.fitc);
    }
  };

  function draw(type, ctx, w, h, seed, on) {
    (VIS[type] || VIS.microscopy)(ctx, w, h, seed, on);
  }

  /* =========================================================
     Static single-visual canvases  [data-viz type mode seed]
     ========================================================= */
  function initViz() {
    document.querySelectorAll("[data-viz]").forEach(function (el) {
      var type = el.getAttribute("data-viz");
      var seed = parseInt(el.getAttribute("data-seed") || "42", 10);
      var on = el.getAttribute("data-mode") !== "raw";
      var cv = el.querySelector("canvas") || el.appendChild(document.createElement("canvas"));
      var ctx = cv.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      function render() {
        var rect = el.getBoundingClientRect();
        var W = Math.max(240, rect.width), H = Math.max(160, rect.height);
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw(type, ctx, W, H, seed, on);
      }
      render();
      window.addEventListener("resize", function () { clearTimeout(el._t); el._t = setTimeout(render, 200); });
    });
  }

  /* =========================================================
     Before / after drag sliders  [data-ba data-type data-seed]
     ========================================================= */
  function initSliders() {
    document.querySelectorAll("[data-ba]").forEach(function (el) {
      var type = el.getAttribute("data-type") || "microscopy";
      var seed = parseInt(el.getAttribute("data-seed") || "42", 10);
      var before = el.querySelector("canvas.before"), after = el.querySelector("canvas.after");
      var wrapAfter = el.querySelector(".after-wrap"), handle = el.querySelector(".ba-handle"), knob = el.querySelector(".ba-knob");
      if (!before || !after) return;
      var bc = before.getContext("2d"), ac = after.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      function render() {
        var rect = el.getBoundingClientRect();
        var W = Math.max(280, rect.width), H = Math.max(180, rect.height);
        [before, after].forEach(function (cv) {
          cv.width = W * dpr; cv.height = H * dpr;
          cv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        draw(type, bc, W, H, seed, false);
        draw(type, ac, W, H, seed, true);
      }
      render();
      window.addEventListener("resize", function () { clearTimeout(el._t); el._t = setTimeout(render, 200); });

      function setPos(p) {
        p = Math.max(0, Math.min(100, p));
        wrapAfter.style.clipPath = "inset(0 0 0 " + p + "%)";
        handle.style.left = p + "%"; knob.style.left = p + "%";
      }
      setPos(50);
      var dragging = false;
      function from(e) {
        var rect = el.getBoundingClientRect();
        setPos(((e.clientX - rect.left) / rect.width) * 100);
      }
      el.addEventListener("pointerdown", function (e) { dragging = true; el.setPointerCapture(e.pointerId); from(e); });
      el.addEventListener("pointermove", function (e) { if (dragging) from(e); });
      el.addEventListener("pointerup", function () { dragging = false; });
      el.addEventListener("pointercancel", function () { dragging = false; });
    });
  }

  /* =========================================================
     HERO — animated detect-and-count loop
     ========================================================= */
  function initHero() {
    var wrap = document.querySelector("[data-scope]");
    if (!wrap) return;
    var canvas = wrap.querySelector("canvas"), countEl = wrap.querySelector("[data-scope-count]");
    if (!canvas) return;
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cells = [];

    function build() {
      var rect = wrap.getBoundingClientRect();
      W = Math.max(320, rect.width); H = Math.max(240, rect.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var r = rng(20260811), t = 0, n = Math.round(W * H / 5200);
      cells = [];
      while (cells.length < n && t < n * 60) {
        t++;
        var rad = 11 + r() * 15, x = rad + r() * (W - rad * 2), y = rad + r() * (H - rad * 2), ok = true;
        for (var i = 0; i < cells.length; i++) {
          var dx = cells[i].x - x, dy = cells[i].y - y;
          if (Math.sqrt(dx * dx + dy * dy) < (cells[i].r + rad) * 0.86) { ok = false; break; }
        }
        if (ok) cells.push({ x: x, y: y, r: rad, sq: 0.78 + r() * 0.42, rot: r() * Math.PI, b: 0.55 + r() * 0.45, ph: r() * 6.28 });
      }
    }
    build();
    window.addEventListener("resize", function () { clearTimeout(wrap._t); wrap._t = setTimeout(build, 200); });

    function cell(c, t) {
      var pulse = 1 + Math.sin(t * 0.0012 + c.ph) * 0.035;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, c.sq);
      var rad = c.r * pulse, g = ctx.createRadialGradient(0, 0, rad * 0.1, 0, 0, rad);
      g.addColorStop(0, "rgba(150,195,255," + 0.92 * c.b + ")");
      g.addColorStop(0.45, "rgba(61,125,255," + 0.62 * c.b + ")");
      g.addColorStop(1, "rgba(30,70,180,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 6.284); ctx.fill(); ctx.restore();
    }
    function outline(c, p, label) {
      if (p <= 0) return;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, c.sq);
      ctx.strokeStyle = hexA(C.fitc, Math.min(1, p)); ctx.lineWidth = 2;
      ctx.shadowColor = hexA(C.fitc, 0.85); ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(0, 0, c.r * 1.14, -1.5708, -1.5708 + 6.284 * Math.min(1, p)); ctx.stroke(); ctx.restore();
      if (label != null && p >= 1) {
        ctx.fillStyle = "rgba(255,255,255,0.72)"; ctx.font = "600 9px Inter, sans-serif";
        ctx.fillText(label, c.x + c.r * 1.1, c.y - c.r * 0.9);
      }
    }

    if (REDUCED) {
      field(ctx, W, H, 7); cells.forEach(function (c) { cell(c, 0); });
      cells.forEach(function (c, i) { outline(c, 1, i + 1); });
      if (countEl) countEl.textContent = cells.length;
      return;
    }

    var CYCLE = 9000, start = null, raf = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = (ts - start) % CYCLE, PER = CYCLE * 0.62 / Math.max(1, cells.length);
      field(ctx, W, H, 7);
      cells.forEach(function (c) { cell(c, ts); });
      var det = 0, fading = t > CYCLE * 0.86;
      cells.forEach(function (c, i) {
        var p = Math.max(0, Math.min(1, (t - CYCLE * 0.12 - i * PER) / 420));
        if (fading) p *= Math.max(0, 1 - (t - CYCLE * 0.86) / (CYCLE * 0.14));
        if (p >= 1) det++;
        outline(c, p, p >= 1 ? i + 1 : null);
      });
      if (t > CYCLE * 0.08 && t < CYCLE * 0.72) {
        var sy = ((t - CYCLE * 0.08) / (CYCLE * 0.64)) * H;
        var lg = ctx.createLinearGradient(0, sy - 26, 0, sy + 26);
        lg.addColorStop(0, "rgba(36,201,138,0)");
        lg.addColorStop(0.5, "rgba(36,201,138,0.30)");
        lg.addColorStop(1, "rgba(36,201,138,0)");
        ctx.fillStyle = lg; ctx.fillRect(0, sy - 26, W, 52);
      }
      if (countEl) countEl.textContent = det;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
          else if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0.05 }).observe(wrap);
    }
  }

  /* =========================================================
     HORIZONTAL CAROUSEL — drag, arrows, progress
     ========================================================= */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var track = root.querySelector(".carousel-track");
      var prev = root.querySelector("[data-car-prev]");
      var next = root.querySelector("[data-car-next]");
      var bar = root.querySelector(".carousel-bar span");
      if (!track) return;

      function step() {
        var first = track.querySelector(".carousel-item");
        return first ? first.getBoundingClientRect().width + 22 : 340;
      }
      if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: REDUCED ? "auto" : "smooth" }); });
      if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: REDUCED ? "auto" : "smooth" }); });

      track.addEventListener("scroll", function () {
        if (!bar) return;
        var max = track.scrollWidth - track.clientWidth;
        bar.style.width = (max > 0 ? (track.scrollLeft / max) * 100 : 100) + "%";
        if (prev) prev.disabled = track.scrollLeft < 4;
        if (next) next.disabled = track.scrollLeft >= max - 4;
      }, { passive: true });

      // pointer drag to scroll
      var down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener("pointerdown", function (e) {
        if (e.target.closest("a,button")) return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
        track.classList.add("dragging");
      });
      track.addEventListener("pointermove", function (e) {
        if (!down) return;
        var d = e.clientX - sx;
        if (Math.abs(d) > 3) moved = true;
        track.scrollLeft = sl - d;
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
        track.addEventListener(ev, function () { down = false; track.classList.remove("dragging"); });
      });
      track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
      track.dispatchEvent(new Event("scroll"));
    });
  }

  /* =========================================================
     CAPABILITY ARC — big nodes on a circle centred off the left
     edge, so only ~3 are visible at once. Turns on page scroll
     and on drag; click a node to read more.
     ========================================================= */
  function initWheel() {
    var root = document.querySelector("[data-wheel]");
    if (!root) return;
    var stage = root.querySelector(".wheel");
    var nodes = Array.prototype.slice.call(root.querySelectorAll(".wheel-node"));
    var titleEl = root.querySelector("[data-wheel-title]");
    var descEl = root.querySelector("[data-wheel-desc]");
    var tagEl = root.querySelector("[data-wheel-tag]");
    var countEl = root.querySelector("[data-wheel-count]");
    if (!stage || !nodes.length) return;

    var n = nodes.length;
    var STEP = 360 / n;          // angular spacing
    var WINDOW = 55;             // ± degrees still visible → exactly 3 of 8 nodes
    var scrollAngle = 0, dragAngle = 0, active = -1, moved = false;

    function total() { return scrollAngle + dragAngle; }

    // signed smallest difference to the focus direction (0° = straight right)
    function delta(i) {
      var a = i * STEP + total();
      a = ((a + 180) % 360 + 360) % 360 - 180;
      return a;
    }

    function layout() {
      var rect = stage.getBoundingClientRect();
      // Clamp the radius so the topmost and bottommost visible nodes stay
      // inside the stage — otherwise a node can ride up over the sticky header.
      var nodeR = (nodes[0].offsetWidth || 152) / 2;
      var maxByHeight = (rect.height / 2 - nodeR - 10) / Math.sin(WINDOW * Math.PI / 180);
      var R = Math.max(200, Math.min(rect.width * 0.95, maxByHeight));
      var cy = rect.height / 2;
      nodes.forEach(function (el, i) {
        var d = delta(i);
        var rad = d * Math.PI / 180;
        var x = Math.cos(rad) * R;
        var y = cy + Math.sin(rad) * R;
        var t = Math.min(1, Math.abs(d) / WINDOW);
        var vis = Math.abs(d) < WINDOW;
        var scale = 1 - t * 0.3;
        el.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(3) + ")";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.opacity = vis ? (1 - t * 0.85).toFixed(3) : "0";
        el.style.pointerEvents = vis && t < 0.9 ? "auto" : "none";
        el.style.zIndex = String(Math.round(100 - Math.abs(d)));
      });
      var near = nearestIndex();
      paint(near, near === active);
    }

    function nearestIndex() {
      var best = 0, bd = 1e9;
      for (var i = 0; i < n; i++) {
        var d = Math.abs(delta(i));
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }

    function paint(i, isActive) {
      nodes.forEach(function (el, j) {
        el.classList.toggle("active", isActive && j === i);
        el.classList.toggle("near", !isActive && j === i);
      });
      var el = nodes[i];
      if (titleEl) titleEl.textContent = el.getAttribute("data-title") || "";
      if (tagEl) tagEl.textContent = el.getAttribute("data-tag") || "";
      if (descEl) descEl.textContent = el.getAttribute("data-desc") || "";
      if (countEl) countEl.textContent = (i + 1) + " / " + n;
      var col = el.getAttribute("data-color");
      if (col) root.style.setProperty("--wheel-accent", col);
    }

    // tween dragAngle toward a target so arrow clicks rotate the whole
    // arc smoothly, in the direction the arrow points
    var targetDrag = null, raf = null;
    function tick() {
      if (targetDrag === null) { raf = null; return; }
      var diff = targetDrag - dragAngle;
      if (Math.abs(diff) < 0.15) { dragAngle = targetDrag; targetDrag = null; layout(); raf = null; return; }
      dragAngle += diff * 0.16;
      layout();
      raf = requestAnimationFrame(tick);
    }
    function tweenTo(a) {
      targetDrag = a;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function select(i, dir) {
      i = ((i % n) + n) % n;
      active = i;
      var want = -(i * STEP) - scrollAngle;
      if (dir) {
        // force the rotation to travel in the requested direction
        while (dir > 0 && want > dragAngle) want -= 360;
        while (dir < 0 && want < dragAngle) want += 360;
      } else {
        // otherwise take the shortest path
        while (want - dragAngle > 180) want -= 360;
        while (want - dragAngle < -180) want += 360;
      }
      if (REDUCED) { dragAngle = want; layout(); paint(i, true); }
      else { tweenTo(want); paint(i, true); }
    }

    nodes.forEach(function (el, i) {
      el.addEventListener("click", function () { if (!moved) select(i); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); }
      });
    });

    var prev = root.querySelector("[data-wheel-prev]"), next = root.querySelector("[data-wheel-next]");
    if (prev) prev.addEventListener("click", function () { select((active < 0 ? nearestIndex() : active) - 1, -1); });
    if (next) next.addEventListener("click", function () { select((active < 0 ? nearestIndex() : active) + 1, +1); });

    /* --- drag to turn --- */
    var down = false, startY = 0, startDrag = 0;
    stage.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a,button")) return;
      down = true; moved = false; targetDrag = null;
      startY = e.clientY + e.clientX; startDrag = dragAngle;
      stage.classList.add("grabbing");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var d = (e.clientY + e.clientX) - startY;
      if (Math.abs(d) > 3) moved = true;
      dragAngle = startDrag + d * 0.22;
      active = -1;
      layout();
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false; stage.classList.remove("grabbing");
      if (moved) select(nearestIndex());
      setTimeout(function () { moved = false; }, 30);
    });

    /* --- page scroll turns it too --- */
    if (!REDUCED) {
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var rect = root.getBoundingClientRect();
          var vh = window.innerHeight;
          if (rect.bottom > 0 && rect.top < vh) {
            // progress of the section through the viewport, -1 .. 1
            var p = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
            scrollAngle = p * STEP * 2.2;
            if (active < 0) layout();
            else layout();
          }
          ticking = false;
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    window.addEventListener("resize", layout);
    select(0);
  }

  /* =========================================================
     Scroll reveal + kinetic text + counters + header
     ========================================================= */
  function initReveal() {
    var revealEls = document.querySelectorAll("[data-reveal]");
    var kinetics = document.querySelectorAll(".kinetic");
    kinetics.forEach(function (k) {
      if (k._split) return;
      k._split = true;
      var words = k.textContent.trim().split(/\s+/);
      k.textContent = "";
      words.forEach(function (w, i) {
        var s = document.createElement("span");
        s.className = "word"; s.style.setProperty("--i", i); s.textContent = w;
        k.appendChild(s);
        if (i < words.length - 1) k.appendChild(document.createTextNode(" "));
      });
    });
    if (REDUCED || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (e) { e.classList.add("in"); });
      kinetics.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) { el.classList.add("in"); el.classList.remove("out"); }
        else if (e.boundingClientRect.top < 0) { el.classList.add("out"); el.classList.remove("in"); }
        else { el.classList.remove("in", "out"); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (e) { io.observe(e); });
    kinetics.forEach(function (e) { io.observe(e); });
  }

  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || e.target._done) return;
        e.target._done = true;
        var el = e.target, target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "", t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1400), eased = 1 - Math.pow(1 - p, 3), v = target * eased;
          el.textContent = (target % 1 === 0 ? Math.round(v) : v.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initHeader() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { h.classList.toggle("scrolled", window.scrollY > 8); tick = false; });
    }, { passive: true });
  }

  /* =========================================================
     Pain checklist — tick what applies, live tally and message
     ========================================================= */
  function initPainCheck() {
    var list = document.querySelector("[data-pain]");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".pain-item"));
    var tally = document.querySelector("[data-pain-tally]");
    var countEl = document.querySelector("[data-pain-count]");
    var msgEl = document.querySelector("[data-pain-msg]");
    if (!items.length) return;

    var MSG = [
      "Tick the ones that apply, we'll tell you what that usually means.",
      "Even one of these is usually worth a 15-minute conversation. Most are a few days of work to remove for good.",
      "Two or more is the pattern we see most often. A short call will tell you quickly whether a tool would pay for itself.",
      "That's a lot of manual work carrying real risk to your results. This is exactly the situation we build for, worth booking a call."
    ];

    function update() {
      var n = items.filter(function (el) { return el.classList.contains("checked"); }).length;
      if (countEl) countEl.textContent = n === 0 ? "Nothing ticked yet" : n + " of " + items.length + " selected";
      if (msgEl) msgEl.textContent = MSG[Math.min(3, n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3)];
      if (tally) {
        tally.classList.toggle("warm", n >= 1 && n <= 3);
        tally.classList.toggle("hot", n >= 4);
      }
    }

    items.forEach(function (el) {
      el.setAttribute("role", "button");
      el.setAttribute("aria-pressed", "false");
      el.addEventListener("click", function () {
        var on = el.classList.toggle("checked");
        el.setAttribute("aria-pressed", on ? "true" : "false");
        update();
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });
    update();
  }

  /* =========================================================
     Pinned horizontal scroll — the section holds while the
     panels travel left to right, then releases.
     ========================================================= */
  function initHScroll() {
    document.querySelectorAll("[data-hscroll]").forEach(function (section) {
      var viewport = section.querySelector(".hscroll-viewport");
      var track = section.querySelector(".hscroll-track");
      var bar = section.querySelector(".hscroll-progress span");
      if (!viewport || !track) return;

      var inner = section.querySelector(".hscroll-inner");
      if (!inner) return;

      // Defensive: any ancestor with overflow hidden/auto/scroll becomes the
      // scroll container for a position:sticky child, which silently stops it
      // pinning. Clear it on the way up so a future CSS change can't break this.
      for (var p = inner.parentElement; p && p !== document.body; p = p.parentElement) {
        var ov = window.getComputedStyle(p).overflow;
        if (ov && ov !== "visible" && ov !== "clip") p.style.overflow = "visible";
      }

      var mobile = function () { return window.matchMedia("(max-width: 900px)").matches; };
      var distance = 0, headerH = 72, panelH = 0;

      function measure() {
        if (mobile() || REDUCED) {
          section.style.height = "";
          track.style.transform = "";
          if (bar) bar.style.width = "100%";
          return;
        }
        var hdr = document.querySelector(".site-header");
        headerH = hdr ? hdr.getBoundingClientRect().height : 72;
        panelH = inner ? inner.getBoundingClientRect().height : (window.innerHeight - headerH);

        // full width of the track minus what's already visible
        distance = Math.max(0, track.scrollWidth - viewport.clientWidth);

        // the section must be tall enough to hold the panel on screen for
        // the entire horizontal journey: one panel height + the travel
        section.style.height = (panelH + distance) + "px";
        update();
      }

      function update() {
        if (mobile() || REDUCED) return;
        var rect = section.getBoundingClientRect();
        // pinning begins when the section top reaches the bottom of the header
        var travelled = Math.min(Math.max(headerH - rect.top, 0), distance);
        var p = distance > 0 ? travelled / distance : 1;
        track.style.transform = "translate3d(" + (-travelled) + "px,0,0)";
        if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
      }

      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
      }, { passive: true });
      window.addEventListener("resize", function () {
        clearTimeout(section._t);
        section._t = setTimeout(measure, 180);
      });
      // re-measure once fonts and canvases have settled, or the travel
      // distance is computed from the wrong track width
      setTimeout(measure, 60);
      window.addEventListener("load", measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      measure();
    });
  }

  /* =========================================================
     Vertical timeline — steps appear and the rail fills
     ========================================================= */
  function initVTimeline() {
    var vtl = document.querySelector(".vtl");
    if (!vtl) return;
    var steps = Array.prototype.slice.call(vtl.querySelectorAll(".vtl-step"));
    var rail = vtl.querySelector(".vtl-rail span");

    if (REDUCED || !("IntersectionObserver" in window)) {
      steps.forEach(function (s) { s.classList.add("in"); });
      if (rail) rail.style.height = "100%";
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -12% 0px" });
    steps.forEach(function (s) { io.observe(s); });

    if (rail) {
      var ticking = false;
      function fill() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var r = vtl.getBoundingClientRect();
          var vh = window.innerHeight;
          var p = (vh * 0.75 - r.top) / r.height;
          rail.style.height = (Math.min(1, Math.max(0, p)) * 100).toFixed(1) + "%";
          ticking = false;
        });
      }
      window.addEventListener("scroll", fill, { passive: true });
      fill();
    }
  }

  function boot() {
    initHeader(); initReveal(); initCounters();
    initHero(); initViz(); initSliders(); initCarousels(); initWheel();
    initPainCheck(); initHScroll(); initVTimeline();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
