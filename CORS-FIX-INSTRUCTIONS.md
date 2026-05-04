# CORS問題の解決手順

## 問題の原因

ブラウザからGoogle Apps ScriptにPOSTリクエストを送信すると、CORS (Cross-Origin Resource Sharing) のpreflight checkが実行され、ブラウザがリクエストをブロックしていました。

## 解決方法

すべての操作（追加・削除・同期）をGETリクエストに変更しました。GETリクエストはCORS preflightをトリガーしないため、ブラウザから直接アクセスできます。

---

## セットアップ手順

### ステップ1: Apps Scriptコードを更新

1. **Google Apps Scriptエディタを開く**
   - スプレッドシートで「拡張機能」→「Apps Script」

2. **既存のコードを全て削除**
   - エディタ内のコードを全て選択して削除

3. **新しいコードを貼り付け**
   - `google-apps-script-code-v2.js` の内容を全てコピー
   - Apps Scriptエディタに貼り付け
   - 「保存」アイコンをクリック（💾）

### ステップ2: 新しくデプロイ

1. **新しいデプロイを作成**
   - 「デプロイ」→「新しいデプロイ」をクリック
   - 「種類の選択」（歯車アイコン）→「ウェブアプリ」を選択

2. **設定**
   - **説明**: CORS対応版（任意）
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: **全員**

3. **デプロイ**
   - 「デプロイ」をクリック
   - 承認が必要な場合: 「アクセスを承認」→ Googleアカウントでログイン→「許可」

4. **新しいURLをコピー**
   - デプロイ完了後、「ウェブアプリ」のURLが表示されます
   - このURLをコピー（例: `https://script.google.com/macros/s/AKfycby.../exec`）

### ステップ3: HTMLファイルのURL更新

1. **`genka-kanri.html` を開く**

2. **URLを更新**
   - 180行目付近を探す：
   ```javascript
   const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzLpdJP...';
   ```

   - ステップ2でコピーした新しいURLに置き換え：
   ```javascript
   const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/新しいURL/exec';
   ```

3. **保存**

---

## 動作確認

### 1. ブラウザで開く

```bash
cd /Users/hiraisousuke/my-website
python3 -m http.server 8000
```

ブラウザで http://localhost:8000/genka-kanri.html を開く

### 2. 材料追加テスト

1. 「材料マスタ」タブを開く
2. 材料を登録（例: いちご、3000円、1000g）
3. エラーなく登録できることを確認
4. Googleスプレッドシートを開いて、データが追加されているか確認

### 3. CSV一括登録テスト

1. 「📥 CSVテンプレート」をダウンロード
2. Excelで開いて数行追加
3. CSV形式で保存
4. 「📄 CSV一括登録」でインポート
5. スプレッドシートに反映されているか確認

### 4. 同期テスト

1. ヘッダーの「📊 同期」ボタンをクリック
2. 「材料マスタを同期しました (X件)」と表示されることを確認

---

## トラブルシューティング

### エラーが出る場合

1. **ブラウザの開発者ツールを開く（F12）**
   - Console タブでエラーメッセージを確認

2. **よくあるエラー**

   **「location parameter is required」**
   - 拠点が選択されていない
   - ページをリロードして拠点を選択

   **「Invalid JSON in materials parameter」**
   - データ形式エラー
   - ブラウザのlocalStorageをクリアしてやり直す

   **「Material not found」**
   - 削除しようとした材料がスプレッドシートに存在しない
   - スプレッドシートを直接確認

3. **Apps Script実行履歴を確認**
   - Apps Scriptエディタで「実行数」をクリック
   - doGetが実行されているか確認
   - エラーログがあれば確認

### スプレッドシートに反映されない

1. **シート名を確認**
   - シート名が「材料マスタ」になっているか

2. **ヘッダー行を確認**
   - 1行目: id | 拠点 | 材料名 | 仕入単価 | 容量 | 単位

3. **デプロイ設定を確認**
   - 「アクセスできるユーザー」が「全員」になっているか

---

## 変更点の詳細

### フロントエンド（genka-kanri.html）

#### Before (POST - CORSエラー)
```javascript
const response = await fetch(GOOGLE_SHEET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'add',
        location: 'ほうせき箱',
        material: { id: 123, name: 'いちご', price: 3000, quantity: 1000, unit: 'g' }
    })
});
```

#### After (GET - CORS問題なし)
```javascript
const params = new URLSearchParams({
    action: 'add',
    location: 'ほうせき箱',
    id: 123,
    name: 'いちご',
    price: 3000,
    quantity: 1000,
    unit: 'g'
});
const response = await fetch(`${GOOGLE_SHEET_API_URL}?${params.toString()}`);
```

### バックエンド（google-apps-script-code-v2.js）

- `doPost()`を削除
- `doGet()`で全ての操作を処理
- `action`パラメータで操作を分岐（get/add/delete/sync）

---

## Netlifyへの再デプロイ

```bash
cd /Users/hiraisousuke/my-website
git add .
git commit -m "Fix CORS issue by using GET requests instead of POST"
git push origin main
```

Netlifyが自動的に再デプロイします。

---

**最終更新: 2026年5月4日**
**CORS問題: 解決済み ✅**
