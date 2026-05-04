// Googleスプレッドシート 材料マスタAPI
// このコードをGoogle Apps Scriptエディタに貼り付けてください

const SHEET_NAME = '材料マスタ';

// GETリクエスト: 材料データ取得
function doGet(e) {
  try {
    const location = e.parameter.location;

    if (!location) {
      return createResponse({ error: 'location parameter is required' }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // ヘッダー行を除外
    const headers = data[0];
    const materials = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // 空行をスキップ
      if (!row[0]) continue;

      // 指定された拠点のデータのみ取得
      if (row[1] === location) {
        materials.push({
          id: row[0],
          location: row[1],
          name: row[2],
          price: row[3],
          quantity: row[4],
          unit: row[5]
        });
      }
    }

    return createResponse({ materials: materials });

  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// POSTリクエスト: 材料データ追加・更新・削除
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const location = params.location;

    if (!location) {
      return createResponse({ error: 'location parameter is required' }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (action === 'add') {
      // 材料追加
      const material = params.material;
      const id = material.id || new Date().getTime();

      sheet.appendRow([
        id,
        location,
        material.name,
        material.price,
        material.quantity,
        material.unit
      ]);

      return createResponse({ success: true, id: id });

    } else if (action === 'update') {
      // 材料更新
      const material = params.material;
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == material.id && data[i][1] === location) {
          sheet.getRange(i + 1, 1, 1, 6).setValues([[
            material.id,
            location,
            material.name,
            material.price,
            material.quantity,
            material.unit
          ]]);
          return createResponse({ success: true });
        }
      }

      return createResponse({ error: 'Material not found' }, 404);

    } else if (action === 'delete') {
      // 材料削除
      const id = params.id;
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id && data[i][1] === location) {
          sheet.deleteRow(i + 1);
          return createResponse({ success: true });
        }
      }

      return createResponse({ error: 'Material not found' }, 404);

    } else if (action === 'sync') {
      // 一括同期（ローカルの全材料を送信して上書き）
      const materials = params.materials;
      const data = sheet.getDataRange().getValues();

      // 既存の同じ拠点のデータを削除
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][1] === location) {
          sheet.deleteRow(i + 1);
        }
      }

      // 新しいデータを追加
      materials.forEach(material => {
        sheet.appendRow([
          material.id,
          location,
          material.name,
          material.price,
          material.quantity,
          material.unit
        ]);
      });

      return createResponse({ success: true });
    }

    return createResponse({ error: 'Invalid action' }, 400);

  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// レスポンス作成ヘルパー（CORS対応）
function createResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// CORS対応のためのOPTIONSリクエスト処理
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
