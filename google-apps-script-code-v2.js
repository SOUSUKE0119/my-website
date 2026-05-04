// Googleスプレッドシート 材料マスタAPI (CORS対応版)
// このコードをGoogle Apps Scriptエディタに貼り付けてください
//
// 重要: このバージョンは全ての操作をGETリクエストで処理します
// これによりCORS preflightを回避し、ブラウザからの直接アクセスが可能になります

const SHEET_NAME = '材料マスタ';

// GETリクエスト: 全ての操作を処理
function doGet(e) {
  try {
    const action = e.parameter.action || 'get';
    const location = e.parameter.location;

    if (!location) {
      return createResponse({ error: 'location parameter is required' }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // アクション別処理
    if (action === 'get') {
      // 材料データ取得
      return getMaterials(sheet, location);

    } else if (action === 'add') {
      // 材料追加
      return addMaterial(sheet, location, e.parameter);

    } else if (action === 'delete') {
      // 材料削除
      return deleteMaterial(sheet, location, e.parameter.id);

    } else if (action === 'sync') {
      // 一括同期
      return syncMaterials(sheet, location, e.parameter.materials);

    } else {
      return createResponse({ error: 'Invalid action' }, 400);
    }

  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// 材料データ取得
function getMaterials(sheet, location) {
  const data = sheet.getDataRange().getValues();
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
}

// 材料追加
function addMaterial(sheet, location, params) {
  const id = params.id || new Date().getTime().toString();
  const name = params.name;
  const price = parseFloat(params.price);
  const quantity = parseFloat(params.quantity);
  const unit = params.unit;

  if (!name || !price || !quantity || !unit) {
    return createResponse({ error: 'Missing required fields' }, 400);
  }

  sheet.appendRow([
    id,
    location,
    name,
    price,
    quantity,
    unit
  ]);

  return createResponse({ success: true, id: id });
}

// 材料削除
function deleteMaterial(sheet, location, id) {
  if (!id) {
    return createResponse({ error: 'id parameter is required' }, 400);
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id && data[i][1] === location) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }

  return createResponse({ error: 'Material not found' }, 404);
}

// 一括同期
function syncMaterials(sheet, location, materialsJSON) {
  if (!materialsJSON) {
    return createResponse({ error: 'materials parameter is required' }, 400);
  }

  let materials;
  try {
    materials = JSON.parse(materialsJSON);
  } catch (error) {
    return createResponse({ error: 'Invalid JSON in materials parameter' }, 400);
  }

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

  return createResponse({ success: true, count: materials.length });
}

// レスポンス作成ヘルパー
function createResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
