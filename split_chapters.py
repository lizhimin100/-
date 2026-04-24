import re
import os

# 读取txt文件
with open(r'4-正文\第1卷  初来乍到.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有章节标题
pattern = r'^(第\d+章[^\n]*)'
chapters = []
matches = list(re.finditer(pattern, content, re.MULTILINE))

print(f"找到 {len(matches)} 个章节")

for i, match in enumerate(matches):
    chapter_title = match.group(1).strip()
    start_pos = match.start()
    
    # 计算章节内容的结束位置
    if i < len(matches) - 1:
        end_pos = matches[i + 1].start()
    else:
        end_pos = len(content)
    
    # 提取章节内容
    chapter_content = content[start_pos:end_pos].strip()
    
    # 章节编号
    chapter_num = i + 1
    
    # 保存为md文件
    if chapter_num <= 12:
        print(f"跳过第{chapter_num}章（已存在）")
        continue
    
    filename = f'4-正文/第{chapter_num}章.md'
    
    # 写入文件
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"# {chapter_title}\n\n")
        # 添加章节内容，去掉标题行（因为已经在#中了）
        lines = chapter_content.split('\n')
        if len(lines) > 0:
            # 跳过第一行（章节标题在文件开头）
            f.write('\n'.join(lines[1:]).strip())
    
    print(f"已创建: {filename} - {chapter_title}")

print(f"\n完成！共创建了 {len(matches) - 12} 个新章节文件")