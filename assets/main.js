// メインJavaScript

// 必要な関数を定義
function myFunction() {
    console.log('myFunction が呼び出されました');
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // コンソールログ（開発用）
    console.log('SOUSUKEの活動紹介サイトが読み込まれました');
    
    // Instagram画像のエラーハンドリング
    const instagramImages = document.querySelectorAll('.instagram-image');
    
    instagramImages.forEach(function(img) {
        img.addEventListener('error', function() {
            console.error('画像の読み込みに失敗しました:', this.src);
            this.style.backgroundColor = '#f3f4f6';
            this.style.display = 'block';
        });
        
        img.addEventListener('load', function() {
            console.log('画像が正常に読み込まれました:', this.src);
        });
    });
    
    // 外部リンクの処理
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 既存の動作はそのまま
        });
    });
});

// スクロール効果
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // ヘッダーのパララックス効果
    const header = document.querySelector('header');
    if (header) {
        header.style.transform = `translateY(${rate * 0.1}px)`;
    }
});