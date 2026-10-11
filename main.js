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

      // ★ ローディング画面が消えた少し後（0.4秒後）にロゴをふわっと自動出現させる
      setTimeout(() => {
        const heroLogo = document.querySelector(".hero-logo-wrap");
        if (heroLogo) {
          heroLogo.classList.add("is-visible");
        }
      }, 800);

    }, 1000); // ローディング文字が見える時間
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
    
    // 設定がない場合のデフォルト初期値（大きさ200%、横-50%、縦-20%）
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

  // トップページと詳細ページ下部の両方で呼び出せるように指定
  buildEndCardList("endcard-grid");
  buildEndCardList("others-end-grid");
   
/* ---------- 4. キャラ詳細の描画 ---------- */
function renderDetail(charaId) {
  const idx = CHARAS.findIndex(item => item.id === charaId);
  currentIdx = idx >= 0 ? idx : 0;
  const c = CHARAS[currentIdx];

  // ① 立ち絵ステージ（.stage）の背景だけに上下グラデーションを適用
  // const stageEl = $("stage");
  // if (stageEl) {
    // const topColor = c.bgTop || "#6e5f98";
    // const bottomColor = c.bgBottom || "#6e5f98";
    // stageEl.style.background = `linear-gradient(to bottom, ${topColor}, ${bottomColor})`;
  // }

  // ① セリフ枠（8桁指定ならそのまま、6桁ならd9を自動付与）
  const quoteEl = $("vertical-quote");
  quoteEl.innerHTML = "";
  const lines = (c.quote || "").split("\n");
  lines.forEach(line => {
    const span = document.createElement("span");
    span.className = "quote-line";
    span.textContent = line;
    if (c.quoteBg) {
      // 6桁（#733e7b）なら d9(85%) を付与。ローベルト等の8桁(#b14447b3)はそのまま70%適用
      const isHex6 = c.quoteBg.startsWith("#") && c.quoteBg.length === 7;
      span.style.backgroundColor = isHex6 ? c.quoteBg + "d9" : c.quoteBg;
    }
    quoteEl.appendChild(span);
  });

 /// ② 背景ロゴ＆立ち絵の描画
 const topColor = c.bgTop || "#d1bad9";
 const bottomColor = c.bgBottom || "#6e5f98";

 const artEl = $("art");
 artEl.innerHTML = `
   <div class="chara-bg-icon" style="background: linear-gradient(to bottom, ${topColor}, ${bottomColor});" aria-hidden="true"></div>
   <img src="${c.fullImg}" class="chara-main-img" id="chara-main-img" alt="${c.name}">
   ${c.demonImg ? `
     <button class="demon-toggle-btn" id="demon-toggle-btn" aria-label="悪魔姿に切り替え">
       <svg class="demon-diamond-icon" viewBox="0 0 24 24"><path d="M12 2 C12 8 8 12 2 12 C8 12 12 16 12 22 C12 16 16 12 22 12 C16 12 12 8 12 2 Z"/></svg>
       <span class="demon-toggle-label">TAP</span>
     </button>
   ` : ''}
 `;

 // ★ 立ち絵画像（#chara-main-img）のアニメーション＆悪魔姿切り替え処理
 const mainImg = $("chara-main-img");
 if (mainImg) {
   if (mainImg.complete) {
     mainImg.classList.add("float-anim");
   } else {
     mainImg.onload = () => mainImg.classList.add("float-anim");
   }
 }

 // ★ 悪魔姿切り替えボタンの動作
 if (c.demonImg) {
  const toggleBtn = $("demon-toggle-btn");
  let isDemon = false;

  if (toggleBtn && mainImg) {
    toggleBtn.onclick = () => {
      isDemon = !isDemon;
      
      // ① 立ち絵画像の切り替え
      mainImg.src = isDemon ? c.demonImg : c.fullImg;
      toggleBtn.classList.toggle("is-active", isDemon);

      // ② セリフの「文字色」だけを切り替え（背景色はそのまま）
      const quoteLines = quoteEl.querySelectorAll(".quote-line");
      quoteLines.forEach(span => {
        span.style.color = isDemon ? "#1a1622" : "#ffffff"; // 悪魔姿：黒 / 通常：白
      });
    };
  }
}

  // ③ キャラ情報
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

        // 横移動が40px以上、かつ縦移動より横移動が大きい場合に発火
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

/* ---------- 8. スクロール監視（ヘッダー制御） ---------- */
const header = document.querySelector(".fixed-header");
const topHero = document.querySelector(".top-hero");

function handleScrollEffects() {
  const hash = location.hash;
  const isTopPage = !hash || hash === "#top" || hash === "#intro-sec" || hash === "#chara-sec" || hash === "#endcard-sec";
  const menuBtn = $("menu-btn");

  // メニューが開いている時はヘッダーを表示
  if (menuBtn && menuBtn.classList.contains("is-active")) {
    header.classList.remove("is-hidden");
    return;
  }

  // ★ ロゴの表示切り替え処理（scrollY > 40）を削除し、固定ヘッダーの制御のみに変更
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

// イベント登録
window.addEventListener("scroll", handleScrollEffects, { passive: true });
window.addEventListener("hashchange", handleScrollEffects);
window.addEventListener("load", handleScrollEffects);
