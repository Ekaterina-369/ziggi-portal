const { google } = require("googleapis");

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const fullText = body.text || "";

    // Распознаём команду: Сохрани в [название папки]: [текст]
    const match = fullText.match(/^Сохрани в ([^:]+):\s*(.+)$/i);
    if (!match) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Фраза должна быть в формате: Сохрани в [папка]: [текст]" }),
      };
    }

    const inputName = match[1].trim();
    const content = match[2].trim();

    // Преобразуем человеко-понятные названия в названия папок
    const folderMap = {
      "Жевачку": "Память Зигги",
      "Память Зигги": "Память Зигги",
      "Книгу": "Книга",
      "Книга": "Книга",
      "Идеи": "Идеи",
      "Модули": "Модули проекта",
      "Модули проекта": "Модули проекта",
      "Ченнелинги": "Ченнелинги"
    };

    const folderName = folderMap[inputName];
    if (!folderName) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Неизвестное имя папки: ${inputName}` }),
      };
    }

    const fileName = `${folderName} — ${new Date().toLocaleString("ru-RU")}.txt`;

    // Авторизация
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const jwt = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth: jwt });

    // Ищем ID нужной папки
    const folderRes = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
    });

    const folderId = folderRes.data.files[0]?.id;
    if (!folderId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Папка '${folderName}' не найдена.` }),
      };
    }

    // Создаём новый текстовый файл
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
      body: JSON.stringify({
        message: `Я всё сохранил в '${folderName}'. Файл: '${fileName}'. Если нужно — найду его для тебя.`,
      }),
    };

} catch (error) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: `Ошибка: ${error.message}`,
      stack: error.stack
    })
  };
}
