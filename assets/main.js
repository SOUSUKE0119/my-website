// メインJavaScript

// 必要な関数を定義
function myFunction() {
    console.log('myFunction が呼び出されました');
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // コンソールログ（開発用）
    console.log('SOUSUKEの活動紹介サイトが読み込まれました');
    
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