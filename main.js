/* ============================================================
   Franklin Kuo — Engineering Portfolio
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- wordmark: stagger index per character ---------- */
  document.querySelectorAll('.wordmark__line').forEach(function (line) {
    line.querySelectorAll('.ch').forEach(function (ch, i) {
      ch.style.setProperty('--i', i);
    });
  });

  /* ---------- nav + scroll progress ---------- */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('scrollBar');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- scroll reveals (staggered within a group) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('main [data-reveal], .statband [data-reveal]'));

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > [data-reveal]'));
        var idx = Math.max(0, sibs.indexOf(el));
        el.style.setProperty('--d', Math.min(idx, 6) * 90 + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var suffix = el.dataset.suffix || '';
    if (reduced) {
      el.textContent = target.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      return;
    }
    var dur = 1900, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var v = target * eased;
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- alignment SVG: draw the fitted path ---------- */
  var alignSvg = document.querySelector('.alignsvg');
  var alignPath = document.getElementById('alignPath');
  var alignPts = document.getElementById('alignPts');

  if (alignSvg && alignPath && alignPts) {
    // scatter survey points along the fitted path, with realistic small error
    var total = alignPath.getTotalLength();
    alignPath.style.setProperty('--len', total.toFixed(1));

    var NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i <= 74; i++) {
      var pt = alignPath.getPointAtLength((i / 74) * total);
      // deterministic pseudo-jitter so it looks surveyed, not random each load
      var j = Math.sin(i * 12.9898) * 43758.5453;
      var jx = ((j - Math.floor(j)) - 0.5) * 5.2;
      var k = Math.sin(i * 78.233) * 43758.5453;
      var jy = ((k - Math.floor(k)) - 0.5) * 5.2;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', (pt.x + jx).toFixed(2));
      c.setAttribute('cy', (pt.y + jy).toFixed(2));
      c.setAttribute('r', '1.5');
      c.style.transitionDelay = (i * 11) + 'ms';
      alignPts.appendChild(c);
    }

    if ('IntersectionObserver' in window) {
      var aio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { alignSvg.classList.add('is-live'); aio.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      aio.observe(alignSvg);
    } else {
      alignSvg.classList.add('is-live');
    }
  }

  /* ---------- hero background grid ---------- */
  var grid = document.getElementById('heroGrid');
  if (grid && !reduced) {
    var gx = grid.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeGrid() {
      W = grid.clientWidth; H = grid.clientHeight;
      grid.width = W * dpr; grid.height = H * dpr;
      gx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeGrid();
    window.addEventListener('resize', sizeGrid);

    var t = 0;
    var mx = 0.5, my = 0.5;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    }, { passive: true });

    // a slow perspective grid receding to a horizon — reads as "engineering space"
    function drawGrid() {
      gx.clearRect(0, 0, W, H);
      var horizon = H * 0.58;
      var cx = W * (0.5 + (mx - 0.5) * 0.06);

      gx.lineWidth = 1;

      // radiating verticals
      for (var i = -22; i <= 22; i++) {
        var sx = cx + i * (W / 12);
        gx.beginPath();
        gx.moveTo(cx + i * 22, horizon);
        gx.lineTo(sx, H);
        var a = 0.055 * (1 - Math.abs(i) / 24);
        gx.strokeStyle = 'rgba(120,190,255,' + Math.max(a, 0).toFixed(3) + ')';
        gx.stroke();
      }

      // receding horizontals, scrolling toward the viewer
      for (var r = 0; r < 26; r++) {
        var f = ((r + (t * 0.06) % 1) / 26);
        var yy = horizon + Math.pow(f, 2.35) * (H - horizon);
        if (yy > H) continue;
        gx.beginPath();
        gx.moveTo(0, yy);
        gx.lineTo(W, yy);
        gx.strokeStyle = 'rgba(120,190,255,' + (0.075 * f).toFixed(3) + ')';
        gx.stroke();
      }

      // horizon glow
      var g = gx.createLinearGradient(0, horizon - 60, 0, horizon + 4);
      g.addColorStop(0, 'rgba(79,195,255,0)');
      g.addColorStop(1, 'rgba(79,195,255,.16)');
      gx.fillStyle = g;
      gx.fillRect(0, horizon - 60, W, 62);

      t += 1;
      requestAnimationFrame(drawGrid);
    }
    drawGrid();
  }

  /* ============================================================
     OCELL — binary STL viewer
     ============================================================ */
  function b64ToArrayBuffer(b64) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  // Parse a binary STL into flat position + normal arrays.
  function parseBinarySTL(buffer) {
    var dv = new DataView(buffer);
    var tris = dv.getUint32(80, true);
    var positions = new Float32Array(tris * 9);
    var normals = new Float32Array(tris * 9);

    for (var i = 0; i < tris; i++) {
      var off = 84 + i * 50;
      var nx = dv.getFloat32(off, true);
      var ny = dv.getFloat32(off + 4, true);
      var nz = dv.getFloat32(off + 8, true);
      for (var v = 0; v < 3; v++) {
        var vo = off + 12 + v * 12;
        var p = i * 9 + v * 3;
        positions[p]     = dv.getFloat32(vo, true);
        positions[p + 1] = dv.getFloat32(vo + 4, true);
        positions[p + 2] = dv.getFloat32(vo + 8, true);
        normals[p] = nx; normals[p + 1] = ny; normals[p + 2] = nz;
      }
    }
    return { positions: positions, normals: normals, count: tris };
  }

  function initViewer() {
    var canvas = document.getElementById('ocellCanvas');
    var host = document.getElementById('viewer');
    var loading = document.getElementById('viewerLoading');
    var toggle = document.getElementById('wireToggle');

    if (!canvas || !host) return;
    if (typeof THREE === 'undefined' || !window.OCELL_STL_B64) {
      if (loading) loading.textContent = 'GEOMETRY UNAVAILABLE';
      return;
    }

    var data;
    try {
      data = parseBinarySTL(b64ToArrayBuffer(window.OCELL_STL_B64));
    } catch (err) {
      if (loading) loading.textContent = 'GEOMETRY PARSE ERROR';
      return;
    }

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20000);

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
    geo.computeBoundingBox();

    // centre the part on the origin
    var bb = geo.boundingBox;
    var cx = (bb.min.x + bb.max.x) / 2;
    var cy = (bb.min.y + bb.max.y) / 2;
    var cz = (bb.min.z + bb.max.z) / 2;
    geo.translate(-cx, -cy, -cz);

    var sx = bb.max.x - bb.min.x;
    var sy = bb.max.y - bb.min.y;
    var sz = bb.max.z - bb.min.z;
    var radius = Math.sqrt(sx * sx + sy * sy + sz * sz) / 2;

    var mat = new THREE.MeshPhongMaterial({
      color: 0x8fa6bb,
      specular: 0x2f4a63,
      shininess: 26,
      flatShading: true,
      side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geo, mat);
    // STL Z-up → screen Y-up
    mesh.rotation.x = -Math.PI / 2;

    var pivot = new THREE.Group();
    pivot.add(mesh);
    scene.add(pivot);

    // wireframe overlay
    var wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x4fc3ff, transparent: true, opacity: 0.16 })
    );
    wire.rotation.x = -Math.PI / 2;
    wire.visible = false;
    pivot.add(wire);

    // lighting: key, fill, and a cyan rim
    scene.add(new THREE.AmbientLight(0x2a3546, 1.0));
    var key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(1, 1.1, 0.85);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0x4fc3ff, 0.55);
    fill.position.set(-1, 0.25, -0.6);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0x6ee7ff, 0.75);
    rim.position.set(-0.4, -0.8, -1);
    scene.add(rim);

    // Frame the bounding sphere so the part never clips, at any rotation or aspect.
    var fovRad = camera.fov * Math.PI / 180;
    function fitCamera(aspect) {
      var dV = radius / Math.sin(fovRad / 2);
      var hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
      var dH = radius / Math.sin(hFov / 2);
      camera.position.set(0, 0, Math.max(dV, dH) * 1.06);
      camera.lookAt(0, 0, 0);
    }

    function resize() {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      fitCamera(camera.aspect);
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---- drag to rotate ---- */
    var dragging = false, lastX = 0, lastY = 0;
    var velY = 0.0035, targetRotX = 0.05;

    function down(x, y) { dragging = true; lastX = x; lastY = y; velY = 0; }
    function move(x, y) {
      if (!dragging) return;
      var dx = x - lastX, dy = y - lastY;
      pivot.rotation.y += dx * 0.008;
      targetRotX = Math.max(-0.85, Math.min(0.85, targetRotX + dy * 0.005));
      lastX = x; lastY = y;
      velY = dx * 0.0006;
    }
    function up() { dragging = false; if (Math.abs(velY) < 0.0004) velY = 0.0035; }

    host.addEventListener('mousedown', function (e) { down(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
    window.addEventListener('mouseup', up);
    host.addEventListener('touchstart', function (e) {
      down(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    host.addEventListener('touchmove', function (e) {
      move(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    host.addEventListener('touchend', up);

    if (toggle) {
      toggle.addEventListener('click', function () {
        wire.visible = !wire.visible;
        toggle.classList.toggle('is-on', wire.visible);
      });
    }

    /* ---- render loop, paused when off-screen ---- */
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.01 }).observe(host);
    }

    // intro: spin up from an angle
    pivot.rotation.y = -1.1;
    var intro = 0;

    function tick() {
      requestAnimationFrame(tick);
      if (!visible) return;

      if (intro < 1) {
        intro = Math.min(intro + 0.012, 1);
        var e = 1 - Math.pow(1 - intro, 3);
        pivot.rotation.y = -1.1 + e * 1.1;
      } else if (!dragging && !reduced) {
        pivot.rotation.y += velY;
      }

      pivot.rotation.x += (targetRotX - pivot.rotation.x) * 0.08;
      renderer.render(scene, camera);
    }
    tick();

    if (loading) {
      setTimeout(function () { loading.classList.add('is-done'); }, 260);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewer);
  } else {
    initViewer();
  }
})();
