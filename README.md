# PixStrideForge 
## (ilk test versiyonu)

## Bu proje hakkında

Bu proje, [Pixel Planet](https://pixelplanet.fun)'ten ilham alınarak geliştirilmiştir.  
Hiçbir şekilde orijinal oyunun kodlarını veya varlıklarını (görsel, ses vb.) kullanmamaktadır.  
Amaç, HTML Canvas ve JavaScript pratiği yapmaktır.

Bu projede pixelplanet.fun sitesine benzer şekilde ilham alınarak ama kodları çalmadan ve kullanmadan cooldownlu bir oyun yapmaya çalıştım. Projenin pixelplanet lisansını ihlal etme gibi bir amacı yoktur ve eğlencesine yapılmıştır. Ticari amaçla kullanılmayacaktır. Yapay zekadan çokça yardım almakla beraber proje şunları içeriyor:

• Zoom ve Hareket için butonlar

• 100'e kadar biriktirilebilir her saniye artan puan

• her pixel atışta 1 puanın gitmesi

• renk paleti ve renk seçme sistemi

• bir pixele basılı tutunca rengini alma

• pixelleri kaydetme

---

tavsiye: mapi sıfırlamak istiyorsanız JavaScript'e aşağıdaki kodu girebilirsiniz

```javascript
function resetGame() {
  pixels = {};
  puan = 100;
  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;

  localStorage.removeItem("pixstrideSave"); // Kaydı sil
  puanDiv.innerHTML = "Puan: " + puan;

  draw();
  saveGame(); // Sıfırlanmış durumu kaydet
}
resetGame()
```


*koddaki hataların farkındayım, test amaçlı bir projedir ve eğlencesine yapılmıştır*
discord: @legender16
