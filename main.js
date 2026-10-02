/* ============================================================
   メインロジック
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
       }, 1000); // 一文字ずつのアニメーションが見える時間を少し確保
     }
   });
   
  /* ---------- 1. ハンバーガーメニュー ---------- */
    const menuBtn = $("menu-btn");
    const fullNav = $("full-nav");

    menuBtn.onclick = () => {
      const isOpen = menuBtn.classList.toggle("is-active");
      fullNav.hidden = !isOpen;
    };

    // メニューリンクをクリックしたらナビを閉じる（切り替えはroute関数に一任）
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
       li.innerHTML = `
         <div class="chara-card" onclick="location.hash='#chara-${c.id}'">
           <div class="chara-thumb-oval">
             <img src="${c.fullImg}" alt="${c.name}" onerror="this.src='images/icon.webp'">
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

  // トップページと詳細ページ下部の両方で呼び出せるように指定
  buildEndCardList("endcard-grid");
  buildEndCardList("others-end-grid");
   
   /* ---------- 4. キャラ詳細の描画 ---------- */
   function renderDetail(charaId) {
     const idx = CHARAS.findIndex(item => item.id === charaId);
     currentIdx = idx >= 0 ? idx : 0;
     const c = CHARAS[currentIdx];
   
     // 1. セリフを先に描画
     $("vertical-quote").textContent = c.quote || "";
   
     // 2. 立ち絵のアニメーション発火
     const artEl = $("art");
     artEl.innerHTML = `<img src="${c.fullImg}" alt="${c.name}">`;
     artEl.classList.remove("float-anim");
     void artEl.offsetWidth;
     artEl.classList.add("float-anim");
   
     // 3. フルネーム（c.name）を大きく、説明文を配置
     $("chara-info").innerHTML = `
       <h3 class="detail-chara-name">${c.name}</h3>
       <span class="detail-chara-kana">${c.kana || ''}</span>
       <p class="detail-chara-desc">${c.desc}</p>
     `;
   }
   
   /* ---------- 5. 左右ボタン & スワイプ切り替え ---------- */
   function stepChara(dir) {
     const nextIdx = (currentIdx + dir + N) % N;
     location.hash = `#chara-${CHARAS[nextIdx].id}`;
   }
   
   $("prev-btn").onclick = () => stepChara(-1);
   $("next-btn").onclick = () => stepChara(1);
   
   // スワイプ判定
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
   /* ---------- 6. エンドカード詳細の描画 ---------- */
    let currentEndIdx = 0;

    function renderEndDetail(endId) {
      const idx = END_CARDS.findIndex(item => item.id === Number(endId));
      currentEndIdx = idx >= 0 ? idx : 0;
      const e = END_CARDS[currentEndIdx];

      const container = $("end-detail-content");

      // タイトル → 文章 → 画像 の順番で生成
      container.innerHTML = `
        <h2 class="end-title">${e.title}</h2>
        <p class="end-text">${e.text}</p>
        <img class="end-img" src="${e.img}" alt="${e.title}" onerror="this.style.display='none'">
      `;

      // 下部一覧の更新
      buildEndCardList("others-end-grid");
    }

    /* 左右ボタン操作 */
    function stepEndCard(dir) {
      const M = END_CARDS.length;
      const nextIdx = (currentEndIdx + dir + M) % M;
      location.hash = `#end-${END_CARDS[nextIdx].id}`;
    }

    const endPrevBtn = $("end-prev-btn");
    const endNextBtn = $("end-next-btn");
    if (endPrevBtn) endPrevBtn.onclick = () => stepEndCard(-1);
    if (endNextBtn) endNextBtn.onclick = () => stepEndCard(1);
   
   /* ---------- 7. ルーティング ---------- */
function route() {
  const hash = location.hash;
  const topPage = $("top");
  const detailPage = $("detail");
  const endDetailPage = $("end-detail");

  topPage.hidden = true;
  detailPage.hidden = true;
  endDetailPage.hidden = true;

  // ★ #chara-sec 以外の #chara-xxx をキャラ詳細ページとして判定する
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