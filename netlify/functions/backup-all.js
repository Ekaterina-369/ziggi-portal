const { exec } = require("child_process");

exports.handler = async function(event, context) {
  return new Promise((resolve) => {
    exec("git add . && git commit -m 'Резервная копия проекта перед изменением'", (err, stdout, stderr) => {
      if (err) {
        return resolve({ statusCode: 500, body: JSON.stringify({ error: stderr }) });
      }
      resolve({ statusCode: 200, body: JSON.stringify({ message: "Файлы сохранены в GitHub" }) });
    });
  });
};
