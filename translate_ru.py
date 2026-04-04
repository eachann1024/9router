#!/usr/bin/env python3
import json
import re

# Translation mapping from Chinese to Russian
translations = {
    # Numbers and time
    "24小时": "24 часа",
    "天前": "дн. назад",
    "小时前": "ч. назад",
    "分钟前": "мин. назад",
    "刚刚": "только что",
    "今天": "Сегодня",
    "明天": "Завтра",
    "从未": "Никогда",
    "现在": "Сейчас",
    
    # Common actions
    "添加": "Добавить",
    "创建": "Создать",
    "删除": "Удалить",
    "编辑": "Редактировать",
    "保存": "Сохранить",
    "取消": "Отменить",
    "确认": "Подтвердить",
    "关闭": "Закрыть",
    "复制": "Копировать",
    "刷新": "Обновить",
    "搜索": "Поиск",
    "选择": "Выбрать",
    "启用": "Включить",
    "禁用": "Отключить",
    "测试": "Тест",
    "连接": "Подключить",
    "断开": "Отключить",
    "导入": "Импорт",
    "导出": "Экспорт",
    "上传": "Загрузить",
    "下载": "Скачать",
    "继续": "Продолжить",
    "重试": "Повторить",
    "应用": "Применить",
    "重置": "Сбросить",
    "清除": "Очистить",
    "移除": "Удалить",
    "更新": "Обновить",
    "发送": "Отправить",
    "提交": "Отправить",
    "返回": "Назад",
    "下一页": "Далее",
    "上一页": "Назад",
    "完成": "Готово",
    "完毕": "Готово",
    
    # Status
    "成功": "Успешно",
    "失败": "Ошибка",
    "错误": "Ошибка",
    "警告": "Предупреждение",
    "信息": "Информация",
    "已连接": "Подключено",
    "未连接": "Не подключено",
    "已启用": "Включено",
    "已禁用": "Отключено",
    "运行中": "Работает",
    "已停止": "Остановлено",
    "加载中": "Загрузка",
    "处理中": "Обработка",
    "等待中": "Ожидание",
    "可用": "Доступно",
    "不可用": "Недоступно",
    "有效": "Действителен",
    "无效": "Недействителен",
    "活跃": "Активно",
    "不活跃": "Неактивно",
    
    # Common nouns
    "模型": "Модель",
    "提供商": "Провайдер",
    "连接": "Подключение",
    "配置": "Конфигурация",
    "设置": "Настройки",
    "密钥": "Ключ",
    "令牌": "Токен",
    "代理": "Прокси",
    "服务器": "Сервер",
    "端点": "Конечная точка",
    "请求": "Запрос",
    "响应": "Ответ",
    "日志": "Журнал",
    "错误": "Ошибка",
    "详情": "Подробности",
    "状态": "Статус",
    "类型": "Тип",
    "名称": "Имя",
    "描述": "Описание",
    "版本": "Версия",
    "文档": "Документация",
    "帮助": "Справка",
    "支持": "Поддержка",
    "账户": "Аккаунт",
    "用户": "Пользователь",
    "密码": "Пароль",
    "邮箱": "Email",
    "语言": "Язык",
    "主题": "Тема",
    "安全": "Безопасность",
    "隐私": "Конфиденциальность",
    "费用": "Стоимость",
    "成本": "Стоимость",
    "定价": "Цены",
    "配额": "Квота",
    "使用情况": "Использование",
    "统计": "Статистика",
    "历史": "История",
    "网络": "Сеть",
    "数据库": "База данных",
    "备份": "Резервная копия",
    "文件": "Файл",
    "终端": "Терминал",
    "桌面": "Рабочий стол",
    "组合": "Комбинация",
    "代理池": "Пул прокси",
    "隧道": "Туннель",
    "证书": "Сертификат",
    "认证": "Аутентификация",
    "授权": "Авторизация",
    "输入": "Ввод",
    "输出": "Вывод",
    "缓存": "Кэш",
    "延迟": "Задержка",
    "超时": "Таймаут",
    "冷却": "Кулдаун",
    "优先级": "Приоритет",
    "限制": "Лимит",
    "格式": "Формат",
    "内容": "Содержимое",
    "消息": "Сообщение",
    "通知": "Уведомление",
    "聊天": "Чат",
    "对话": "Диалог",
    "助手": "Ассистент",
    "工具": "Инструмент",
    "功能": "Функция",
    "特征": "Функция",
    "资源": "Ресурсы",
    "产品": "Продукт",
    "公司": "Компания",
    "博客": "Блог",
    "联系": "Контакт",
    "关于": "О программе",
    "其他": "Другое",
    "全部": "Все",
    "无": "Нет",
    "是": "Да",
    "否": "Нет",
    "未知": "Неизвестно",
}

# Read the Russian JSON file
with open('/Users/eachann/WorkMark/open-source/9router/public/i18n/literals/ru.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Pattern to detect Chinese characters
chinese_pattern = re.compile(r'[\u4e00-\u9fff]')

# Count translations
translated_count = 0
skipped_count = 0

# Process each entry
for key, value in data.items():
    if chinese_pattern.search(value):
        # This entry contains Chinese and needs translation
        # For now, we'll use a simple approach: translate common patterns
        
        # Try to translate based on patterns
        original = value
        
        # Handle variable placeholders
        if '${' in value:
            # Keep variables intact
            parts = re.split(r'(\$\{[^}]+\})', value)
            translated_parts = []
            for part in parts:
                if part.startswith('${'):
                    translated_parts.append(part)
                elif chinese_pattern.search(part):
                    # Translate this part
                    trans = part
                    for cn, ru in translations.items():
                        trans = trans.replace(cn, ru)
                    translated_parts.append(trans)
                else:
                    translated_parts.append(part)
            data[key] = ''.join(translated_parts)
        else:
            # Simple translation
            trans = value
            for cn, ru in translations.items():
                trans = trans.replace(cn, ru)
            
            # If still contains Chinese, mark for manual review
            if chinese_pattern.search(trans):
                skipped_count += 1
            else:
                data[key] = trans
                translated_count += 1

print(f"Translated: {translated_count}")
print(f"Needs manual review: {skipped_count}")

# Write back to file
with open('/Users/eachann/WorkMark/open-source/9router/public/i18n/literals/ru.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)

print("File updated successfully!")
