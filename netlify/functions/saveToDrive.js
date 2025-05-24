const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const fullText = body.text || "";

    // Парсим команду
    const match = fullText.match(/^Сохрани в ([^:]+):\s*(.+)$/i);
    if (!match) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Фраза должна быть в формате: Сохрани в [папка]: [текст]" }),
      };
    }

    const folderName = match[1].trim();
    const content = match[2].trim();
    const fileName = `${folderName} — ${new Date().toLocaleString("ru-RU")}.txt`;

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const jwt = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth: jwt });

    const folderRes = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
    });

    const folderId = folderRes.data.files[0]?.id;
    if (!folderId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Папка '${folderName}' не найдена.` }),
      };
    }

    await drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: "text/plain",
        body: content,
      },
      fields: "id",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Сохранено в '${folderName}' как '${fileName}'` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
