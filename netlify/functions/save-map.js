const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = "Ekaterina-369"; // ← замени на свой GitHub логин
  const repo = "ziggi-portal"; // ← замени на имя репозитория
  const filePath = "project_map.json";
  const branch = "main";

  try {
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch
    });

    const fs = require("fs");
    const projectMapContent = fs.readFileSync("project_map.json", "utf8");

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: "Обновлённая карта проекта — подтверждено пользователем",
      content: Buffer.from(projectMapContent).toString("base64"),
      sha: fileData.sha,
      branch
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Карта сохранена в GitHub" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
