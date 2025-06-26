// structure_map.js

window.addEventListener('load', () => {
  const files = [
    'chat.js',
    'architect.js',
    'deepseek.js',
    'saveToDrive.js',
    'backup-all.js'
  ];

  const functions = [
    'sendMessageToZiggi',
    'handleArchitectMessage',
    'saveToDrive',
    'createBackup'
  ];

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '10px';
  container.style.left = '10px';
  container.style.backgroundColor = '#111';
  container.style.color = '#fff';
  container.style.padding = '10px';
  container.style.fontFamily = 'monospace';
  container.style.zIndex = 9999;
  container.style.border = '1px solid #555';
  container.innerHTML = '<strong>🛠️ STRUCTURE MAP</strong><br>';

  // Проверка файлов через теги script
  const scriptTags = Array.from(document.getElementsByTagName('script'));
  const scriptSources = scriptTags.map(s => s.src);

  files.forEach(file => {
    const found = scriptSources.some(src => src.includes(file));
    const status = found ? '✅ подключён' : '❌ не найден';
    container.innerHTML += `${file}: ${status}<br>`;
  });

  // Проверка функций
  functions.forEach(fn => {
    const status = typeof window[fn] === 'function' ? '✅ определена' : '❌ отсутствует';
    container.innerHTML += `${fn}(): ${status}<br>`;
  });

  document.body.appendChild(container);
});

