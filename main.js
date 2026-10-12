/* ============================================================
   メインロジック（事前案内・ネタバレなし版）
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
   
   /* ---------- 3. 審査手順（FLOW）生成 ---------- */
   function buildFlow() {
     const flowList = $("flow-list");
     if (!flowList) return;
     flowList.innerHTML = "";
   
     FLOW_STEPS.forEach(s => {
       const item = document.createElement("div");
       item.className = "flow-step-item";
       item.innerHTML = `
         <div class="flow-step-num">${s.num}</div>
         <div class="flow-step-text">
           <h3>${s.title}</h3>
           <p>${s.desc}</p>
         </div>
       `;
       flowList.appendChild(item);
     });
   }
   buildFlow();
   
   /* ---------- 4. イベント情報（EVENT INFO）生成 ---------- */
   function renderEventInfo() {
    const card = $("event-card");
    if (!card) return;
    card.innerHTML = `
      <div class="event-display">
        <div class="event-date">${EVENT_INFO.date}</div>
        <div class="event-time">${EVENT_INFO.time}</div>
        <div class="event-sub">${EVENT_INFO.location} &nbsp;|&nbsp; ${EVENT_INFO.ticket}</div>
      </div>
    `;
  }
  renderEventInfo();
   
/* ---------- 5. グッズ＆フード情報（GOODS & FOOD）生成 ---------- */
function buildGoodsAndFood() {
  // GOODS の描画（縦3つジグザグ）
  const goodsGrid = $("goods-grid");
  if (goodsGrid && typeof GOODS_DATA !== "undefined") {
    goodsGrid.innerHTML = "";
    GOODS_DATA.forEach(g => {
      const item = document.createElement("div");
      item.className = "goods-item-row";
      item.innerHTML = `
        <div class="goods-img-box">
          <img src="${g.image}" alt="${g.name}" class="goods-thumb-bordered" onerror="this.src='images/icon.webp'">
        </div>
        <div class="goods-detail-text">
          <h4 class="goods-item-name">【${g.name}】</h4>
          ${g.price ? `<span class="goods-item-price">${g.price}</span>` : ''}
          ${g.desc ? `<p class="goods-item-desc">${g.desc}</p>` : ''}
        </div>
      `;
      goodsGrid.appendChild(item);
    });
  }

  // FOOD の描画（画像大きめ・2列横並び）
  const foodGrid = $("food-grid");
  if (foodGrid && typeof FOOD_DATA !== "undefined") {
    foodGrid.innerHTML = "";
    FOOD_DATA.forEach(f => {
      const item = document.createElement("div");
      item.className = "food-card";
      item.innerHTML = `
        <img src="${f.image}" alt="${f.name}" class="food-thumb" onerror="this.src='images/icon.webp'">
        <div class="food-info">
          <h3 class="food-title">${f.name}</h3>
          ${f.price ? `<span class="food-price">${f.price}</span>` : ''}
          ${f.desc ? `<p class="food-desc">${f.desc}</p>` : ''}
        </div>
      `;
      foodGrid.appendChild(item);
    });
  }
}
buildGoodsAndFood();   

   /* ---------- 6. キャラ詳細の描画 ---------- */
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
     `;
   
     const mainImg = $("chara-main-img");
     if (mainImg) {
       if (mainImg.complete) {
         mainImg.classList.add("float-anim");
       } else {
         mainImg.onload = () => mainImg.classList.add("float-anim");
       }
     }
   // ③ キャラ情報
  $("chara-info").innerHTML = `
  <h3 class="detail-chara-name">${c.name}</h3>
  <span class="detail-chara-kana">${c.kana || ''}</span>
  <p class="detail-chara-desc">${c.desc}</p>
`;
   }
   
   /* ---------- 7. 左右ボタン & スワイプ切り替え ---------- */
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
   
/* ---------- 8. ルーティング ---------- */
function route() {
  const hash = location.hash;
  const topPage = $("top");
  const detailPage = $("detail");

  topPage.hidden = true;
  detailPage.hidden = true;

  if (hash.startsWith("#chara-") && hash !== "#chara-sec") {
    const charaId = hash.replace("#chara-", "");
    detailPage.hidden = false;
    renderDetail(charaId);
    window.scrollTo(0, 0);
  } else {
    topPage.hidden = false;
    const targetIds = ["intro-sec", "chara-sec", "flow-sec", "event-sec", "goods-sec", "food-sec"];
    const targetId = hash.replace("#", "");
    if (targetIds.includes(targetId)) {
      const target = $(targetId);
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
   
   /* ---------- 9. スクロール監視（ヘッダー制御） ---------- */
   const header = document.querySelector(".fixed-header");
   const topHero = document.querySelector(".top-hero");
   
   function handleScrollEffects() {
     const hash = location.hash;
     const isTopPage = !hash || hash === "#top" || hash.endsWith("-sec");
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