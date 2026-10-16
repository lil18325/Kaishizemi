/* ============================================================
   メインロジック（ネタバレあり版）
   ============================================================ */

   const $ = id => document.getElementById(id);
   const N = CHARAS.length;
   let currentIdx = 0;
   
   /* ---------- 0. ローディング画面 ---------- */
   window.addEventListener("load", () => {
     const loader = $("loading-screen");
     if (loader) {
       setTimeout(() => {
         loader.classList.add("is-loaded");
   
         setTimeout(() => {
           const heroLogo = document.querySelector(".hero-logo-wrap");
           if (heroLogo) {
             heroLogo.classList.add("is-visible");
           }
         }, 800);
   
       }, 1000);
     }
   });
   
   /* ---------- 1. ハンバーガーメニュー ---------- */
   const menuBtn = $("menu-btn");
   const fullNav = $("full-nav");
   
   menuBtn.onclick = () => {
     const isOpen = menuBtn.classList.toggle("is-active");
     fullNav.hidden = !isOpen;
   };
   
   document.querySelectorAll(".nav-link").forEach(link => {
     link.onclick = () => {
       menuBtn.classList.remove("is-active");
       fullNav.hidden = true;
     };
   });
   
   /* ---------- 2. キャラクターグリッド生成 ---------- */
   function buildCharaGrid(targetElId) {
     const ul = $(targetElId);
     if (!ul) return;
     ul.innerHTML = "";
   
     CHARAS.forEach(c => {
       const li = document.createElement("li");
       
       const zoom = c.thumbZoom || 200;
       const x = c.thumbX !== undefined ? c.thumbX : -50;
       const y = c.thumbY !== undefined ? c.thumbY : -20;
   
       li.innerHTML = `
         <div class="chara-card" onclick="location.hash='#chara-${c.id}'">
           <div class="chara-thumb-oval">
             <img src="${c.fullImg}" alt="${c.name}" style="width: ${zoom}%; left: ${x}%; top: ${y}%;" onerror="this.src='images/icon.webp'">
           </div>
           <span class="chara-name">${c.shortName}</span>
         </div>`;
       ul.appendChild(li);
     });
   }
   
   buildCharaGrid("chara-grid");
   buildCharaGrid("others-grid");
   
   /* ---------- 3. エンドカード一覧生成 ---------- */
   function buildEndCardList(targetElId = "endcard-grid") {
     const ul = $(targetElId);
     if (!ul) return;
     ul.innerHTML = "";
   
     END_CARDS.forEach(e => {
       const li = document.createElement("li");
       li.className = "endcard-item";
       li.textContent = e.title;
       li.onclick = () => { location.hash = `#end-${e.id}`; };
       ul.appendChild(li);
     });
   }
   
   buildEndCardList("endcard-grid");
   buildEndCardList("others-end-grid");
   
   /* ---------- 4. キャラ詳細の描画 ---------- */
   function renderDetail(charaId) {
     const idx = CHARAS.findIndex(item => item.id === charaId);
     currentIdx = idx >= 0 ? idx : 0;
     const c = CHARAS[currentIdx];
   
     // セリフ枠
     const quoteEl = $("vertical-quote");
     quoteEl.innerHTML = "";
     const lines = (c.quote || "").split("\n");
     lines.forEach(line => {
       const span = document.createElement("span");
       span.className = "quote-line";
       span.textContent = line;
       if (c.quoteBg) {
         const isHex6 = c.quoteBg.startsWith("#") && c.quoteBg.length === 7;
         span.style.backgroundColor = isHex6 ? c.quoteBg + "d9" : c.quoteBg;
       }
       quoteEl.appendChild(span);
     });
   
     // 背景アイコン & 立ち絵
     const topColor = c.bgTop || "#d1bad9";
     const bottomColor = c.bgBottom || "#6e5f98";
   
     const artEl = $("art");
     artEl.innerHTML = `
       <div class="chara-bg-icon" style="background: linear-gradient(to bottom, ${topColor}, ${bottomColor});" aria-hidden="true"></div>
       <img src="${c.fullImg}" class="chara-main-img" id="chara-main-img" alt="${c.name}">
       ${c.demonImg ? `
         <button class="demon-toggle-btn" id="demon-toggle-btn" aria-label="天使姿に切り替え">
           <svg class="demon-diamond-icon" viewBox="0 0 24 24"><path d="M12 2 C12 8 8 12 2 12 C8 12 12 16 12 22 C12 16 16 12 22 12 C16 12 12 8 12 2 Z"/></svg>
           <span class="demon-toggle-label">TAP</span>
         </button>
       ` : ''}
     `;
   
     const mainImg = $("chara-main-img");
     if (mainImg) {
       if (mainImg.complete) {
         mainImg.classList.add("float-anim");
       } else {
         mainImg.onload = () => mainImg.classList.add("float-anim");
       }
     }
   
     // 姿切り替えボタン動作（初期表示：悪魔姿 ➔ TAP：天使姿）
     if (c.demonImg) {
       const toggleBtn = $("demon-toggle-btn");
       let isAngel = false;
   
       const quoteLines = quoteEl.querySelectorAll(".quote-line");
       quoteLines.forEach(span => {
         span.style.color = "#1a1622";
       });
   
       if (toggleBtn && mainImg) {
         toggleBtn.onclick = () => {
           isAngel = !isAngel;
           mainImg.src = isAngel ? c.demonImg : c.fullImg;
           toggleBtn.classList.toggle("is-active", isAngel);
   
           quoteLines.forEach(span => {
             span.style.color = isAngel ? "#ffffff" : "#1a1622";
           });
         };
       }
     }
   
     // キャラ情報
     $("chara-info").innerHTML = `
       <h3 class="detail-chara-name">${c.name}</h3>
       <span class="detail-chara-kana">${c.kana || ''}</span>
       <p class="detail-chara-desc">${c.desc}</p>
     `;
   }
   
   /* ---------- 5. 左右ボタン & スワイプ切り替え（キャラ詳細） ---------- */
   function stepChara(dir) {
     const nextIdx = (currentIdx + dir + N) % N;
     location.hash = `#chara-${CHARAS[nextIdx].id}`;
   }
   
   $("prev-btn").onclick = () => stepChara(-1);
   $("next-btn").onclick = () => stepChara(1);
   
   let touchStartX = 0;
   let touchStartY = 0;
   const stageEl = $("stage");
   
   stageEl.addEventListener("touchstart", e => {
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
   }, { passive: true });
   
   stageEl.addEventListener("touchend", e => {
     const dx = e.changedTouches[0].clientX - touchStartX;
     const dy = e.changedTouches[0].clientY - touchStartY;
   
     if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
       stepChara(dx < 0 ? 1 : -1);
     }
   }, { passive: true });
   
   /* ---------- 6. エンドカード詳細の描画 ---------- */
   let currentEndIdx = 0;
   
   function renderEndDetail(endId) {
     const idx = END_CARDS.findIndex(item => item.id === Number(endId));
     currentEndIdx = idx >= 0 ? idx : 0;
     const e = END_CARDS[currentEndIdx];
   
     const container = $("end-detail-content");
   
     container.innerHTML = `
       <h2 class="end-title">${e.title}</h2>
       <p class="end-text">${e.text}</p>
       <img class="end-img" src="${e.img}" alt="${e.title}" onerror="this.style.display='none'">
     `;
   
     buildEndCardList("others-end-grid");
   }
   
   function stepEndCard(dir) {
     const M = END_CARDS.length;
     const nextIdx = (currentEndIdx + dir + M) % M;
     location.hash = `#end-${END_CARDS[nextIdx].id}`;
   }
   
   const endPrevBtn = $("end-prev-btn");
   const endNextBtn = $("end-next-btn");
   if (endPrevBtn) endPrevBtn.onclick = () => stepEndCard(-1);
   if (endNextBtn) endNextBtn.onclick = () => stepEndCard(1);
   
   const endStageEl = document.querySelector(".end-card-stage");
   if (endStageEl) {
     let endTouchStartX = 0;
     let endTouchStartY = 0;
   
     endStageEl.addEventListener("touchstart", e => {
       endTouchStartX = e.touches[0].clientX;
       endTouchStartY = e.touches[0].clientY;
     }, { passive: true });
   
     endStageEl.addEventListener("touchend", e => {
       const dx = e.changedTouches[0].clientX - endTouchStartX;
       const dy = e.changedTouches[0].clientY - endTouchStartY;
   
       if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
         stepEndCard(dx < 0 ? 1 : -1);
       }
     }, { passive: true });
   }
   
   /* ---------- 7. ルーティング ---------- */
   function route() {
     const hash = location.hash;
     const topPage = $("top");
     const detailPage = $("detail");
     const endDetailPage = $("end-detail");
   
     topPage.hidden = true;
     detailPage.hidden = true;
     endDetailPage.hidden = true;
   
     if (hash.startsWith("#chara-") && hash !== "#chara-sec") {
       const charaId = hash.replace("#chara-", "");
       detailPage.hidden = false;
       renderDetail(charaId);
       window.scrollTo(0, 0);
     } else if (hash.startsWith("#end-")) {
       const endId = hash.replace("#end-", "");
       endDetailPage.hidden = false;
       renderEndDetail(endId);
       window.scrollTo(0, 0);
     } else {
       topPage.hidden = false;
       if (hash === "#intro-sec" || hash === "#chara-sec" || hash === "#endcard-sec") {
         const target = $(hash.replace("#", ""));
         if (target) {
           setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 50);
         }
       } else {
         window.scrollTo(0, 0);
       }
     }
   }
   
   addEventListener("hashchange", route);
   route();
   
   /* ---------- 8. スクロール監視（ヘッダー制御） ---------- */
   const header = document.querySelector(".fixed-header");
   const topHero = document.querySelector(".top-hero");
   
   function handleScrollEffects() {
     const hash = location.hash;
     const isTopPage = !hash || hash === "#top" || hash === "#intro-sec" || hash === "#chara-sec" || hash === "#endcard-sec";
     const menuBtn = $("menu-btn");
   
     if (menuBtn && menuBtn.classList.contains("is-active")) {
       header.classList.remove("is-hidden");
       return;
     }
   
     if (isTopPage && topHero) {
       const heroBottom = topHero.getBoundingClientRect().bottom;
       if (heroBottom > 100) {
         header.classList.add("is-hidden");
       } else {
         header.classList.remove("is-hidden");
       }
     } else {
       header.classList.remove("is-hidden");
     }
   }
   
   window.addEventListener("scroll", handleScrollEffects, { passive: true });
   window.addEventListener("hashchange", handleScrollEffects);
   window.addEventListener("load", handleScrollEffects);
