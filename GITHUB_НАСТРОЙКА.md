# Команды по порядку: создать репозиторий и добавить проект на GitHub

Сначала один раз создайте пустой репозиторий на GitHub, затем выполните команды в терминале Cursor по порядку.

---

## Шаг 0: Один раз создать репозиторий на GitHub

1. Откройте **https://github.com/new**
2. **Repository name:** `source_research` (или другое имя без пробелов)
3. **Public**, без README / .gitignore / license
4. Нажмите **Create repository**

---

## Команды в терминале Cursor (по порядку)

Выполняйте в терминале Cursor (**Terminal → New Terminal**). Подставьте вместо `ВАШ_ЛОГИН` и `source_research` свой логин и имя репозитория.

**1. Перейти в папку проекта**
```bash
cd "c:\Users\User\Documents\GitHub\source_research"
```

**2. Привязать удалённый репозиторий**
```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/source_research.git
```

**3. Отправить проект на GitHub**
```bash
git push -u origin main
```

При запросе авторизации войдите в GitHub (логин и пароль или токен). После этого весь проект окажется в репозитории на GitHub.
