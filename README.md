# PixStrideForge  
### (İlk Test Sürümü – Alpha)

## 📌 Hakkında

Bu proje, [Pixel Planet](https://pixelplanet.fun) sitesinden esinlenerek HTML Canvas ve JavaScript öğrenme amacıyla geliştirilmiştir.  
Proje tamamen kendi ellerimle sıfırdan kodlanmıştır ve **orijinal oyunun hiçbir kodu veya varlığı (görsel, ses vb.) kullanılmamıştır**.

Ticari bir amacı yoktur, yalnızca kişisel öğrenim ve eğlence içindir. Herhangi bir lisans ihlali yapılmaması için özen gösterilmiştir.

## 🔧 Özellikler

- 📌 Zoom ve hareket kontrol butonları  
- 🕒 Her saniye 1 puan artışı, 100’e kadar birikme  
- 🎯 Her piksel atışında 1 puan harcama  
- 🎨 Renk paleti ve seçici  
- 🧲 Bir piksele tıklayarak rengini alma  
- 💾 Kaydetme ve yükleme sistemi (localStorage)

## 🔁 Haritayı Sıfırlamak İçin

Tarayıcı konsoluna (F12 > Console sekmesi) şu kodu yazabilirsiniz:

```javascript
function resetGame() {
  pixels = {};
  puan = 100;
  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;

  localStorage.removeItem("pixstrideSave");
  puanDiv.innerHTML = "Puan: " + puan;

  draw();
  saveGame();
}
resetGame()
```

⚠️ Not

Bu proje tamamen test amaçlıdır. Kod yapısı basit tutulmuştur ve hatalar içerebilir.
Geliştirme sürecinde yapay zekadan (özellikle ChatGPT) yardım alınmıştır.

📬 İletişim

Her türlü öneri veya geri bildirim için bana ulaşabilirsiniz:

💬 Discord: @legender16
