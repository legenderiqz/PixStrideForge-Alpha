// --- HTML’den aldığımız elementler ---
const canvas      = document.getElementById("canvas");
const ctx         = canvas.getContext("2d");
const zoomInBtn   = document.getElementById("zoom-in");
const zoomOutBtn  = document.getElementById("zoom-out");
const upBtn       = document.getElementById("up");
const downBtn     = document.getElementById("down");
const leftBtn     = document.getElementById("left");
const rightBtn    = document.getElementById("right");
const colorButton = document.getElementById("color-button");
const colorPalette= document.getElementById("color-palette");
const puanDiv     = document.getElementById("puan")

// --- Sabitler ---
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const GRID_CELLS    = 64;   // 64x64 hücre
const CELL_SIZE     = 20;    // hücre başına dünya pikselleri
const MAX_ZOOM      = 4;
const MIN_ZOOM      = 0.2;
const ZOOM_FACTOR   = 1.2;
const MOVE_SPEED    = 10;   // kamera hız

// --- Durum değişkenleri ---
let puan = 100;
let zoomLevel = 1;
let offsetX   = 0;
let offsetY   = 0;
let pixels    = {};  // { "gx,gy": color }
let moveInt   = null;
let zoomInt = null;
let cooldown  = null;
let mUp       = false;
let mDown     = false;
let mLeft     = false;
let mRight    = false;
let paletteOpen = false; // başta kapalı olsun

// --- Renkler ---
const colors = [
  "#000000", "#ffffff", "#ff0000",
  "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#800000",
  "#008000", "#000080", "#808000",
  "#800080", "#008080", "#c0c0c0",
  "#808080"
  // ... pixelplanet.fun renkleri devam eder
];

let selectedColor = colors[0];

//renk seçim butonu stili
colorButton.style.backgroundColor = selectedColor;

window.onload = () => {
  loadGame();
  startCooldown();
  draw();
};

window.onbeforeunload = () => {
  saveGame();
};

// --- Yardımcı: ekrandaki (screen) noktayı dünya (gx,gy) hücresine çevir ---
function screenToGrid(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  // canvas içindeki ekran koordinatı
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  // Zoom + offset’i kaldır, dünya koordinatı
  const wx = (sx - offsetX) / zoomLevel;
  const wy = (sy - offsetY) / zoomLevel;
  // Hücre indisine dön
  const gx = Math.floor(wx / CELL_SIZE);
  const gy = Math.floor(wy / CELL_SIZE);
  return { gx, gy };
}

function togglePalette() {
  paletteOpen = !paletteOpen;
  colorPalette.style.display = paletteOpen ? "flex" : "none";
  console.log("palet: "+ paletteOpen)
}

// --- Renk Seçim Paleti ---
function createColorSwatches(){
  colors.forEach(color => {
    const swatch = document.createElement("div");

    swatch.style.width = "30px";  
    swatch.style.height = "30px";  
    swatch.style.borderRadius = "4px";  
    swatch.style.cursor = "pointer";  
    swatch.style.backgroundColor = color;  
    swatch.title = color;  
    colorPalette.appendChild(swatch);  
    
    swatch.addEventListener("click", () => {  
      selectedColor = color;  
      colorButton.style.backgroundColor = selectedColor;  
      colorPalette.style.display = "none";  // Paleti kapat  
        
    });

  });
}

colorButton.addEventListener("click", togglePalette);

// Paleti yarat
createColorSwatches();

// Kamera fazla uzaklaşamasın
function clampCamera() {
  const maxOffsetX = canvas.width  / 2;
  const maxOffsetY = canvas.height / 2;
  const worldScreenW = GRID_CELLS * CELL_SIZE * zoomLevel;
  const worldScreenH = GRID_CELLS * CELL_SIZE * zoomLevel;

  // X sınırları
  const minX = -worldScreenW + maxOffsetX;
  const maxX = maxOffsetX;
  offsetX = Math.min(maxX, Math.max(minX, offsetX));

  // Y sınırları
  const minY = -worldScreenH + maxOffsetY;
  const maxY = maxOffsetY;
  offsetY = Math.min(maxY, Math.max(minY, offsetY));
}

//Oyunu Kaydet
function saveGame() {
  const saveData = {
    pixels,
    zoomLevel,
    offsetX,
    offsetY,
    puan,
    lastExit: Date.now() // 🕒 zamanı kaydet
  };
  localStorage.setItem("pixstrideSave", JSON.stringify(saveData));
}

//Oyunu Yükle
function loadGame() {
  const saveData = localStorage.getItem("pixstrideSave");
  if (saveData) {
    const data = JSON.parse(saveData);
    Object.assign(pixels, data.pixels || {});
    zoomLevel = data.zoomLevel || 1;
    offsetX = data.offsetX || 0;
    offsetY = data.offsetY || 0;
    puan = data.puan || 100;

    // 🧠 Cooldown zamanı hesapla  
    const now = Date.now();  
    const then = data.lastExit || now;  
    const secondsPassed = Math.floor((now - then) / 1000);  

    // 🧪 Puanı arttır  
    puan = Math.min(100, puan + secondsPassed);  
    puanDiv.innerHTML = "Puan: "+puan;
  }
}

// --- Tüm gridi ve pikselleri çizer ---
function draw() {
  // 1) Reset → temizle
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 2) world→screen transform
  ctx.setTransform(zoomLevel,0,0,zoomLevel,offsetX,offsetY);

  // 3) Pikselleri koy
  for (let key in pixels){
    const [x,y] = key.split(",").map(Number);
    ctx.fillStyle = pixels[key];
    ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  // 4) Grid çiz (piksellerin üstünde olacak)
  if(zoomLevel >= 0.7) {
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 0.5/zoomLevel;
    for (let y=0; y<GRID_CELLS; y++){
      for (let x=0; x<GRID_CELLS; x++){
        const px = x*CELL_SIZE, py = y*CELL_SIZE;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // 5) Kalın sabit grid sınırı (en üstte)
  ctx.lineWidth = 3 / zoomLevel; // zoom'a göre sabit kalınlık
  ctx.strokeStyle = "#000"; // siyah çizgi
  ctx.strokeRect(0, 0, GRID_CELLS * CELL_SIZE, GRID_CELLS * CELL_SIZE);
}

//cooldown
function startCooldown() {
  if(cooldown) {
    clearTimeout(cooldown)
  }

  //cooldown ayarlama timeoutu
  cooldown = setTimeout(() => {
    if(puan < 100 && puan >= 0) {
      puan += 1;
      puanDiv.innerHTML = "Puan: "+puan
      startCooldown()
    }
  }, 1000)
}

// --- Piksele tıklayınca boya ---
canvas.addEventListener("click", e => {
  const {gx, gy} = screenToGrid(e.clientX, e.clientY);
  if (puan <= 100 && puan > 0 && zoomLevel >= 0.5) {
    // Sınır kontrolü
    if (gx < 0 || gy < 0 || gx >= GRID_CELLS || gy >= GRID_CELLS) return;

    const key = `${gx},${gy}`;  
    if (pixels[key] === selectedColor) {  
      return; // Aynı renk varsa hiçbir şey yapma  
    }  

    pixels[key] = selectedColor;  
    puan -= 1;  
    puanDiv.innerHTML = "Puan: " + puan;  

    startCooldown(); // sadece burada başlat  
    saveGame();  
    draw();
  }
});

// --- Basılı tutup renk seçme (500ms) ---
let pressTimer = null;

canvas.addEventListener("mousedown", (e) => {
  pressTimer = setTimeout(() => {
    const { gx, gy } = screenToGrid(e.clientX, e.clientY);
    if (gx < 0 || gy < 0 || gx >= GRID_CELLS || gy >= GRID_CELLS) return;

    const key = `${gx},${gy}`;
    const color = pixels[key];

    if (color) {
      selectedColor = color;
      colorButton.style.backgroundColor = selectedColor;
      colorPalette.style.display = "none"; // paleti kapat
    }

    pressTimer = null; // timerı sıfırla
  }, 500);
});

canvas.addEventListener("mouseup", (e) => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;

    // Basılı tutma olmadan klik yapıldıysa normal boyama işlemi:
    const { gx, gy } = screenToGrid(e.clientX, e.clientY);
    if (
      puan <= 100 &&
      puan > 0 &&
      zoomLevel >= 0.5 &&
      gx >= 0 &&
      gy >= 0 &&
      gx < GRID_CELLS &&
      gy < GRID_CELLS
    ) {
      const key = `${gx},${gy}`;
      if (pixels[key] === selectedColor) {
        return; // Aynı renkse değişiklik yok
      }

      pixels[key] = selectedColor;
      puan -= 1;
      puanDiv.innerHTML = "Puan: " + puan;

      startCooldown();
      saveGame();
      draw();
    }
  }
});

// Aynı işlemi dokunmatik cihazlar için yapalım
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    pressTimer = setTimeout(() => {
      const { gx, gy } = screenToGrid(touch.clientX, touch.clientY);
      if (gx < 0 || gy < 0 || gx >= GRID_CELLS || gy >= GRID_CELLS) return;

      const key = `${gx},${gy}`;
      const color = pixels[key];

      if (color) {
        selectedColor = color;
        colorButton.style.backgroundColor = selectedColor;
        colorPalette.style.display = "none";
      }

      pressTimer = null;
    }, 500);
  }
});

canvas.addEventListener("touchend", (e) => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;

    // Dokunma kısa ise normal boyama yap
    // touchend eventinde touch koordinatları yok, bu yüzden last touch coords tutmalıyız.
    // Ancak basit tutarak sadece normal klik yapıldığı varsayalım, aşağıdaki örnek temel olarak bırakıldı.
  }
});

// --- Zoom In / Out (merkeze göre) ---
function doZoom(factor){
  // Merkez ekran koordinatı
  const cx = canvas.width/2, cy = canvas.height/2;
  // Merkezin dünya koordinatı
  const wx = (cx - offsetX)/zoomLevel;
  const wy = (cy - offsetY)/zoomLevel;
  // Zoom güncelle
  zoomLevel *= factor;
  zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel));
  // Offset’i yeniden hesapla ki merkez hep aynı dünya noktasını göstersin
  offsetX = cx - wx*zoomLevel;
  offsetY = cy - wy*zoomLevel;
  clampCamera();
  saveGame();
  draw();
}

zoomInBtn.addEventListener ("click", ()=> doZoom(ZOOM_FACTOR));
zoomOutBtn.addEventListener("click", ()=> doZoom(1/ZOOM_FACTOR));

function startZoom(dir) {
  clearInterval(zoomInt);
  zoomInt = setInterval(() => {
    if (dir === "in") {
      doZoom(ZOOM_FACTOR);
      saveGame();
    } else if (dir === "out") {
      doZoom(1 / ZOOM_FACTOR);
      saveGame();
    }
  }, 60); // daha yumuşak ve kontrollü zoom
}

function stopZoom() {
  clearInterval(zoomInt);
  saveGame();
}

// --- Kamera hareketi ---
function startMove(dir){
  clearInterval(moveInt);
  moveInt = setInterval(()=>{
    if(dir==="up")    offsetY += MOVE_SPEED;
    if(dir==="down")  offsetY -= MOVE_SPEED;
    if(dir==="left")  offsetX += MOVE_SPEED;
    if(dir==="right") offsetX -= MOVE_SPEED;
    clampCamera();
    saveGame();
    draw();
  }, 16);
}
function stopMove(){
  clearInterval(moveInt);
  saveGame();
}

//butona bir kez basma
let dirs = ["up", "left", "down", "right"]
dirs.forEach(dir => {
  document.getElementById(dir).addEventListener("click", () => {
    if(dir==="up")    offsetY += MOVE_SPEED;
    if(dir==="down")  offsetY -= MOVE_SPEED;
    if(dir==="left")  offsetX += MOVE_SPEED;
    if(dir==="right") offsetX -= MOVE_SPEED;
    clampCamera();
    saveGame();
    draw();
  });
})

// buton olayları
upBtn.addEventListener   ("mousedown", ()=> startMove("up"));
upBtn.addEventListener   ("mouseup",   stopMove);

downBtn.addEventListener ("mousedown", ()=> startMove("down"));
downBtn.addEventListener ("mouseup",   stopMove);

leftBtn.addEventListener ("mousedown", ()=> startMove("left"));
leftBtn.addEventListener ("mouseup",   stopMove);

rightBtn.addEventListener("mousedown", ()=> startMove("right"));
rightBtn.addEventListener("mouseup",   stopMove);

zoomInBtn.addEventListener("mousedown", () => startZoom("in"));
zoomInBtn.addEventListener("mouseup", stopZoom);

zoomOutBtn.addEventListener("mousedown", () => startZoom("out"));
zoomOutBtn.addEventListener("mouseup", stopZoom);

//Mobil destek
upBtn.addEventListener   ("touchstart", ()=> startMove("up"));
upBtn.addEventListener   ("touchend",   stopMove);

downBtn.addEventListener ("touchstart", ()=> startMove("down"));
downBtn.addEventListener ("touchend",   stopMove);

leftBtn.addEventListener ("touchstart", ()=> startMove("left"));
leftBtn.addEventListener ("touchend",   stopMove);

rightBtn.addEventListener("touchstart", ()=> startMove("right"));
rightBtn.addEventListener("touchend",   stopMove);

zoomInBtn.addEventListener("touchstart", () => startZoom("in"));
zoomInBtn.addEventListener("touchend", stopZoom);

zoomOutBtn.addEventListener("touchstart", () => startZoom("out"));
zoomOutBtn.addEventListener("touchend", stopZoom);



// ilk çizim
draw();
